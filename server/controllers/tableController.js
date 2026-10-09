const Table = require('../models/Table');

// GET /api/tables — returns list of all tables
const getTables = async (req, res) => {
  try {
    const tables = await Table.find().sort({ tableNumber: 1 });
    res.json(tables);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getTables };

