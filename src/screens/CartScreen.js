// src/screens/CartScreen.js
// Q7: useCart (useReducer via CartContext), promo codes, quantity stepper, notes
import React, { useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  TextInput, Alert,
} from 'react-native';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';

export default function CartScreen({ navigation }) {
  const { state, dispatch } = useCart();
  const { theme } = useTheme();
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
      Alert.alert('Empty Cart', 'Add some items before placing an order.');
      return;
    }
    navigation.navigate('OrderSummary');
  };

  const renderItem = ({ item }) => (
    <View style={s.card}>
      <View style={s.itemHeader}>
        <Text style={s.itemName} numberOfLines={1}>{item.name}</Text>
        <TouchableOpacity
          onPress={() => dispatch({ type: 'REMOVE_ITEM', payload: item.id })}
        >
          <Text style={{ color: theme.error, fontWeight: '700' }}>✕</Text>
        </TouchableOpacity>
      </View>
      <Text style={s.itemPrice}>Rs {item.price} each</Text>

      {/* Quantity stepper */}
      <View style={s.stepperRow}>
        <TouchableOpacity
          style={s.stepBtn}
          onPress={() => dispatch({ type: 'DECREMENT', payload: item.id })}
        >
          <Text style={s.stepBtnText}>−</Text>
        </TouchableOpacity>
        <Text style={s.qty}>{item.quantity}</Text>
        <TouchableOpacity
          style={s.stepBtn}
          onPress={() => dispatch({ type: 'INCREMENT', payload: item.id })}
        >
          <Text style={s.stepBtnText}>+</Text>
        </TouchableOpacity>
        <Text style={s.lineTotal}>Rs {item.price * item.quantity}</Text>
      </View>

      {/* Special instructions */}
      <TextInput
        style={s.noteInput}
        placeholder="Special instructions (e.g. no onions)"
        placeholderTextColor={theme.placeholder}
        value={item.note}
        onChangeText={(note) =>
          dispatch({ type: 'UPDATE_NOTE', payload: { id: item.id, note } })
        }
      />
    </View>
  );

  return (
    <View style={s.container}>
      {items.length === 0 ? (
        <View style={s.empty}>
          <Text style={{ fontSize: 48 }}>🛒</Text>
          <Text style={s.emptyText}>Your cart is empty</Text>
          <TouchableOpacity
            style={s.browseBtn}
            onPress={() => navigation.navigate('Menu')}
          >
            <Text style={s.browseBtnText}>Browse Menu</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <FlatList
            data={items}
            keyExtractor={(i) => i.id}
            renderItem={renderItem}
            contentContainerStyle={{ padding: 16, paddingBottom: 8 }}
            showsVerticalScrollIndicator={false}
            ListFooterComponent={
              <View style={s.promoSection}>
                <Text style={s.sectionTitle}>Promo Code</Text>
                {promoCode ? (
                  <View style={s.promoApplied}>
                    <Text style={{ color: theme.success, fontWeight: '600' }}>
                      ✓ {promoCode} — {discountPercent}% off applied!
                    </Text>
                    <TouchableOpacity
                      onPress={() => dispatch({ type: 'REMOVE_PROMO' })}
                    >
                      <Text style={{ color: theme.error, fontWeight: '600' }}>Remove</Text>
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
                    <TouchableOpacity style={s.applyBtn} onPress={handleApplyPromo}>
                      <Text style={s.applyBtnText}>Apply</Text>
                    </TouchableOpacity>
                  </View>
                )}
                {promoError ? (
                  <Text style={{ color: theme.error, fontSize: 12, marginTop: 4 }}>
                    {promoError}
                  </Text>
                ) : null}
              </View>
            }
          />

          {/* Checkout bar */}
          <View style={s.footer}>
            <View>
              <Text style={s.footerLabel}>{totalItems} item{totalItems !== 1 ? 's' : ''}</Text>
              <Text style={s.footerTotal}>Rs {subtotal}</Text>
            </View>
            <TouchableOpacity style={s.checkoutBtn} onPress={handleCheckout}>
              <Text style={s.checkoutText}>Review Order →</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
}

const styles = (theme) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.background },
    empty: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 16 },
    emptyText: { fontSize: 18, color: theme.textSecondary, fontWeight: '600' },
    browseBtn: { backgroundColor: theme.primary, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 10 },
    browseBtnText: { color: '#fff', fontWeight: '700' },
    card: {
      backgroundColor: theme.card, borderRadius: 14, padding: 14,
      marginBottom: 12,
      shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, elevation: 2,
    },
    itemHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
    itemName: { fontSize: 15, fontWeight: '700', color: theme.text, flex: 1, marginRight: 8 },
    itemPrice: { fontSize: 13, color: theme.textSecondary, marginBottom: 10 },
    stepperRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10 },
    stepBtn: {
      width: 34, height: 34, borderRadius: 17,
      backgroundColor: theme.primary, justifyContent: 'center', alignItems: 'center',
    },
    stepBtnText: { color: '#fff', fontSize: 20, lineHeight: 22 },
    qty: { fontSize: 18, fontWeight: '700', color: theme.text, minWidth: 24, textAlign: 'center' },
    lineTotal: { fontSize: 15, fontWeight: '700', color: theme.primary, marginLeft: 'auto' },
    noteInput: {
      backgroundColor: theme.inputBg, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8,
      fontSize: 13, color: theme.text, borderWidth: 1, borderColor: theme.border,
    },
    promoSection: { marginTop: 4, marginBottom: 8 },
    sectionTitle: { fontSize: 15, fontWeight: '700', color: theme.text, marginBottom: 10 },
    promoApplied: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    promoRow: { flexDirection: 'row', gap: 10 },
    promoInput: {
      flex: 1, backgroundColor: theme.inputBg, borderRadius: 8,
      paddingHorizontal: 12, paddingVertical: 10,
      fontSize: 14, color: theme.text, borderWidth: 1, borderColor: theme.border,
    },
    applyBtn: { backgroundColor: theme.primary, paddingHorizontal: 18, borderRadius: 8, justifyContent: 'center' },
    applyBtnText: { color: '#fff', fontWeight: '700' },
    footer: {
      flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
      backgroundColor: theme.card, padding: 16, borderTopWidth: 1, borderTopColor: theme.border,
    },
    footerLabel: { fontSize: 13, color: theme.textSecondary },
    footerTotal: { fontSize: 20, fontWeight: '800', color: theme.text },
    checkoutBtn: { backgroundColor: theme.primary, paddingHorizontal: 20, paddingVertical: 14, borderRadius: 12 },
    checkoutText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  });
