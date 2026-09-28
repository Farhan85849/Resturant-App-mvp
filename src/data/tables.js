// src/data/tables.js
// Mock tables and reservations data

export const mockTables = [
  { id: 't1', number: 1, seats: 2, location: 'Window' },
  { id: 't2', number: 2, seats: 4, location: 'Center' },
  { id: 't3', number: 3, seats: 4, location: 'Center' },
  { id: 't4', number: 4, seats: 6, location: 'Garden' },
  { id: 't5', number: 5, seats: 8, location: 'Private Room' },
  { id: 't6', number: 6, seats: 2, location: 'Bar' },
  { id: 't7', number: 7, seats: 4, location: 'Terrace' },
  { id: 't8', number: 8, seats: 6, location: 'Garden' },
];

// Pre-seeded reservations for demo purposes
export const mockReservations = [
  {
    id: 'r0',
    tableId: 't2',
    date: new Date().toISOString().split('T')[0],
    timeSlot: '14:00',
    partySize: 3,
    customerName: 'Demo Guest',
    phone: '0311-1234567',
    status: 'confirmed',
    userId: 'u1',
  },
];
