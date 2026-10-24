// src/screens/ManagerDashboardScreen.js
// Connected to real server API:
//  - Orders: GET /api/orders, PATCH /api/orders/:id/status
//  - Reservations: GET /api/reservations, PATCH /api/reservations/:id
//  - Menu: GET /api/menu, PUT /api/menu/:id, POST /api/menu

import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Switch, ActivityIndicator, Alert,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { apiFetch } from '../api/client';
import useApi from '../hooks/useApi';

export default function ManagerDashboardScreen() {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState('orders');
  const s = styles(theme);

  return (
    <View style={s.container}>
      <View style={s.tabBarWrapper}>
        <View style={s.tabBar}>
          <TabButton id="orders" label="📦 Orders" activeTab={activeTab} setActiveTab={setActiveTab} theme={theme} />
          <TabButton id="reservations" label="📅 Reservations" activeTab={activeTab} setActiveTab={setActiveTab} theme={theme} />
          <TabButton id="menu" label="🍽️ Menu Control" activeTab={activeTab} setActiveTab={setActiveTab} theme={theme} />
        </View>
      </View>

      <ScrollView contentContainerStyle={s.content}>
        <View style={s.responsiveContainer}>
          {activeTab === 'orders' && <OrdersTab theme={theme} />}
          {activeTab === 'reservations' && <ReservationsTab theme={theme} />}
          {activeTab === 'menu' && <MenuTab theme={theme} />}
        </View>
      </ScrollView>
    </View>
  );
}

function TabButton({ id, label, activeTab, setActiveTab, theme }) {
  const isActive = activeTab === id;
  return (
    <TouchableOpacity
      style={[
        { flex: 1, paddingVertical: 12, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
        isActive && { borderBottomColor: theme.primary },
      ]}
      onPress={() => setActiveTab(id)}
    >
      <Text style={[{ color: theme.textSecondary, fontWeight: '600' }, isActive && { color: theme.primary }]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

// ── Orders Tab ────────────────────────────────────────────────────────
function OrdersTab({ theme }) {
  const s = styles(theme);
  const fetchOrders = useCallback(() => apiFetch('/api/orders'), []);
  const { data: orders, loading, error, refetch } = useApi(fetchOrders, []);

  const updateStatus = async (id, status) => {
    try {
      await apiFetch(`/api/orders/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
      refetch();
    } catch (err) {
      Alert.alert('Error', err.message);
    }
  };

  if (loading) return <ActivityIndicator style={{ marginTop: 40 }} color={theme.primary} />;
  if (error) return <Text style={s.emptyText}>{error}</Text>;

  const activeOrders = (orders || []).filter((o) => !['Served', 'Cancelled'].includes(o.status));
  if (activeOrders.length === 0) return <Text style={s.emptyText}>No active orders.</Text>;

  return (
    <View>
      {activeOrders.map((order) => (
        <View key={order._id} style={s.card}>
          <View style={s.cardHeader}>
            <Text style={s.cardTitle}>Order #{order._id.slice(-6)}</Text>
            <Text style={s.statusBadge}>{order.status}</Text>
          </View>
          <Text style={s.metaText}>
            {order.customer?.name || 'Customer'} · Rs {order.total}
          </Text>
          <Text style={s.metaText}>{order.items?.length} item(s)</Text>

          <View style={s.actionRow}>
            {order.status === 'Pending' && (
              <TouchableOpacity style={s.btnAccent} onPress={() => updateStatus(order._id, 'Preparing')}>
                <Text style={s.btnTextWhite}>Preparing</Text>
              </TouchableOpacity>
            )}
            {order.status === 'Preparing' && (
              <TouchableOpacity style={s.btnSuccess} onPress={() => updateStatus(order._id, 'Ready')}>
                <Text style={s.btnTextWhite}>Mark Ready</Text>
              </TouchableOpacity>
            )}
            {order.status === 'Ready' && (
              <TouchableOpacity style={s.btnPrimary} onPress={() => updateStatus(order._id, 'Served')}>
                <Text style={s.btnTextWhite}>Mark Served</Text>
              </TouchableOpacity>
            )}
            {order.status === 'Pending' && (
              <TouchableOpacity style={s.btnErrorOutlined} onPress={() => updateStatus(order._id, 'Cancelled')}>
                <Text style={s.btnTextError}>Cancel</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      ))}
    </View>
  );
}

// ── Reservations Tab ──────────────────────────────────────────────────
function ReservationsTab({ theme }) {
  const s = styles(theme);
  const fetchReservations = useCallback(() => apiFetch('/api/reservations'), []);
  const { data: reservations, loading, error, refetch } = useApi(fetchReservations, []);

  const updateStatus = async (id, status) => {
    try {
      await apiFetch(`/api/reservations/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
      refetch();
    } catch (err) {
      Alert.alert('Error', err.message);
    }
  };

  if (loading) return <ActivityIndicator style={{ marginTop: 40 }} color={theme.primary} />;
  if (error) return <Text style={s.emptyText}>{error}</Text>;

  const active = (reservations || []).filter((r) => ['Pending', 'Confirmed'].includes(r.status));
  if (active.length === 0) return <Text style={s.emptyText}>No active reservations.</Text>;

  return (
    <View>
      {active.map((res) => (
        <View key={res._id} style={s.card}>
          <View style={s.cardHeader}>
            <Text style={s.cardTitle}>{res.customer?.name} ({res.guestCount} guests)</Text>
            <Text style={s.statusBadge}>{res.status}</Text>
          </View>
          <Text style={s.metaText}>
            {res.date} at {res.time} · Table #{res.table?.tableNumber}
          </Text>
          {res.specialRequests ? (
            <Text style={s.metaText}>📝 {res.specialRequests}</Text>
          ) : null}

          <View style={s.actionRow}>
            {res.status === 'Pending' && (
              <TouchableOpacity style={s.btnSuccess} onPress={() => updateStatus(res._id, 'Confirmed')}>
                <Text style={s.btnTextWhite}>Accept</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={s.btnErrorOutlined} onPress={() => updateStatus(res._id, 'Declined')}>
              <Text style={s.btnTextError}>Decline</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </View>
  );
}

// ── Menu Tab ──────────────────────────────────────────────────────────
function MenuTab({ theme }) {
  const s = styles(theme);
  const fetchMenu = useCallback(() => apiFetch('/api/menu'), []);
  const { data: menuItems, loading, error, refetch } = useApi(fetchMenu, []);

  const [editingItem, setEditingItem] = useState(null);
  const [editPriceText, setEditPriceText] = useState('');

  const handlePriceEdit = (item) => {
    setEditingItem(item);
    setEditPriceText(item.price.toString());
  };

  const savePriceEdit = async () => {
    if (!editingItem) return;
    const parsed = parseInt(editPriceText, 10);
    if (isNaN(parsed) || parsed < 0) {
      Alert.alert('Invalid price', 'Please enter a valid non-negative number.');
      return;
    }
    try {
      await apiFetch(`/api/menu/${editingItem._id}`, {
        method: 'PUT',
        body: JSON.stringify({ price: parsed }),
      });
      setEditingItem(null);
      refetch();
    } catch (err) {
      Alert.alert('Error', err.message);
    }
  };

  const handleToggleAvailability = async (item) => {
    try {
      await apiFetch(`/api/menu/${item._id}`, {
        method: 'PUT',
        body: JSON.stringify({ isAvailable: !item.isAvailable }),
      });
      refetch();
    } catch (err) {
      Alert.alert('Error', err.message);
    }
  };

  if (loading) return <ActivityIndicator style={{ marginTop: 40 }} color={theme.primary} />;
  if (error) return <Text style={s.emptyText}>{error}</Text>;

  return (
    <View>
      {/* Edit Price Modal */}
      {editingItem && (
        <View style={StyleSheet.absoluteFillObject}>
          <View style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, backgroundColor: '#00000080', justifyContent: 'center', alignItems: 'center', zIndex: 1000, elevation: 1000 }}>
            <View style={{ backgroundColor: theme.surface, padding: 24, borderRadius: 12, width: '80%' }}>
              <Text style={{ fontSize: 18, fontWeight: '700', color: theme.text, marginBottom: 12 }}>
                Edit Price: {editingItem.name}
              </Text>
              <TextInput
                style={{ borderWidth: 1, borderColor: theme.border, padding: 12, borderRadius: 8, color: theme.text, backgroundColor: theme.inputBg, marginBottom: 16 }}
                keyboardType="numeric"
                value={editPriceText}
                onChangeText={setEditPriceText}
                autoFocus
              />
              <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 12 }}>
                <TouchableOpacity onPress={() => setEditingItem(null)} style={{ padding: 10 }}>
                  <Text style={{ color: theme.textSecondary, fontWeight: '600' }}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={savePriceEdit} style={{ backgroundColor: theme.primary, paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8 }}>
                  <Text style={{ color: '#fff', fontWeight: '700' }}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      )}

      {(menuItems || []).map((item) => (
        <View key={item._id} style={s.card}>
          <View style={s.cardHeader}>
            <Text style={s.cardTitle}>{item.name}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{ color: theme.textSecondary, fontSize: 12, marginRight: 8 }}>Available</Text>
              <Switch
                value={item.isAvailable}
                onValueChange={() => handleToggleAvailability(item)}
                trackColor={{ true: theme.success, false: theme.disabled }}
              />
            </View>
          </View>
          <Text style={s.metaText}>Rs {item.price} · {item.category}</Text>
          <TouchableOpacity
            style={[s.btnAccent, { alignSelf: 'flex-start', marginTop: 10 }]}
            onPress={() => handlePriceEdit(item)}
          >
            <Text style={s.btnTextWhite}>Edit Price</Text>
          </TouchableOpacity>
        </View>
      ))}
    </View>
  );
}

const styles = (theme) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.background },
  tabBarWrapper: {
    backgroundColor: theme.surface,
    alignItems: 'center',
    width: '100%',
    borderBottomWidth: 1,
    borderBottomColor: theme.border || '#e2e8f0',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
  },
  tabBar: { flexDirection: 'row', width: '100%', maxWidth: 860 },
  content: { padding: 16, alignItems: 'center' },
  responsiveContainer: { width: '100%', maxWidth: 860 },
  emptyText: { color: theme.textSecondary, textAlign: 'center', marginTop: 40, fontSize: 16 },
  card: {
    backgroundColor: theme.card, borderRadius: 14, padding: 18, marginBottom: 14,
    borderWidth: 1, borderColor: theme.border || '#f1f5f9',
    elevation: 2, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 3 },
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  cardTitle: { color: theme.text, fontSize: 16, fontWeight: '700', flex: 1, marginRight: 8 },
  statusBadge: { backgroundColor: theme.primary + '22', color: theme.primary, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, fontSize: 12, fontWeight: '600' },
  metaText: { color: theme.textSecondary, fontSize: 14, marginBottom: 4 },
  actionRow: { flexDirection: 'row', gap: 12, marginTop: 12 },
  btnPrimary: { backgroundColor: theme.primary, paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8, alignItems: 'center', flex: 1 },
  btnSuccess: { backgroundColor: theme.success || '#22c55e', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8, alignItems: 'center', flex: 1 },
  btnAccent: { backgroundColor: theme.accent || theme.primary, paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8, alignItems: 'center' },
  btnErrorOutlined: { borderWidth: 1, borderColor: theme.error, paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8, alignItems: 'center', flex: 1 },
  btnTextWhite: { color: '#fff', fontWeight: '700' },
  btnTextError: { color: theme.error, fontWeight: '700' },
});
