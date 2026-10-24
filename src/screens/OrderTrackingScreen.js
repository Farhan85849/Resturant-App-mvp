// src/screens/OrderTrackingScreen.js
// Polls GET /api/orders/my every 10s via setInterval.
// Replaces A1's fake auto-advance timer with real server polling.

import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../api/client';

const STATUSES = ['Pending', 'Preparing', 'Ready', 'Served'];

const STATUS_EMOJI = {
  Pending: '⏳',
  Preparing: '👨‍🍳',
  Ready: '✅',
  Served: '🎉',
  Cancelled: '❌',
};

const POLL_INTERVAL = 10000; // 10 seconds

export default function OrderTrackingScreen() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const s = styles(theme);

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOrders = useCallback(async () => {
    try {
      const data = await apiFetch('/api/orders/my');
      setOrders(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch + polling every 10 seconds
  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, POLL_INTERVAL);
    return () => clearInterval(interval); // cleanup on unmount
  }, [fetchOrders]);

  if (loading) {
    return (
      <View style={[s.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={{ color: theme.textSecondary, marginTop: 12 }}>Loading orders…</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[s.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: theme.error, fontSize: 16, marginBottom: 16, textAlign: 'center', padding: 24 }}>
          {error}
        </Text>
        <TouchableOpacity style={s.retryBtn} onPress={fetchOrders}>
          <Text style={s.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Active order: the most recent one that is not yet served/cancelled
  const activeOrder = [...orders].find(
    (o) => !['Served', 'Cancelled'].includes(o.status)
  );

  if (!activeOrder) {
    return (
      <View style={s.container}>
        <View style={s.responsiveContainer}>
          <Text style={[s.heading, { paddingHorizontal: 20, paddingTop: 20 }]}>My Orders</Text>
          {orders.length === 0 ? (
            <View style={s.empty}>
              <Text style={{ fontSize: 40 }}>📋</Text>
              <Text style={s.emptyTitle}>No orders placed yet</Text>
              <Text style={s.emptyText}>When you place an order, you can track its live kitchen progress here.</Text>
            </View>
          ) : (
            <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
              {[...orders].map((order) => (
                <View key={order._id} style={s.orderCard}>
                  <View style={s.orderHeader}>
                    <Text style={s.orderId}>Order #{order._id.slice(-6)}</Text>
                    <Text style={[s.orderStatus, { color: statusColor(order.status, theme) }]}>
                      {STATUS_EMOJI[order.status]} {order.status}
                    </Text>
                  </View>
                  <Text style={s.orderMeta}>
                    {order.items?.length} dish(es) · Total: Rs {order.total}
                  </Text>
                  <Text style={s.orderTime}>Placed on: {new Date(order.createdAt).toLocaleString()}</Text>
                </View>
              ))}
            </ScrollView>
          )}
        </View>
      </View>
    );
  }

  const currentIndex = STATUSES.indexOf(activeOrder.status);

  return (
    <ScrollView style={s.container} contentContainerStyle={{ padding: 20, paddingBottom: 60 }}>
      <View style={s.responsiveContainer}>
        <Text style={s.heading}>Live Order Tracking</Text>
        <Text style={s.orderId}>Order #{activeOrder._id.slice(-6)}</Text>
        <Text style={{ color: theme.textSecondary, fontSize: 13, marginBottom: 20 }}>
          🔄 Auto-syncing with kitchen every 10s • Last update: {new Date().toLocaleTimeString()}
        </Text>

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
                  <Text style={[s.stepLabel, active && { color: theme.primary, fontWeight: '800' }]}>
                    {STATUS_EMOJI[status]} {status}
                  </Text>
                  {active && (
                    <Text style={s.stepSub}>
                      {status === 'Pending' && 'Order received, kitchen confirming ingredients...'}
                      {status === 'Preparing' && 'Master chefs are actively cooking your meal!'}
                      {status === 'Ready' && 'Your meal is prepared and ready for service!'}
                      {status === 'Served' && 'Bon appétit! Enjoy your dining experience.'}
                    </Text>
                  )}
                </View>
              </View>
            );
          })}
        </View>

        {/* Order details */}
        <View style={s.detailCard}>
          <Text style={s.detailTitle}>Order Receipt Summary</Text>
          {activeOrder.items?.map((item, i) => (
            <View key={i} style={s.detailRow}>
              <Text style={s.detailName} numberOfLines={1}>{item.name}</Text>
              <Text style={s.detailQty}>x{item.quantity}</Text>
              <Text style={s.detailTotal}>Rs {item.price * item.quantity}</Text>
            </View>
          ))}
          <View style={s.detailDivider} />
          <View style={s.detailRow}>
            <Text style={[s.detailName, { fontWeight: '800', color: theme.primary, fontSize: 16 }]}>Total Paid</Text>
            <Text style={[s.detailTotal, { fontWeight: '900', color: theme.primary, fontSize: 18 }]}>Rs {activeOrder.total}</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

function statusColor(status, theme) {
  switch (status) {
    case 'Pending': return theme.warning || '#f59e0b';
    case 'Preparing': return theme.accent || '#8b5cf6';
    case 'Ready': return theme.success || '#22c55e';
    case 'Served': return theme.primary;
    case 'Cancelled': return theme.error;
    default: return theme.text;
  }
}

const styles = (theme) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.background },
    responsiveContainer: {
      width: '100%',
      maxWidth: 760,
      alignSelf: 'center',
    },
    heading: { fontSize: 26, fontWeight: '900', color: theme.text, marginBottom: 4, letterSpacing: -0.5 },
    orderId: { fontSize: 14, color: theme.textSecondary, marginBottom: 4, fontWeight: '600' },
    emptyTitle: { fontSize: 18, fontWeight: '800', color: theme.text, marginTop: 8 },
    stepsContainer: { marginBottom: 24 },
    stepRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8 },
    stepCircle: {
      width: 36, height: 36, borderRadius: 18,
      backgroundColor: theme.border, justifyContent: 'center', alignItems: 'center',
      marginRight: 12, marginTop: 2,
    },
    stepDone: { backgroundColor: theme.success || '#22c55e' },
    stepActive: { backgroundColor: theme.primary },
    stepLine: {
      position: 'absolute', left: 17, top: 40, width: 2, height: 28,
      backgroundColor: theme.border,
    },
    stepLineDone: { backgroundColor: theme.success || '#22c55e' },
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
    orderStatus: { fontWeight: '700' },
    orderMeta: { fontSize: 13, color: theme.textSecondary, marginBottom: 2 },
    orderTime: { fontSize: 11, color: theme.textSecondary },
    retryBtn: { backgroundColor: theme.primary, paddingHorizontal: 28, paddingVertical: 12, borderRadius: 10 },
    retryText: { color: '#fff', fontWeight: '700' },
  });
