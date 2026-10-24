// src/screens/CartScreen.js
// Responsive Cart Screen for Mobile & Desktop Web with Promo codes & Quantity steppers

import React, { useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  TextInput, Alert, useWindowDimensions, Image,
} from 'react-native';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';

export default function CartScreen({ navigation }) {
  const { state, dispatch } = useCart();
  const { theme } = useTheme();
  const { width } = useWindowDimensions();
  const [promoInput, setPromoInput] = useState('');
  const s = styles(theme);

  const { items, promoCode, discountPercent, promoError } = state;
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);

  const handleApplyPromo = () => {
    if (!promoInput.trim()) return;
    dispatch({ type: 'APPLY_PROMO', payload: promoInput });
    setPromoInput('');
  };

  const handleCheckout = () => {
    if (items.length === 0) {
      Alert.alert('Empty Cart', 'Please add items before placing your order.');
      return;
    }
    navigation.navigate('OrderSummary');
  };

  const renderItem = ({ item }) => {
    const itemId = item.id || item._id;
    return (
      <View style={s.card}>
        <View style={s.itemRow}>
          {item.image ? (
            <Image
              source={{ uri: item.image }}
              style={s.itemThumb}
              resizeMode="cover"
            />
          ) : (
            <View style={s.itemThumbPlaceholder}>
              <Text style={{ fontSize: 26 }}>🍽️</Text>
            </View>
          )}

          <View style={s.itemInfo}>
            <View style={s.itemHeader}>
              <Text style={s.itemName} numberOfLines={1}>
                {item.name}
              </Text>
              <TouchableOpacity
                onPress={() => dispatch({ type: 'REMOVE_ITEM', payload: itemId })}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Text style={s.removeBtn}>✕</Text>
              </TouchableOpacity>
            </View>

            <Text style={s.itemPrice}>Rs {item.price} each</Text>

            {/* Quantity Stepper Row */}
            <View style={s.stepperRow}>
              <View style={s.stepper}>
                <TouchableOpacity
                  style={s.stepBtn}
                  onPress={() => dispatch({ type: 'DECREMENT', payload: itemId })}
                  activeOpacity={0.8}
                >
                  <Text style={s.stepBtnText}>−</Text>
                </TouchableOpacity>

                <Text style={s.qty}>{item.quantity}</Text>

                <TouchableOpacity
                  style={s.stepBtn}
                  onPress={() => dispatch({ type: 'INCREMENT', payload: itemId })}
                  activeOpacity={0.8}
                >
                  <Text style={s.stepBtnText}>+</Text>
                </TouchableOpacity>
              </View>

              <Text style={s.lineTotal}>Rs {item.price * item.quantity}</Text>
            </View>
          </View>
        </View>

        {/* Special Instructions Input */}
        <TextInput
          style={s.noteInput}
          placeholder="Special request (e.g. extra sauce, mild spice)"
          placeholderTextColor={theme.placeholder}
          value={item.note}
          onChangeText={(note) =>
            dispatch({ type: 'UPDATE_NOTE', payload: { id: itemId, note } })
          }
        />
      </View>
    );
  };

  return (
    <View style={[s.screen, { backgroundColor: theme.background }]}>
      <View style={s.responsiveContainer}>
        {items.length === 0 ? (
          <View style={s.empty}>
            <View style={s.emptyIconWrap}>
              <Text style={{ fontSize: 48 }}>🛒</Text>
            </View>
            <Text style={s.emptyTitle}>Your cart is empty</Text>
            <Text style={s.emptySubtitle}>
              Explore our artisan menu and add some delicious culinary dishes.
            </Text>
            <TouchableOpacity
              style={s.browseBtn}
              onPress={() => navigation.navigate('Menu')}
              activeOpacity={0.85}
            >
              <Text style={s.browseBtnText}>Explore Menu →</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <FlatList
              data={items}
              keyExtractor={(i) => i.id || i._id}
              renderItem={renderItem}
              contentContainerStyle={s.listContent}
              showsVerticalScrollIndicator={false}
              ListHeaderComponent={
                <View style={s.pageHeader}>
                  <Text style={s.pageTitle}>Your Basket</Text>
                  <Text style={s.pageSubtitle}>
                    {totalItems} item{totalItems !== 1 ? 's' : ''} in cart
                  </Text>
                </View>
              }
              ListFooterComponent={
                <View style={s.promoCard}>
                  <Text style={s.promoTitle}>🎁 Apply Promo Code</Text>
                  {promoCode ? (
                    <View style={s.promoApplied}>
                      <Text style={s.promoSuccessText}>
                        ✓ {promoCode} — {discountPercent}% discount applied!
                      </Text>
                      <TouchableOpacity onPress={() => dispatch({ type: 'REMOVE_PROMO' })}>
                        <Text style={s.removePromoText}>Remove</Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <View style={s.promoRow}>
                      <TextInput
                        style={s.promoInput}
                        placeholder="e.g. WELCOME10"
                        placeholderTextColor={theme.placeholder}
                        value={promoInput}
                        onChangeText={setPromoInput}
                        autoCapitalize="characters"
                      />
                      <TouchableOpacity
                        style={s.applyBtn}
                        onPress={handleApplyPromo}
                        activeOpacity={0.8}
                      >
                        <Text style={s.applyBtnText}>Apply</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                  {promoError ? <Text style={s.promoErrorText}>{promoError}</Text> : null}
                </View>
              }
            />

            {/* Sticky Checkout Bar */}
            <View style={s.footerBar}>
              <View>
                <Text style={s.footerLabel}>Estimated Subtotal</Text>
                <Text style={s.footerTotal}>Rs {subtotal}</Text>
              </View>

              <TouchableOpacity
                style={s.checkoutBtn}
                onPress={handleCheckout}
                activeOpacity={0.85}
              >
                <Text style={s.checkoutText}>Proceed to Checkout →</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>
    </View>
  );
}

const styles = (theme) =>
  StyleSheet.create({
    screen: {
      flex: 1,
    },
    responsiveContainer: {
      flex: 1,
      width: '100%',
      maxWidth: 820,
      alignSelf: 'center',
    },
    pageHeader: {
      paddingHorizontal: 16,
      paddingTop: 16,
      paddingBottom: 10,
    },
    pageTitle: {
      fontSize: 26,
      fontWeight: '900',
      color: theme.text,
      letterSpacing: -0.5,
    },
    pageSubtitle: {
      fontSize: 13,
      color: theme.textSecondary,
      fontWeight: '600',
      marginTop: 2,
    },
    listContent: {
      paddingBottom: 110,
    },
    empty: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 32,
    },
    emptyIconWrap: {
      width: 90,
      height: 90,
      borderRadius: 45,
      backgroundColor: theme.primary + '18',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 16,
    },
    emptyTitle: {
      fontSize: 22,
      fontWeight: '800',
      color: theme.text,
      marginBottom: 6,
    },
    emptySubtitle: {
      fontSize: 14,
      color: theme.textSecondary,
      textAlign: 'center',
      maxWidth: 320,
      marginBottom: 24,
      lineHeight: 20,
    },
    browseBtn: {
      backgroundColor: theme.primary,
      paddingHorizontal: 28,
      paddingVertical: 14,
      borderRadius: 16,
      shadowColor: theme.primary,
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.3,
      shadowRadius: 6,
      elevation: 4,
    },
    browseBtnText: {
      color: '#FFFFFF',
      fontWeight: '800',
      fontSize: 15,
    },
    card: {
      backgroundColor: theme.card,
      borderRadius: 18,
      padding: 16,
      marginHorizontal: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: theme.border,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 6,
      elevation: 2,
    },
    itemRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
      gap: 14,
    },
    itemThumb: {
      width: 70,
      height: 70,
      borderRadius: 14,
      backgroundColor: theme.chipBg,
    },
    itemThumbPlaceholder: {
      width: 70,
      height: 70,
      borderRadius: 14,
      backgroundColor: theme.chipBg,
      justifyContent: 'center',
      alignItems: 'center',
    },
    itemInfo: {
      flex: 1,
    },
    itemHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 2,
    },
    itemName: {
      fontSize: 16,
      fontWeight: '800',
      color: theme.text,
      flex: 1,
      marginRight: 10,
    },
    removeBtn: {
      color: theme.error,
      fontSize: 16,
      fontWeight: '800',
      padding: 4,
    },
    itemPrice: {
      fontSize: 13,
      color: theme.textSecondary,
      marginBottom: 12,
      fontWeight: '500',
    },
    stepperRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },
    stepper: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.chipBg,
      borderRadius: 20,
      padding: 4,
      borderWidth: 1,
      borderColor: theme.border,
    },
    stepBtn: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: theme.surface,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 1,
    },
    stepBtnText: {
      fontSize: 18,
      fontWeight: '700',
      color: theme.text,
      lineHeight: 20,
    },
    qty: {
      fontSize: 15,
      fontWeight: '800',
      color: theme.text,
      minWidth: 32,
      textAlign: 'center',
    },
    lineTotal: {
      fontSize: 17,
      fontWeight: '800',
      color: theme.primary,
    },
    noteInput: {
      backgroundColor: theme.inputBg,
      borderRadius: 10,
      paddingHorizontal: 12,
      paddingVertical: 9,
      fontSize: 13,
      color: theme.text,
      borderWidth: 1,
      borderColor: theme.border,
    },
    promoCard: {
      backgroundColor: theme.card,
      borderRadius: 18,
      padding: 16,
      marginHorizontal: 16,
      marginTop: 4,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: theme.border,
    },
    promoTitle: {
      fontSize: 14,
      fontWeight: '800',
      color: theme.text,
      marginBottom: 10,
    },
    promoApplied: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    promoSuccessText: {
      color: theme.success || '#22C55E',
      fontWeight: '700',
      fontSize: 13,
    },
    removePromoText: {
      color: theme.error,
      fontWeight: '700',
      fontSize: 13,
    },
    promoRow: {
      flexDirection: 'row',
      gap: 10,
    },
    promoInput: {
      flex: 1,
      backgroundColor: theme.inputBg,
      borderRadius: 12,
      paddingHorizontal: 14,
      paddingVertical: 10,
      fontSize: 14,
      color: theme.text,
      borderWidth: 1,
      borderColor: theme.border,
    },
    applyBtn: {
      backgroundColor: theme.primary,
      paddingHorizontal: 20,
      borderRadius: 12,
      justifyContent: 'center',
    },
    applyBtnText: {
      color: '#FFFFFF',
      fontWeight: '700',
      fontSize: 14,
    },
    promoErrorText: {
      color: theme.error,
      fontSize: 12,
      marginTop: 6,
      fontWeight: '600',
    },
    footerBar: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: theme.surface,
      paddingHorizontal: 20,
      paddingVertical: 16,
      borderTopWidth: 1,
      borderTopColor: theme.border,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: -3 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 6,
    },
    footerLabel: {
      fontSize: 12,
      color: theme.textSecondary,
      fontWeight: '600',
    },
    footerTotal: {
      fontSize: 22,
      fontWeight: '900',
      color: theme.primary,
    },
    checkoutBtn: {
      backgroundColor: theme.primary,
      paddingHorizontal: 24,
      paddingVertical: 14,
      borderRadius: 16,
      shadowColor: theme.primary,
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.3,
      shadowRadius: 6,
      elevation: 4,
    },
    checkoutText: {
      color: '#FFFFFF',
      fontWeight: '800',
      fontSize: 15,
    },
  });
