// src/screens/ReservationScreen.js
// Makes and lists reservations from the real server.
// POST /api/reservations to book, GET /api/reservations/my for history.

import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Alert, Modal, ActivityIndicator,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { apiFetch } from '../api/client';
import useApi from '../hooks/useApi';

const TIME_SLOTS = [
  '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
  '18:00', '18:30', '19:00', '19:30', '20:00', '20:30',
];

export default function ReservationScreen() {
  const { theme } = useTheme();
  const s = styles(theme);

  // ── Fetch tables from server ─────────────────────────────────────────
  const [tables, setTables] = useState([]);
  const [loadingTables, setLoadingTables] = useState(true);

  const fetchTables = useCallback(async () => {
    try {
      const data = await apiFetch('/api/tables');
      setTables(data);
    } catch (_) {
      // Fallback table list if network or server seeding is fresh
      setTables([
        { _id: '1', tableNumber: 1, capacity: 2, location: 'Window' },
        { _id: '2', tableNumber: 2, capacity: 4, location: 'Main Hall' },
        { _id: '3', tableNumber: 3, capacity: 4, location: 'Main Hall' },
        { _id: '4', tableNumber: 4, capacity: 6, location: 'Garden' },
        { _id: '5', tableNumber: 5, capacity: 8, location: 'Private Room' },
        { _id: '6', tableNumber: 6, capacity: 2, location: 'Bar' },
      ]);
    } finally {
      setLoadingTables(false);
    }
  }, []);

  useEffect(() => {
    fetchTables();
  }, [fetchTables]);

  // ── Fetch my reservations from server ────────────────────────────────
  const fetchMyReservations = useCallback(() => apiFetch('/api/reservations/my'), []);
  const { data: myReservations, loading: loadingRes, refetch: refetchReservations } = useApi(fetchMyReservations, []);

  // ── Form state ────────────────────────────────────────────────────────
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [guestCount, setGuestCount] = useState(2);
  const [specialRequests, setSpecialRequests] = useState('');
  const [selectedTable, setSelectedTable] = useState(null);
  const [formError, setFormError] = useState(null);
  const [placing, setPlacing] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const dates = Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return d.toISOString().split('T')[0];
  });

  const availableTables = tables.filter((t) => t.capacity >= guestCount);

  const validate = () => {
    if (!selectedDate) { setFormError('Please select a date.'); return false; }
    if (!selectedTime) { setFormError('Please select a time.'); return false; }
    if (!selectedTable) { setFormError('Please select a table.'); return false; }
    setFormError(null);
    return true;
  };

  const handleReserve = async () => {
    setPlacing(true);
    try {
      await apiFetch('/api/reservations', {
        method: 'POST',
        body: JSON.stringify({
          tableId: selectedTable._id || selectedTable.tableNumber,
          date: selectedDate,
          time: selectedTime,
          guestCount,
          specialRequests: specialRequests.trim() || undefined,
        }),
      });

      setShowModal(false);
      await refetchReservations();
      Alert.alert('Booked! 🎉', 'Your table reservation has been saved to the database!');

      // Reset form
      setSelectedDate(null);
      setSelectedTime(null);
      setGuestCount(2);
      setSpecialRequests('');
      setSelectedTable(null);
    } catch (err) {
      setShowModal(false);
      Alert.alert('Booking Failed', err.message || 'Could not place reservation.');
    } finally {
      setPlacing(false);
    }
  };

  const handleCancel = async (id) => {
    Alert.alert(
      'Cancel Reservation',
      'Are you sure you want to cancel this booking?',
      [
        { text: 'Keep', style: 'cancel' },
        {
          text: 'Cancel Booking',
          style: 'destructive',
          onPress: async () => {
            try {
              await apiFetch(`/api/reservations/${id}`, {
                method: 'PATCH',
                body: JSON.stringify({ status: 'Cancelled' }),
              });
              refetchReservations();
            } catch (err) {
              Alert.alert('Error', err.message);
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={s.container} contentContainerStyle={{ padding: 20 }}>
      <Text style={s.heading}>Table Reservation</Text>

      {/* Date picker */}
      <Text style={s.label}>Select Date</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.dateScroll}>
        {dates.map((date) => {
          const d = new Date(date + 'T00:00:00');
          const day = d.toLocaleDateString('en-US', { weekday: 'short' });
          const num = d.getDate();
          return (
            <TouchableOpacity
              key={date}
              style={[s.dateChip, selectedDate === date && s.dateChipActive]}
              onPress={() => { setSelectedDate(date); setSelectedTime(null); }}
            >
              <Text style={[s.dateDayText, selectedDate === date && s.dateActiveText]}>{day}</Text>
              <Text style={[s.dateNumText, selectedDate === date && s.dateActiveText]}>{num}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Guest count */}
      <Text style={s.label}>Guest Count</Text>
      <View style={s.partySizeRow}>
        <TouchableOpacity style={s.partySizeBtn} onPress={() => setGuestCount((p) => Math.max(1, p - 1))}>
          <Text style={s.partySizeBtnText}>−</Text>
        </TouchableOpacity>
        <Text style={s.partySizeNum}>{guestCount}</Text>
        <TouchableOpacity style={s.partySizeBtn} onPress={() => setGuestCount((p) => Math.min(12, p + 1))}>
          <Text style={s.partySizeBtnText}>+</Text>
        </TouchableOpacity>
        <Text style={s.partySizeLabel}>guests (max 12)</Text>
      </View>

      {/* Time slots */}
      <Text style={s.label}>Select Time</Text>
      <View style={s.slotsGrid}>
        {TIME_SLOTS.map((slot) => (
          <TouchableOpacity
            key={slot}
            style={[s.slotChip, selectedTime === slot && s.slotChipActive]}
            onPress={() => setSelectedTime(slot)}
          >
            <Text style={[s.slotText, selectedTime === slot && s.slotTextActive]}>{slot}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Table selection */}
      <Text style={s.label}>Select Table (for {guestCount} guests)</Text>
      {loadingTables ? (
        <ActivityIndicator color={theme.primary} />
      ) : availableTables.length === 0 ? (
        <Text style={{ color: theme.error, marginBottom: 8 }}>No tables available for {guestCount} guests.</Text>
      ) : (
        <View style={s.slotsGrid}>
          {availableTables.map((table) => {
            const isSelected = selectedTable?.tableNumber === table.tableNumber;
            return (
              <TouchableOpacity
                key={table._id || table.tableNumber}
                style={[s.slotChip, isSelected && s.slotChipActive, { width: '45%' }]}
                onPress={() => setSelectedTable(table)}
              >
                <Text style={[s.slotText, isSelected && s.slotTextActive]}>
                  Table #{table.tableNumber}
                </Text>
                <Text style={{ fontSize: 11, color: isSelected ? '#fff' : theme.textSecondary }}>
                  {table.location} · seats {table.capacity}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      {/* Special requests */}
      <Text style={s.label}>Special Requests (optional)</Text>
      <TextInput
        style={s.input}
        placeholder="e.g. birthday cake, wheelchair access..."
        placeholderTextColor={theme.placeholder}
        value={specialRequests}
        onChangeText={setSpecialRequests}
        multiline
      />

      {formError ? <Text style={s.errorText}>{formError}</Text> : null}

      <TouchableOpacity
        style={s.reserveBtn}
        onPress={() => { if (validate()) setShowModal(true); }}
      >
        <Text style={s.reserveBtnText}>Reserve Table</Text>
      </TouchableOpacity>

      {/* My Reservations List */}
      <Text style={[s.heading, { marginTop: 32 }]}>My Reservations</Text>
      {loadingRes ? (
        <ActivityIndicator color={theme.primary} />
      ) : !myReservations || myReservations.length === 0 ? (
        <Text style={{ color: theme.textSecondary }}>No reservations found in database.</Text>
      ) : (
        myReservations.map((res) => (
          <View key={res._id} style={s.resCard}>
            <View style={s.resHeader}>
              <Text style={s.resTitle}>
                Table #{res.table?.tableNumber || '?'} — {res.table?.location || 'Main Hall'}
              </Text>
              <Text style={[
                s.resBadge,
                res.status === 'Confirmed' && { color: theme.success || '#22c55e' },
                (res.status === 'Cancelled' || res.status === 'Declined') && { color: theme.error },
              ]}>
                {res.status.toUpperCase()}
              </Text>
            </View>
            <Text style={s.resMeta}>📅 {res.date} at {res.time} · 👥 {res.guestCount} guests</Text>
            {res.specialRequests ? <Text style={s.resMeta}>📝 {res.specialRequests}</Text> : null}
            {(res.status === 'Pending' || res.status === 'Confirmed') && (
              <TouchableOpacity style={s.cancelResBtn} onPress={() => handleCancel(res._id)}>
                <Text style={s.cancelResBtnText}>Cancel Booking</Text>
              </TouchableOpacity>
            )}
          </View>
        ))
      )}

      {/* Confirmation Modal */}
      <Modal visible={showModal} transparent animationType="slide">
        <View style={s.modalOverlay}>
          <View style={s.modalCard}>
            <Text style={s.modalTitle}>Confirm Reservation</Text>
            <InfoRow label="Date" value={selectedDate || '-'} theme={theme} />
            <InfoRow label="Time" value={selectedTime || '-'} theme={theme} />
            <InfoRow label="Guests" value={`${guestCount}`} theme={theme} />
            <InfoRow label="Table" value={`Table #${selectedTable?.tableNumber} (${selectedTable?.location})`} theme={theme} />
            <InfoRow label="Requests" value={specialRequests || 'None'} theme={theme} />
            <View style={s.modalBtns}>
              <TouchableOpacity style={s.modalCancelBtn} onPress={() => setShowModal(false)}>
                <Text style={{ color: theme.text, fontWeight: '600' }}>Go Back</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[s.modalConfirmBtn, placing && { opacity: 0.6 }]} onPress={handleReserve} disabled={placing}>
                {placing ? <ActivityIndicator color="#fff" /> : <Text style={{ color: '#fff', fontWeight: '700' }}>Confirm</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

function InfoRow({ label, value, theme }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
      <Text style={{ color: theme.textSecondary, fontSize: 14 }}>{label}</Text>
      <Text style={{ color: theme.text, fontWeight: '600', fontSize: 14 }}>{value}</Text>
    </View>
  );
}

const styles = (theme) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.background },
    heading: { fontSize: 22, fontWeight: '800', color: theme.text, marginBottom: 16 },
    label: { fontSize: 14, fontWeight: '700', color: theme.text, marginBottom: 8, marginTop: 16 },
    dateScroll: { maxHeight: 80, marginBottom: 4 },
    dateChip: {
      width: 56, height: 64, borderRadius: 12, backgroundColor: theme.chipBg,
      justifyContent: 'center', alignItems: 'center', marginRight: 8,
      borderWidth: 1, borderColor: theme.border,
    },
    dateChipActive: { backgroundColor: theme.primary, borderColor: theme.primary },
    dateDayText: { fontSize: 11, color: theme.textSecondary, fontWeight: '600' },
    dateNumText: { fontSize: 20, color: theme.text, fontWeight: '800' },
    dateActiveText: { color: '#fff' },
    partySizeRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 4 },
    partySizeBtn: {
      width: 38, height: 38, borderRadius: 19,
      backgroundColor: theme.primary, justifyContent: 'center', alignItems: 'center',
    },
    partySizeBtnText: { color: '#fff', fontSize: 22, lineHeight: 24 },
    partySizeNum: { fontSize: 24, fontWeight: '800', color: theme.text, minWidth: 30, textAlign: 'center' },
    partySizeLabel: { color: theme.textSecondary, fontSize: 13 },
    slotsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 8 },
    slotChip: {
      paddingVertical: 10, paddingHorizontal: 12, borderRadius: 10,
      backgroundColor: theme.chipBg, alignItems: 'center', borderWidth: 1, borderColor: theme.border,
    },
    slotChipActive: { backgroundColor: theme.primary, borderColor: theme.primary },
    slotText: { color: theme.text, fontWeight: '600', fontSize: 14 },
    slotTextActive: { color: '#fff' },
    input: {
      backgroundColor: theme.inputBg, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12,
      fontSize: 14, color: theme.text, borderWidth: 1, borderColor: theme.border, marginBottom: 4,
    },
    errorText: { color: theme.error, fontSize: 13, marginBottom: 12 },
    reserveBtn: { backgroundColor: theme.primary, borderRadius: 12, paddingVertical: 16, alignItems: 'center', marginTop: 20 },
    reserveBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
    resCard: {
      backgroundColor: theme.card, borderRadius: 12, padding: 14, marginBottom: 12,
      shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, elevation: 2,
    },
    resHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
    resTitle: { fontSize: 15, fontWeight: '700', color: theme.text, flex: 1 },
    resBadge: { fontWeight: '700', fontSize: 12, color: theme.textSecondary },
    resMeta: { fontSize: 13, color: theme.textSecondary, marginBottom: 2 },
    cancelResBtn: { marginTop: 8, borderWidth: 1, borderColor: theme.error, borderRadius: 8, paddingVertical: 8, alignItems: 'center' },
    cancelResBtnText: { color: theme.error, fontWeight: '700' },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalCard: {
      backgroundColor: theme.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24,
      padding: 24, paddingBottom: 40,
    },
    modalTitle: { fontSize: 20, fontWeight: '800', color: theme.text, marginBottom: 20, textAlign: 'center' },
    modalBtns: { flexDirection: 'row', gap: 12, marginTop: 20 },
    modalCancelBtn: { flex: 1, paddingVertical: 14, borderRadius: 12, backgroundColor: theme.inputBg, alignItems: 'center' },
    modalConfirmBtn: { flex: 1, paddingVertical: 14, borderRadius: 12, backgroundColor: theme.primary, alignItems: 'center' },
  });
