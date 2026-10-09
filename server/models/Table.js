const mongoose = require('mongoose');

const tableSchema = new mongoose.Schema(
  {
    tableNumber: {
      type: Number,
      required: [true, 'Table number is required'],
      unique: true,
    },
    capacity: {
      type: Number,
      required: [true, 'Capacity is required'],
      min: [1, 'Capacity must be at least 1'],
    },
    location: {
      type: String,
      default: 'Main Hall',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Table', tableSchema);
