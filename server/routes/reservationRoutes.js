const express = require('express');
const router = express.Router();
const {
  createReservation,
  getMyReservations,
  getAllReservations,
  updateReservationStatus,
} = require('../controllers/reservationController');
const { protect, managerOnly } = require('../middleware/auth');

router.post('/', protect, createReservation);
router.get('/my', protect, getMyReservations);
router.get('/', protect, managerOnly, getAllReservations);
router.patch('/:id', protect, managerOnly, updateReservationStatus);

module.exports = router;
