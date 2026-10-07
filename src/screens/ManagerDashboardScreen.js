// src/screens/ManagerDashboardScreen.js
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Alert, Switch
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useOrders } from '../context/OrdersContext';
import { useReservations } from '../context/ReservationContext';
import { useMenu } from '../context/MenuContext';

export default function ManagerDashboardScreen() {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState('orders'); // orders, reservations, menu
  const s = styles(theme);

  return (
    <View style={s.container}>
      <View style={s.tabBar}>
        <TabButton id="orders" label="Orders" activeTab={activeTab} setActiveTab={setActiveTab} theme={theme} />
        <TabButton id="reservations" label="Reservations" activeTab={activeTab} setActiveTab={setActiveTab} theme={theme} />
        <TabButton id="menu" label="Menu" activeTab={activeTab} setActiveTab={setActiveTab} theme={theme} />
      </View>

      <ScrollView contentContainerStyle={s.content}>
        {activeTab === 'orders' && <OrdersTab theme={theme} />}
        {activeTab === 'reservations' && <ReservationsTab theme={theme} />}
        {activeTab === 'menu' && <MenuTab theme={theme} />}
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
        isActive && { borderBottomColor: theme.primary }
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
  const { orders, dispatch } = useOrders();
  const s = styles(theme);

  const activeOrders = orders.filter(o => !['Served', 'Cancelled'].includes(o.status));

  const updateStatus = (id, status) => {
    dispatch({ type: 'UPDATE_STATUS', payload: { id, status } });
  };

  if (activeOrders.length === 0) return <Text style={s.emptyText}>No active orders.</Text>;

  return (
    <View>
      {activeOrders.map(order => (
        <View key={order.id} style={s.card}>
          <View style={s.cardHeader}>
            <Text style={s.cardTitle}>Order #{order.id.slice(-6)}</Text>
            <Text style={s.statusBadge}>{order.status}</Text>
          </View>
          <Text style={s.metaText}>{order.type} · Rs {order.total}</Text>
          
          <View style={s.actionRow}>
            {order.status === 'Pending' && (
              <TouchableOpacity style={s.btnAccent} onPress={() => updateStatus(order.id, 'Preparing')}>
                <Text style={s.btnTextWhite}>Mark Preparing</Text>
              </TouchableOpacity>
            )}
            {order.status === 'Preparing' && (
              <TouchableOpacity style={s.btnSuccess} onPress={() => updateStatus(order.id, 'Ready')}>
                <Text style={s.btnTextWhite}>Mark Ready</Text>
              </TouchableOpacity>
            )}
            {order.status === 'Ready' && (
              <TouchableOpacity style={s.btnPrimary} onPress={() => updateStatus(order.id, 'Served')}>
                <Text style={s.btnTextWhite}>Mark Served</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={s.btnErrorOutlined} onPress={() => updateStatus(order.id, 'Cancelled')}>
              <Text style={s.btnTextError}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </View>
  );
}

// ── Reservations Tab ──────────────────────────────────────────────────
function ReservationsTab({ theme }) {
  const { reservations, updateReservationStatus } = useReservations();
  const s = styles(theme);

  const pendingRes = reservations.filter(r => r.status === 'pending' || r.status === 'confirmed');

  if (pendingRes.length === 0) return <Text style={s.emptyText}>No active reservations.</Text>;

  return (
    <View>
      {pendingRes.map(res => (
        <View key={res.id} style={s.card}>
          <View style={s.cardHeader}>
            <Text style={s.cardTitle}>{res.contactName} ({res.partySize} guests)</Text>
            <Text style={s.statusBadge}>{res.status}</Text>
          </View>
          <Text style={s.metaText}>{res.date} at {res.timeSlot} · Table #{res.tableNumber}</Text>
          <Text style={s.metaText}>📞 {res.phone}</Text>
          
          <View style={s.actionRow}>
            {res.status !== 'confirmed' && (
              <TouchableOpacity style={s.btnSuccess} onPress={() => updateReservationStatus(res.id, 'confirmed')}>
                <Text style={s.btnTextWhite}>Accept</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={s.btnErrorOutlined} onPress={() => updateReservationStatus(res.id, 'declined')}>
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
  const { menuItems, updateItem, addItem } = useMenu();
  const s = styles(theme);

  const [editingItem, setEditingItem] = useState(null);
  const [editPriceText, setEditPriceText] = useState('');

  const handlePriceEdit = (item) => {
    setEditingItem(item);
    setEditPriceText(item.price.toString());
  };

  const savePriceEdit = () => {
    if (editingItem) {
      const parsed = parseInt(editPriceText, 10);
      if (!isNaN(parsed) && parsed >= 0) {
        updateItem(editingItem.id, { price: parsed });
      }
      setEditingItem(null);
    }
  };

  const handleToggleAvailability = (item) => {
    updateItem(item.id, { isAvailable: !item.isAvailable });
  };

  const handleAddItem = () => {
    const newItem = {
      name: 'New Custom Dish',
      description: 'Added by manager',
      price: 500,
      category: 'Mains',
      image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400',
      isSpecial: false,
      isAvailable: true,
    };
    addItem(newItem);
    Alert.alert('Success', 'A placeholder item was added. (Edit forms can be built out further)');
  };

  return (
    <View>
      <TouchableOpacity style={[s.btnPrimary, { marginBottom: 16 }]} onPress={handleAddItem}>
        <Text style={s.btnTextWhite}>+ Add New Menu Item</Text>
      </TouchableOpacity>

      {/* Edit Price Modal (Cross-platform alternative to Alert.prompt) */}
      {editingItem && (
        <View style={StyleSheet.absoluteFillObject}>
          <View style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, backgroundColor: '#00000080', justifyContent: 'center', alignItems: 'center', zIndex: 1000, elevation: 1000 }}>
            <View style={{ backgroundColor: theme.surface, padding: 24, borderRadius: 12, width: '80%' }}>
              <Text style={{ fontSize: 18, fontWeight: '700', color: theme.text, marginBottom: 12 }}>Edit Price for {editingItem.name}</Text>
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

      {menuItems.map(item => (
        <View key={item.id} style={s.card}>
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
          <TouchableOpacity style={[s.btnAccent, { alignSelf: 'flex-start', marginTop: 10 }]} onPress={() => handlePriceEdit(item)}>
            <Text style={s.btnTextWhite}>Edit Price</Text>
          </TouchableOpacity>
        </View>
      ))}
    </View>
  );
}

const styles = (theme) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.background },
  tabBar: { flexDirection: 'row', backgroundColor: theme.surface, elevation: 2 },
  content: { padding: 16 },
  emptyText: { color: theme.textSecondary, textAlign: 'center', marginTop: 40, fontSize: 16 },
  card: {
    backgroundColor: theme.card, borderRadius: 12, padding: 16, marginBottom: 12,
    elevation: 2, shadowColor: '#000', shadowOpacity: 0.1, shadowOffset: { width: 0, height: 1 }
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  cardTitle: { color: theme.text, fontSize: 16, fontWeight: '700' },
  statusBadge: { backgroundColor: theme.primary + '22', color: theme.primary, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, fontSize: 12, fontWeight: '600' },
  metaText: { color: theme.textSecondary, fontSize: 14, marginBottom: 4 },
  actionRow: { flexDirection: 'row', gap: 12, marginTop: 12 },
  btnPrimary: { backgroundColor: theme.primary, paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8, alignItems: 'center', flex: 1 },
  btnSuccess: { backgroundColor: theme.success, paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8, alignItems: 'center', flex: 1 },
  btnAccent: { backgroundColor: theme.accent, paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8, alignItems: 'center', flex: 1 },
  btnErrorOutlined: { borderWidth: 1, borderColor: theme.error, paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8, alignItems: 'center', flex: 1 },
  btnTextWhite: { color: '#fff', fontWeight: '700' },
  btnTextError: { color: theme.error, fontWeight: '700' },
});
