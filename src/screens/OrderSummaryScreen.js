// src/screens/OrderSummaryScreen.js
// Places real order via POST /api/orders.
// Server computes the total from DB prices — client subtotal is just for display.

import React, { useState, useMemo } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, TextInput, ActivityIndicator,
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

  // Client-side totals (for display only — server recomputes from DB prices)
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
      Alert.alert('Empty Cart', 'Add some items before placing an order.');
      return;
    }

    setPlacing(true);
    try {
      await apiFetch('/api/orders', {
        method: 'POST',
        body: JSON.stringify({
          items: items.map((i) => ({
            menuItemId: i.id || i._id, // support both id formats
            quantity: i.quantity,
          })),
          specialInstructions: specialInstructions.trim() || undefined,
        }),
      });

      cartDispatch({ type: 'CLEAR_CART' });

      Alert.alert(
        '🎉 Order Placed!',
        'Your order has been sent to the kitchen!',
        [{ text: 'Track Order', onPress: () => navigation.navigate('OrderTracking') }]
      );
    } catch (err) {
      Alert.alert('Order Failed', err.message || 'Could not place order. Please try again.');
    } finally {
      setPlacing(false);
    }
  };

  const s = styles(theme);

  const Row = ({ label, value, bold, color }) => (
    <View style={s.row}>
      <Text style={[s.rowLabel, bold && { fontWeight: '700' }, color && { color }]}>{label}</Text>
      <Text style={[s.rowValue, bold && { fontWeight: '800' }, color && { color }]}>{value}</Text>
    </View>
  );

  return (
    <ScrollView style={s.container} contentContainerStyle={{ padding: 20 }}>
      <Text style={s.heading}>Order Summary</Text>

      {/* Items list */}
      <View style={s.card}>
        {items.map((item) => (
          <View key={item.id || item._id} style={s.itemRow}>
            <Text style={s.itemName} numberOfLines={1}>{item.name}</Text>
            <Text style={s.itemQty}>x{item.quantity}</Text>
            <Text style={s.itemTotal}>Rs {item.price * item.quantity}</Text>
          </View>
        ))}
      </View>

      {/* Totals (display only; server uses DB prices) */}
      <View style={s.card}>
        <Row label="Subtotal" value={`Rs ${subtotal}`} />
        <Row label={`Service Charge (${(SERVICE_CHARGE_RATE * 100).toFixed(0)}%)`} value={`Rs ${serviceCharge}`} />
        <Row label={`Sales Tax (${(SALES_TAX_RATE * 100).toFixed(0)}%)`} value={`Rs ${salesTax}`} />
        {discountPercent > 0 && (
          <Row label={`Promo Discount (${discountPercent}%)`} value={`− Rs ${discount}`} color={theme.success} />
        )}
        <View style={s.divider} />
        <Row label="Estimated Total" value={`Rs ${grandTotal}`} bold color={theme.primary} />
        <Text style={{ fontSize: 11, color: theme.textSecondary, marginTop: 4 }}>
          * Final total confirmed by server based on current menu prices.
        </Text>
      </View>

      {/* Order type */}
      <Text style={s.sectionLabel}>Order Type</Text>
      <View style={s.typeRow}>
        {['dine-in', 'takeaway'].map((t) => (
          <TouchableOpacity
            key={t}
            style={[s.typeChip, orderType === t && s.typeChipActive]}
            onPress={() => setOrderType(t)}
          >
            <Text style={[s.typeText, orderType === t && s.typeTextActive]}>
              {t === 'dine-in' ? '🍽️ Dine-in' : '🥡 Takeaway'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Special instructions */}
      <Text style={s.sectionLabel}>Special Instructions</Text>
      <TextInput
        style={s.input}
        placeholder="e.g. No onions, extra spicy..."
        placeholderTextColor={theme.placeholder}
        value={specialInstructions}
        onChangeText={setSpecialInstructions}
        multiline
        numberOfLines={3}
      />

      <TouchableOpacity style={[s.placeBtn, placing && { opacity: 0.6 }]} onPress={handlePlaceOrder} disabled={placing}>
        {placing ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={s.placeBtnText}>Place Order — Rs {grandTotal}</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = (theme) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.background },
    heading: { fontSize: 24, fontWeight: '800', color: theme.text, marginBottom: 20 },
    card: {
      backgroundColor: theme.card, borderRadius: 14, padding: 16, marginBottom: 16,
      shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, elevation: 2,
    },
    itemRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
    itemName: { flex: 1, color: theme.text, fontSize: 14 },
    itemQty: { color: theme.textSecondary, fontSize: 13, marginHorizontal: 8 },
    itemTotal: { color: theme.text, fontWeight: '600', fontSize: 14 },
    row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
    rowLabel: { fontSize: 14, color: theme.textSecondary },
    rowValue: { fontSize: 14, color: theme.text },
    divider: { height: 1, backgroundColor: theme.border, marginVertical: 8 },
    sectionLabel: { fontSize: 15, fontWeight: '700', color: theme.text, marginBottom: 10 },
    typeRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
    typeChip: {
      flex: 1, paddingVertical: 12, borderRadius: 10,
      backgroundColor: theme.chipBg, alignItems: 'center', borderWidth: 1, borderColor: theme.border,
    },
    typeChipActive: { backgroundColor: theme.primary + '22', borderColor: theme.primary },
    typeText: { color: theme.chipText, fontWeight: '600' },
    typeTextActive: { color: theme.primary },
    input: {
      backgroundColor: theme.inputBg, borderRadius: 10, padding: 12,
      fontSize: 14, color: theme.text, borderWidth: 1, borderColor: theme.border, marginBottom: 16,
      textAlignVertical: 'top', minHeight: 80,
    },
    placeBtn: {
      backgroundColor: theme.primary, borderRadius: 14,
      paddingVertical: 16, alignItems: 'center', marginBottom: 32,
    },
    placeBtnText: { color: '#fff', fontWeight: '800', fontSize: 16 },
  });
