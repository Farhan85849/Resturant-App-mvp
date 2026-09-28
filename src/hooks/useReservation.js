// src/hooks/useReservation.js
// Encapsulates all reservation business logic – screen stays pure UI
import { useState, useCallback } from 'react';
import { mockTables } from '../data/tables';

// Hourly slots 12:00 → 22:00
export const TIME_SLOTS = Array.from({ length: 11 }, (_, i) => {
  const h = 12 + i;
  return `${String(h).padStart(2, '0')}:00`;
});

const PAKISTANI_PHONE_RE = /^03\d{2}-\d{7}$/;

function isSlotDisabled(slot, date, partySize, reservations) {
  // Parse the slot datetime
  const [h] = slot.split(':').map(Number);
  const slotDate = new Date(`${date}T${slot}:00`);
  const now = new Date();
  if (slotDate <= now) return true;   // in the past

  // Find tables with enough seats
  const suitableTables = mockTables.filter((t) => t.seats >= partySize);
  if (suitableTables.length === 0) return true;

  // Check if any suitable table is free at this slot
  const confirmedOnDate = reservations.filter(
    (r) => r.date === date && r.timeSlot === slot && r.status === 'confirmed'
  );
  const bookedTableIds = confirmedOnDate.map((r) => r.tableId);
  const freeTable = suitableTables.find((t) => !bookedTableIds.includes(t.id));
  return !freeTable;
}

export default function useReservation(reservations, addReservation) {
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [partySize, setPartySize] = useState(2);
  const [contactName, setContactName] = useState('');
  const [phone, setPhone] = useState('');
  const [formError, setFormError] = useState(null);
  const [confirmationData, setConfirmationData] = useState(null); // shown in modal

  const slotStatuses = TIME_SLOTS.map((slot) => ({
    slot,
    disabled: isSlotDisabled(slot, selectedDate, partySize, reservations),
  }));

  const validate = useCallback(() => {
    const now = new Date();
    const today = now.toISOString().split('T')[0];

    if (selectedDate < today) return 'Please choose a date that is not in the past.';
    if (!selectedSlot) return 'Please select a time slot.';
    if (partySize < 1 || partySize > 12) return 'Party size must be between 1 and 12.';
    if (!PAKISTANI_PHONE_RE.test(phone)) return 'Phone must be in format 03XX-XXXXXXX.';
    if (!contactName.trim()) return 'Please enter your name.';

    // At least 1 hour ahead
    const [h, m] = selectedSlot.split(':').map(Number);
    const slotTime = new Date(`${selectedDate}T${selectedSlot}:00`);
    const diff = (slotTime - now) / 60000; // minutes
    if (diff < 60) return 'Booking must be at least 1 hour ahead.';

    return null;
  }, [selectedDate, selectedSlot, partySize, phone, contactName]);

  const prepareConfirmation = useCallback(() => {
    const err = validate();
    if (err) { setFormError(err); return false; }

    // Find first free suitable table
    const confirmedOnDate = reservations.filter(
      (r) => r.date === selectedDate && r.timeSlot === selectedSlot && r.status === 'confirmed'
    );
    const bookedIds = confirmedOnDate.map((r) => r.tableId);
    const table = mockTables.find((t) => t.seats >= partySize && !bookedIds.includes(t.id));

    setFormError(null);
    setConfirmationData({
      date: selectedDate,
      timeSlot: selectedSlot,
      partySize,
      contactName,
      phone,
      tableId: table.id,
      tableNumber: table.number,
      tableLocation: table.location,
    });
    return true;
  }, [validate, reservations, selectedDate, selectedSlot, partySize, contactName, phone]);

  const createReservation = useCallback(
    (userId) => {
      if (!confirmationData) return null;
      const res = addReservation({ ...confirmationData, userId });
      setConfirmationData(null);
      return res;
    },
    [confirmationData, addReservation]
  );

  const cancelConfirmation = useCallback(() => setConfirmationData(null), []);

  return {
    selectedDate, setSelectedDate,
    selectedSlot, setSelectedSlot,
    partySize, setPartySize,
    contactName, setContactName,
    phone, setPhone,
    formError, setFormError,
    slotStatuses,
    confirmationData,
    prepareConfirmation,
    createReservation,
    cancelConfirmation,
  };
}
