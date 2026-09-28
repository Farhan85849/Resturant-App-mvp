// src/screens/OrderTrackingScreen.js
// Q10: useEffect with setInterval for auto-progression, elapsed timer, cleanup
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useOrders } from '../context/OrdersContext';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

const STATUSES = ['Pending', 'Preparing', 'Ready', 'Served'];

const STATUS_EMOJI = {
  Pending: '⏳',
  Preparing: '👨‍🍳',
  Ready: '✅',
  Served: '🎉',
  Cancelled: '❌',
};

// Auto-advance timings (demo: 10s, 20s, 30s)
const AUTO_ADVANCE = [
  { from: 'Pending', to: 'Preparing', delay: 10000 },
  { from: 'Preparing', to: 'Ready', delay: 10000 },
  { from: 'Ready', to: 'Served', delay: 10000 },
];

export default function OrderTrackingScreen() {
  const { orders, dispatch } = useOrders();
  const { theme } = useTheme();
  const { user } = useAuth();
  const s = styles(theme);

  // Show the most recent pending/in-progress order for this user
  const activeOrder = [...orders]
    .reverse()
    .find(
      (o) =>
        o.userId === user?.id &&
        !['Served', 'Cancelled'].includes(o.status)
    );

  const [elapsed, setElapsed] = useState(0);

  // ── Elapsed-time counter (updates every second) ───────────────────────────
  useEffect(() => {
    if (!activeOrder) return;
    setElapsed(0);
    const interval = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(interval); // cleanup
  }, [activeOrder?.id]);

  // ── Auto-advance status ───────────────────────────────────────────────────
  useEffect(() => {
    if (!activeOrder) return;
    const rule = AUTO_ADVANCE.find((r) => r.from === activeOrder.status);
    if (!rule) return;

    const timer = setTimeout(() => {
      dispatch({ type: 'UPDATE_STATUS', payload: { id: activeOrder.id, status: rule.to } });
    }, rule.delay);

    return () => clearTimeout(timer); // cleanup
  }, [activeOrder?.id, activeOrder?.status, dispatch]);

  const formatElapsed = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  };

  if (!activeOrder) {
    // Show list of all user orders
    const myOrders = orders.filter((o) => o.userId === user?.id);
    return (
      <View style={s.container}>
        <Text style={s.heading}>My Orders</Text>
        {myOrders.length === 0 ? (
          <View style={s.empty}>
            <Text style={{ fontSize: 40 }}>📋</Text>
            <Text style={s.emptyText}>No orders yet</Text>
          </View>
        ) : (
          <ScrollView>
            {[...myOrders].reverse().map((order) => (
              <View key={order.id} style={s.orderCard}>
                <View style={s.orderHeader}>
                  <Text style={s.orderId}>#{order.id.slice(-6)}</Text>
                  <Text style={[s.orderStatus, { color: statusColor(order.status, theme) }]}>
                    {STATUS_EMOJI[order.status]} {order.status}
                  </Text>
                </View>
                <Text style={s.orderMeta}>
                  {order.type} • {order.items.length} item{order.items.length !== 1 ? 's' : ''} • Rs {order.total}
                </Text>
                <Text style={s.orderTime}>{new Date(order.timestamp).toLocaleString()}</Text>
              </View>
            ))}
          </ScrollView>
        )}
      </View>
    );
  }

  const currentIndex = STATUSES.indexOf(activeOrder.status);

  return (
    <ScrollView style={s.container} contentContainerStyle={{ padding: 20 }}>
      <Text style={s.heading}>Tracking Order</Text>
      <Text style={s.orderId}>Order #{activeOrder.id.slice(-6)}</Text>
      <Text style={s.elapsed}>Elapsed: {formatElapsed(elapsed)}</Text>

      {/* Step progress indicator */}
      <View style={s.stepsContainer}>
        {STATUSES.map((status, idx) => {
          const done = idx < currentIndex;
          const active = idx === currentIndex;
          return (
            <View key={status} style={s.stepRow}>
              <View style={[s.stepCircle, done && s.stepDone, active && s.stepActive]}>
                <Text style={{ color: done || active ? '#fff' : theme.textSecondary, fontWeight: '700' }}>
                  {done ? '✓' : idx + 1}
                </Text>
              </View>
              {idx < STATUSES.length - 1 && (
                <View style={[s.stepLine, done && s.stepLineDone]} />
              )}
              <View style={s.stepLabelWrap}>
                <Text style={[s.stepLabel, active && { color: theme.primary, fontWeight: '700' }]}>
                  {STATUS_EMOJI[status]} {status}
                </Text>
                {active && (
                  <Text style={s.stepSub}>
                    {status === 'Pending' && 'Order received, awaiting kitchen...'}
                    {status === 'Preparing' && 'Our chefs are cooking your meal!'}
                    {status === 'Ready' && 'Your order is ready for pickup/serving!'}
                  </Text>
                )}
              </View>
            </View>
          );
        })}
      </View>

      {/* Order details */}
      <View style={s.detailCard}>
        <Text style={s.detailTitle}>Order Details</Text>
        {activeOrder.items.map((item) => (
          <View key={item.id} style={s.detailRow}>
            <Text style={s.detailName} numberOfLines={1}>{item.name}</Text>
            <Text style={s.detailQty}>x{item.quantity}</Text>
            <Text style={s.detailTotal}>Rs {item.price * item.quantity}</Text>
          </View>
        ))}
        <View style={s.detailDivider} />
        <View style={s.detailRow}>
          <Text style={[s.detailName, { fontWeight: '800', color: theme.primary }]}>Total</Text>
          <Text style={[s.detailTotal, { fontWeight: '800', color: theme.primary }]}>Rs {activeOrder.total}</Text>
        </View>
      </View>
    </ScrollView>
  );
}

function statusColor(status, theme) {
  switch (status) {
    case 'Pending': return theme.warning;
    case 'Preparing': return theme.accent;
    case 'Ready': return theme.success;
    case 'Served': return theme.primary;
    case 'Cancelled': return theme.error;
    default: return theme.text;
  }
}

const styles = (theme) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.background },
    heading: { fontSize: 24, fontWeight: '800', color: theme.text, marginBottom: 4, marginTop: 8 },
    orderId: { fontSize: 14, color: theme.textSecondary, marginBottom: 4 },
    elapsed: { fontSize: 28, fontWeight: '800', color: theme.primary, marginBottom: 24 },
    stepsContainer: { marginBottom: 24 },
    stepRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8 },
    stepCircle: {
      width: 36, height: 36, borderRadius: 18,
      backgroundColor: theme.border, justifyContent: 'center', alignItems: 'center',
      marginRight: 12, marginTop: 2,
    },
    stepDone: { backgroundColor: theme.success },
    stepActive: { backgroundColor: theme.primary },
    stepLine: {
      position: 'absolute', left: 17, top: 40, width: 2, height: 28,
      backgroundColor: theme.border,
    },
    stepLineDone: { backgroundColor: theme.success },
    stepLabelWrap: { flex: 1 },
    stepLabel: { fontSize: 16, color: theme.text, marginTop: 6 },
    stepSub: { fontSize: 12, color: theme.textSecondary, marginTop: 2 },
    detailCard: {
      backgroundColor: theme.card, borderRadius: 14, padding: 16,
      shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, elevation: 2,
      marginBottom: 32,
    },
    detailTitle: { fontSize: 16, fontWeight: '700', color: theme.text, marginBottom: 12 },
    detailRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
    detailName: { flex: 1, color: theme.text, fontSize: 14 },
    detailQty: { color: theme.textSecondary, fontSize: 13, marginHorizontal: 8 },
    detailTotal: { color: theme.text, fontWeight: '600', fontSize: 14 },
    detailDivider: { height: 1, backgroundColor: theme.border, marginVertical: 8 },
    empty: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 80, gap: 12 },
    emptyText: { fontSize: 18, color: theme.textSecondary },
    orderCard: {
      backgroundColor: theme.card, borderRadius: 12, padding: 14,
      marginHorizontal: 20, marginBottom: 12,
      shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, elevation: 2,
    },
    orderHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
    orderId2: { fontWeight: '700', color: theme.text },
    orderStatus: { fontWeight: '700' },
    orderMeta: { fontSize: 13, color: theme.textSecondary, marginBottom: 2 },
    orderTime: { fontSize: 11, color: theme.textSecondary },
  });
