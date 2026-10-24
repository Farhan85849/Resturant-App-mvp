// src/screens/OrderSummaryScreen.js
// Responsive Checkout & Order Summary with dynamic server total calculation

import React, { useState, useMemo } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, TextInput, ActivityIndicator, Image,
} from 'react-native';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';
import { apiFetch } from '../api/client';

const SERVICE_CHARGE_RATE = 0.05;
const SALES_TAX_RATE = 0.15;

export default function OrderSummaryScreen({ navigation }) {
  const { state: cart, dispatch: cartDispatch } = useCart();
  const { theme } = useTheme();

  const [orderType, setOrderType] = useState('dine-in');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [placing, setPlacing] = useState(false);

  const { items, discountPercent } = cart;

  const { subtotal, serviceCharge, salesTax, discount, grandTotal } = useMemo(() => {
    const sub = items.reduce((s, i) => s + i.price * i.quantity, 0);
    const svc = Math.round(sub * SERVICE_CHARGE_RATE);
    const tax = Math.round(sub * SALES_TAX_RATE);
    const disc = Math.round(sub * (discountPercent / 100));
    const grand = sub + svc + tax - disc;
    return { subtotal: sub, serviceCharge: svc, salesTax: tax, discount: disc, grandTotal: grand };
  }, [items, discountPercent]);

  const handlePlaceOrder = async () => {
    if (items.length === 0) {
      Alert.alert('Empty Cart', 'Add some dishes before placing an order.');
      return;
    }

    setPlacing(true);
    try {
      await apiFetch('/api/orders', {
        method: 'POST',
        body: JSON.stringify({
          items: items.map((i) => ({
            menuItemId: i.id || i._id,
            quantity: i.quantity,
          })),
          specialInstructions: specialInstructions.trim() || undefined,
        }),
      });

      cartDispatch({ type: 'CLEAR_CART' });

      Alert.alert(
        '🎉 Order Confirmed!',
        'Your order has been sent to the kitchen. You can track its live preparation status.',
        [{ text: 'Track Order →', onPress: () => navigation.navigate('Track') }]
      );
    } catch (err) {
      Alert.alert('Order Failed', err.message || 'Could not place order. Please try again.');
    } finally {
      setPlacing(false);
    }
  };

  const s = styles(theme);

  const Row = ({ label, value, bold, color, isTotal }) => (
    <View style={[s.row, isTotal && s.totalRow]}>
      <Text style={[s.rowLabel, bold && s.boldText, color && { color }]}>{label}</Text>
      <Text style={[s.rowValue, bold && s.boldText, color && { color }]}>{value}</Text>
    </View>
  );

  return (
    <View style={[s.screen, { backgroundColor: theme.background }]}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={s.scrollContent}>
        <View style={s.responsiveContainer}>
          <Text style={s.heading}>Order Checkout</Text>
          <Text style={s.subheading}>Review your selected dishes & pricing details</Text>

          {/* Dishes Card */}
          <View style={s.card}>
            <Text style={s.cardSectionTitle}>🍽️ Selected Dishes</Text>
            {items.map((item) => (
              <View key={item.id || item._id} style={s.itemRow}>
                {item.image ? (
                  <Image source={{ uri: item.image }} style={s.itemThumb} resizeMode="cover" />
                ) : (
                  <View style={s.itemThumbPlaceholder}>
                    <Text style={{ fontSize: 18 }}>🍽️</Text>
                  </View>
                )}
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Text style={s.itemName} numberOfLines={1}>{item.name}</Text>
                  {item.note ? <Text style={s.itemNote}>Note: {item.note}</Text> : null}
                </View>
                <Text style={s.itemQty}>x{item.quantity}</Text>
                <Text style={s.itemTotal}>Rs {item.price * item.quantity}</Text>
              </View>
            ))}
          </View>

          {/* Order Type Toggle */}
          <View style={s.card}>
            <Text style={s.cardSectionTitle}>Dining Preference</Text>
            <View style={s.typeRow}>
              {['dine-in', 'takeaway'].map((t) => (
                <TouchableOpacity
                  key={t}
                  style={[s.typeChip, orderType === t && s.typeChipActive]}
                  onPress={() => setOrderType(t)}
                  activeOpacity={0.8}
                >
                  <Text style={[s.typeText, orderType === t && s.typeTextActive]}>
                    {t === 'dine-in' ? '🍽️ Dine-In' : '🥡 Takeaway'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Special Instructions */}
            <Text style={s.fieldLabel}>Kitchen Instructions (Optional)</Text>
            <TextInput
              style={s.input}
              placeholder="e.g. Please make biryani mild, no onions in rolls..."
              placeholderTextColor={theme.placeholder}
              value={specialInstructions}
              onChangeText={setSpecialInstructions}
              multiline
              numberOfLines={3}
            />
          </View>

          {/* Financial Breakdown */}
          <View style={s.card}>
            <Text style={s.cardSectionTitle}>Payment Breakdown</Text>
            <Row label="Item Subtotal" value={`Rs ${subtotal}`} />
            <Row label={`Service Charge (${(SERVICE_CHARGE_RATE * 100).toFixed(0)}%)`} value={`Rs ${serviceCharge}`} />
            <Row label={`Sales Tax (${(SALES_TAX_RATE * 100).toFixed(0)}%)`} value={`Rs ${salesTax}`} />
            {discountPercent > 0 && (
              <Row label={`Promo Discount (${discountPercent}%)`} value={`− Rs ${discount}`} color={theme.success || '#22C55E'} />
            )}
            <View style={s.divider} />
            <Row label="Grand Total" value={`Rs ${grandTotal}`} bold isTotal color={theme.primary} />
            <Text style={s.footnote}>
              * Verified & calculated on database server using live pricing.
            </Text>
          </View>

          {/* Place Order CTA */}
          <TouchableOpacity
            style={[s.placeBtn, placing && { opacity: 0.6 }]}
            onPress={handlePlaceOrder}
            disabled={placing}
            activeOpacity={0.85}
          >
            {placing ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={s.placeBtnText}>Confirm & Place Order • Rs {grandTotal}</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = (theme) =>
  StyleSheet.create({
    screen: {
      flex: 1,
    },
    scrollContent: {
      padding: 16,
      paddingBottom: 60,
    },
    responsiveContainer: {
      width: '100%',
      maxWidth: 720,
      alignSelf: 'center',
    },
    heading: {
      fontSize: 26,
      fontWeight: '900',
      color: theme.text,
      letterSpacing: -0.5,
    },
    subheading: {
      fontSize: 13,
      color: theme.textSecondary,
      fontWeight: '600',
      marginTop: 2,
      marginBottom: 20,
    },
    card: {
      backgroundColor: theme.surface,
      borderRadius: 18,
      padding: 20,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: theme.border,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 6,
      elevation: 2,
    },
    cardSectionTitle: {
      fontSize: 15,
      fontWeight: '800',
      color: theme.text,
      marginBottom: 14,
    },
    itemRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 10,
      borderBottomWidth: 1,
      borderBottomColor: theme.border + '60',
      gap: 12,
    },
    itemThumb: {
      width: 44,
      height: 44,
      borderRadius: 10,
      backgroundColor: theme.chipBg,
    },
    itemThumbPlaceholder: {
      width: 44,
      height: 44,
      borderRadius: 10,
      backgroundColor: theme.chipBg,
      justifyContent: 'center',
      alignItems: 'center',
    },
    itemName: {
      fontSize: 14,
      fontWeight: '700',
      color: theme.text,
    },
    itemNote: {
      fontSize: 11,
      color: theme.primary,
      marginTop: 2,
    },
    itemQty: {
      fontSize: 13,
      fontWeight: '700',
      color: theme.textSecondary,
      marginHorizontal: 12,
    },
    itemTotal: {
      fontSize: 14,
      fontWeight: '800',
      color: theme.text,
    },
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 10,
    },
    totalRow: {
      marginTop: 6,
      marginBottom: 4,
    },
    rowLabel: {
      fontSize: 14,
      color: theme.textSecondary,
    },
    rowValue: {
      fontSize: 14,
      color: theme.text,
      fontWeight: '600',
    },
    boldText: {
      fontSize: 18,
      fontWeight: '900',
    },
    divider: {
      height: 1,
      backgroundColor: theme.border,
      marginVertical: 10,
    },
    footnote: {
      fontSize: 11,
      color: theme.textSecondary,
      marginTop: 6,
    },
    typeRow: {
      flexDirection: 'row',
      gap: 12,
      marginBottom: 16,
    },
    typeChip: {
      flex: 1,
      paddingVertical: 12,
      borderRadius: 12,
      backgroundColor: theme.chipBg,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.border,
    },
    typeChipActive: {
      backgroundColor: theme.primary + '15',
      borderColor: theme.primary,
    },
    typeText: {
      fontSize: 14,
      fontWeight: '700',
      color: theme.chipText,
    },
    typeTextActive: {
      color: theme.primary,
    },
    fieldLabel: {
      fontSize: 13,
      fontWeight: '700',
      color: theme.text,
      marginBottom: 8,
    },
    input: {
      backgroundColor: theme.inputBg,
      borderRadius: 12,
      padding: 12,
      fontSize: 14,
      color: theme.text,
      borderWidth: 1,
      borderColor: theme.border,
      textAlignVertical: 'top',
      minHeight: 70,
    },
    placeBtn: {
      backgroundColor: theme.primary,
      borderRadius: 16,
      paddingVertical: 16,
      alignItems: 'center',
      shadowColor: theme.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.35,
      shadowRadius: 8,
      elevation: 4,
    },
    placeBtnText: {
      color: '#FFFFFF',
      fontWeight: '900',
      fontSize: 16,
      letterSpacing: 0.3,
    },
  });
