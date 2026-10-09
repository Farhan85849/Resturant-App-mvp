const mongoose = require('mongoose');
const Reservation = require('../models/Reservation');
const Table = require('../models/Table');

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

// POST /api/reservations
const createReservation = async (req, res) => {
  try {
    const { tableId, date, time, guestCount, specialRequests } = req.body;

    if (!tableId || !date || !time || !guestCount) {
      return res.status(400).json({ message: 'tableId, date, time, and guestCount are required' });
    }

    let table = null;
    if (isValidId(tableId)) {
      table = await Table.findById(tableId);
    }
    if (!table) {
      const num = parseInt(tableId, 10);
      if (!isNaN(num)) {
        table = await Table.findOne({ tableNumber: num });
      }
    }

    if (!table) {
      return res.status(404).json({ message: 'Table not found' });
    }

    if (guestCount > table.capacity) {
      return res.status(400).json({
        message: `Table ${table.tableNumber} can only seat ${table.capacity} guests`,
      });
    }

    // Check for existing reservation at same table, date, and time
    const conflict = await Reservation.findOne({
      table: table._id,
      date,
      time,
      status: { $in: ['Pending', 'Confirmed'] },
    });

    if (conflict) {
      return res.status(409).json({
        message: `Table ${table.tableNumber} is already booked at ${time} on ${date}`,
      });
    }

    const reservation = await Reservation.create({
      customer: req.user._id,
      table: table._id,
      date,
      time,
      guestCount,
      specialRequests: specialRequests || '',
    });

    await reservation.populate('table', 'tableNumber capacity location');
    res.status(201).json(reservation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/reservations/my
const getMyReservations = async (req, res) => {
  try {
    const reservations = await Reservation.find({ customer: req.user._id })
      .populate('table', 'tableNumber capacity location')
      .sort({ date: -1, time: -1 });
    res.json(reservations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/reservations — manager sees all
const getAllReservations = async (req, res) => {
  try {
    const reservations = await Reservation.find()
      .populate('customer', 'name email')
      .populate('table', 'tableNumber capacity location')
      .sort({ date: -1, time: -1 });
    res.json(reservations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PATCH /api/reservations/:id — manager accept or decline
const updateReservationStatus = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid reservation ID' });
    }

    const { status } = req.body;
    const allowedStatuses = ['Confirmed', 'Declined', 'Cancelled'];

    if (!status || !allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: `Status must be one of: ${allowedStatuses.join(', ')}`,
      });
    }

    const reservation = await Reservation.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    ).populate('table', 'tableNumber capacity location');

    if (!reservation) {
      return res.status(404).json({ message: 'Reservation not found' });
    }

    res.json(reservation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createReservation, getMyReservations, getAllReservations, updateReservationStatus };
