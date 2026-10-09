const express = require('express');
const router = express.Router();
const {
  getMenuItems,
  getMenuItemById,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
} = require('../controllers/menuController');
const { protect, managerOnly } = require('../middleware/auth');

// Public: anyone can view the menu
router.get('/', getMenuItems);
router.get('/:id', getMenuItemById);

// Protected: only managers can modify the menu
router.post('/', protect, managerOnly, createMenuItem);
router.put('/:id', protect, managerOnly, updateMenuItem);
router.delete('/:id', protect, managerOnly, deleteMenuItem);

module.exports = router;
