// src/screens/ReservationScreen.js
// Q9: Pure UI – all logic in useReservation hook
import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Alert, Modal, FlatList,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useReservations } from '../context/ReservationContext';
import useReservation, { TIME_SLOTS } from '../hooks/useReservation';

export default function ReservationScreen() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const { reservations, addReservation, cancelReservation } = useReservations();

  const hook = useReservation(reservations, addReservation);
  const s = styles(theme);

  const myReservations = reservations.filter((r) => r.userId === user?.id);

  const handleCancel = (id) => {
    Alert.alert(
      'Cancel Reservation',
      'Are you sure you want to cancel this booking?',
      [
        { text: 'Keep', style: 'cancel' },
        {
          text: 'Cancel Booking',
          style: 'destructive',
          onPress: () => cancelReservation(id),
        },
      ]
    );
  };

  // Generate next 14 dates for date picker
  const dates = Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return d.toISOString().split('T')[0];
  });

  return (
    <ScrollView style={s.container} contentContainerStyle={{ padding: 20 }}>
      <Text style={s.heading}>Table Reservation</Text>

      {/* Date picker */}
      <Text style={s.label}>Select Date</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.dateScroll}>
        {dates.map((date) => {
          const d = new Date(date);
          const day = d.toLocaleDateString('en-US', { weekday: 'short' });
          const num = d.getDate();
          return (
            <TouchableOpacity
              key={date}
              style={[s.dateChip, hook.selectedDate === date && s.dateChipActive]}
              onPress={() => {
                hook.setSelectedDate(date);
                hook.setSelectedSlot(null);
              }}
            >
              <Text style={[s.dateDayText, hook.selectedDate === date && s.dateActiveText]}>{day}</Text>
              <Text style={[s.dateNumText, hook.selectedDate === date && s.dateActiveText]}>{num}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Party size */}
      <Text style={s.label}>Party Size</Text>
      <View style={s.partySizeRow}>
        <TouchableOpacity
          style={s.partySizeBtn}
          onPress={() => hook.setPartySize((p) => Math.max(1, p - 1))}
        >
          <Text style={s.partySizeBtnText}>−</Text>
        </TouchableOpacity>
        <Text style={s.partySizeNum}>{hook.partySize}</Text>
        <TouchableOpacity
          style={s.partySizeBtn}
          onPress={() => hook.setPartySize((p) => Math.min(12, p + 1))}
        >
          <Text style={s.partySizeBtnText}>+</Text>
        </TouchableOpacity>
        <Text style={s.partySizeLabel}>guests (max 12)</Text>
      </View>

      {/* Time slots */}
      <Text style={s.label}>Select Time</Text>
      <View style={s.slotsGrid}>
        {hook.slotStatuses.map(({ slot, disabled }) => (
          <TouchableOpacity
            key={slot}
            style={[
              s.slotChip,
              hook.selectedSlot === slot && s.slotChipActive,
              disabled && s.slotChipDisabled,
            ]}
            onPress={() => !disabled && hook.setSelectedSlot(slot)}
            disabled={disabled}
          >
            <Text
              style={[
                s.slotText,
                hook.selectedSlot === slot && s.slotTextActive,
                disabled && s.slotTextDisabled,
              ]}
            >
              {slot}
            </Text>
            {disabled && <Text style={s.disabledLabel}>Full</Text>}
          </TouchableOpacity>
        ))}
      </View>

      {/* Contact details */}
      <Text style={s.label}>Your Name</Text>
      <TextInput
        style={s.input}
        placeholder="Full name"
        placeholderTextColor={theme.placeholder}
        value={hook.contactName}
        onChangeText={hook.setContactName}
      />

      <Text style={s.label}>Phone Number</Text>
      <TextInput
        style={s.input}
        placeholder="03XX-XXXXXXX"
        placeholderTextColor={theme.placeholder}
        value={hook.phone}
        onChangeText={hook.setPhone}
        keyboardType="phone-pad"
      />

      {hook.formError ? (
        <Text style={s.errorText}>{hook.formError}</Text>
      ) : null}

      <TouchableOpacity
        style={s.reserveBtn}
        onPress={() => hook.prepareConfirmation()}
      >
        <Text style={s.reserveBtnText}>Reserve Table</Text>
      </TouchableOpacity>

      {/* My Reservations */}
      {myReservations.length > 0 && (
        <>
          <Text style={[s.heading, { marginTop: 32 }]}>My Reservations</Text>
          {myReservations.map((res) => (
            <View key={res.id} style={s.resCard}>
              <View style={s.resHeader}>
                <Text style={s.resTitle}>Table #{res.tableNumber} — {res.tableLocation}</Text>
                <Text
                  style={[
                    s.resBadge,
                    res.status === 'confirmed' && { color: theme.success },
                    res.status === 'cancelled' && { color: theme.error },
                    res.status === 'declined' && { color: theme.error },
                  ]}
                >
                  {res.status.toUpperCase()}
                </Text>
              </View>
              <Text style={s.resMeta}>
                📅 {res.date} at {res.timeSlot} · 👥 {res.partySize} guests
              </Text>
              <Text style={s.resMeta}>📞 {res.phone}</Text>
              {res.status === 'confirmed' && (
                <TouchableOpacity
                  style={s.cancelResBtn}
                  onPress={() => handleCancel(res.id)}
                >
                  <Text style={s.cancelResBtnText}>Cancel Booking</Text>
                </TouchableOpacity>
              )}
            </View>
          ))}
        </>
      )}

      {/* Confirmation Modal */}
      <Modal visible={!!hook.confirmationData} transparent animationType="slide">
        <View style={s.modalOverlay}>
          <View style={s.modalCard}>
            <Text style={s.modalTitle}>Confirm Reservation</Text>
            {hook.confirmationData && (
              <>
                <InfoRow label="Date" value={hook.confirmationData.date} theme={theme} />
                <InfoRow label="Time" value={hook.confirmationData.timeSlot} theme={theme} />
                <InfoRow label="Guests" value={`${hook.confirmationData.partySize}`} theme={theme} />
                <InfoRow label="Table" value={`#${hook.confirmationData.tableNumber} (${hook.confirmationData.tableLocation})`} theme={theme} />
                <InfoRow label="Name" value={hook.confirmationData.contactName} theme={theme} />
                <InfoRow label="Phone" value={hook.confirmationData.phone} theme={theme} />
              </>
            )}
            <View style={s.modalBtns}>
              <TouchableOpacity style={s.modalCancelBtn} onPress={hook.cancelConfirmation}>
                <Text style={{ color: theme.text, fontWeight: '600' }}>Go Back</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={s.modalConfirmBtn}
                onPress={() => {
                  hook.createReservation(user?.id);
                  Alert.alert('Booked! 🎉', 'Your table has been reserved successfully.');
                }}
              >
                <Text style={{ color: '#fff', fontWeight: '700' }}>Confirm</Text>
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
      width: '29%', paddingVertical: 10, borderRadius: 10,
      backgroundColor: theme.chipBg, alignItems: 'center', borderWidth: 1, borderColor: theme.border,
    },
    slotChipActive: { backgroundColor: theme.primary, borderColor: theme.primary },
    slotChipDisabled: { backgroundColor: theme.disabled + '44', borderColor: theme.border },
    slotText: { color: theme.text, fontWeight: '600', fontSize: 14 },
    slotTextActive: { color: '#fff' },
    slotTextDisabled: { color: theme.disabledText },
    disabledLabel: { fontSize: 10, color: theme.error, fontWeight: '600' },
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
    resBadge: { fontWeight: '700', fontSize: 12 },
    resMeta: { fontSize: 13, color: theme.textSecondary, marginBottom: 2 },
    cancelResBtn: { marginTop: 8, borderWidth: 1, borderColor: theme.error, borderRadius: 8, paddingVertical: 8, alignItems: 'center' },
    cancelResBtnText: { color: theme.error, fontWeight: '700' },
    modalOverlay: { flex: 1, backgroundColor: theme.overlay, justifyContent: 'flex-end' },
    modalCard: {
      backgroundColor: theme.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24,
      padding: 24, paddingBottom: 40,
    },
    modalTitle: { fontSize: 20, fontWeight: '800', color: theme.text, marginBottom: 20, textAlign: 'center' },
    modalBtns: { flexDirection: 'row', gap: 12, marginTop: 20 },
    modalCancelBtn: {
      flex: 1, paddingVertical: 14, borderRadius: 12, backgroundColor: theme.inputBg, alignItems: 'center',
    },
    modalConfirmBtn: {
      flex: 1, paddingVertical: 14, borderRadius: 12, backgroundColor: theme.primary, alignItems: 'center',
    },
  });
