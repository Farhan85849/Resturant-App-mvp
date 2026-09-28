// src/screens/OrderSummaryScreen.js
// Q8: useMemo for computed totals; place-order flow from Q10
import React, { useState, useMemo } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, TextInput,
} from 'react-native';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useOrders } from '../context/OrdersContext';

// Named rate constants (Q8 requirement)
const SERVICE_CHARGE_RATE = 0.05;
const SALES_TAX_RATE = 0.15;

export default function OrderSummaryScreen({ navigation }) {
  const { state: cart, dispatch: cartDispatch } = useCart();
  const { theme } = useTheme();
  const { user } = useAuth();
  const { dispatch: ordersDispatch } = useOrders();

  const [orderType, setOrderType] = useState('dine-in');
  const [pickupTime, setPickupTime] = useState('');

  const { items, discountPercent } = cart;

  // ── Q8: all totals computed via useMemo ──────────────────────────────────
  const { subtotal, serviceCharge, salesTax, discount, grandTotal } = useMemo(() => {
    const sub = items.reduce((s, i) => s + i.price * i.quantity, 0);
    const svc = Math.round(sub * SERVICE_CHARGE_RATE);
    const tax = Math.round(sub * SALES_TAX_RATE);
    const disc = Math.round(sub * (discountPercent / 100));
    const grand = sub + svc + tax - disc;
    return { subtotal: sub, serviceCharge: svc, salesTax: tax, discount: disc, grandTotal: grand };
  }, [items, discountPercent]);

  const handlePlaceOrder = () => {
    if (orderType === 'takeaway' && !pickupTime.trim()) {
      Alert.alert('Pickup time required', 'Please enter a pickup time for your takeaway order.');
      return;
    }
    ordersDispatch({
      type: 'PLACE_ORDER',
      payload: {
        items,
        total: grandTotal,
        type: orderType,
        pickupTime: orderType === 'takeaway' ? pickupTime : null,
        userId: user?.id,
      },
    });
    cartDispatch({ type: 'CLEAR_CART' });
    Alert.alert(
      '🎉 Order Placed!',
      `Your ${orderType} order has been placed. Total: Rs ${grandTotal}`,
      [{ text: 'Track Order', onPress: () => navigation.navigate('OrderTracking') }]
    );
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
          <View key={item.id} style={s.itemRow}>
            <Text style={s.itemName} numberOfLines={1}>{item.name}</Text>
            <Text style={s.itemQty}>x{item.quantity}</Text>
            <Text style={s.itemTotal}>Rs {item.price * item.quantity}</Text>
          </View>
        ))}
      </View>

      {/* Totals */}
      <View style={s.card}>
        <Row label="Subtotal" value={`Rs ${subtotal}`} />
        <Row label={`Service Charge (${(SERVICE_CHARGE_RATE * 100).toFixed(0)}%)`} value={`Rs ${serviceCharge}`} />
        <Row label={`Sales Tax (${(SALES_TAX_RATE * 100).toFixed(0)}%)`} value={`Rs ${salesTax}`} />
        {discountPercent > 0 && (
          <Row label={`Promo Discount (${discountPercent}%)`} value={`− Rs ${discount}`} color={theme.success} />
        )}
        <View style={s.divider} />
        <Row label="Grand Total" value={`Rs ${grandTotal}`} bold color={theme.primary} />
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

      {orderType === 'takeaway' && (
        <TextInput
          style={s.input}
          placeholder="Pickup time (e.g. 7:30 PM)"
          placeholderTextColor={theme.placeholder}
          value={pickupTime}
          onChangeText={setPickupTime}
        />
      )}

      <TouchableOpacity style={s.placeBtn} onPress={handlePlaceOrder}>
        <Text style={s.placeBtnText}>Place Order — Rs {grandTotal}</Text>
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
    },
    placeBtn: {
      backgroundColor: theme.primary, borderRadius: 14,
      paddingVertical: 16, alignItems: 'center', marginBottom: 32,
    },
    placeBtnText: { color: '#fff', fontWeight: '800', fontSize: 16 },
  });
