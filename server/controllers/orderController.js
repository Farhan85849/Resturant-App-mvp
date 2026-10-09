const mongoose = require('mongoose');
const Order = require('../models/Order');
const MenuItem = require('../models/MenuItem');

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

// Valid status transition rules
const STATUS_ORDER = ['Pending', 'Preparing', 'Ready', 'Served'];

// POST /api/orders
const createOrder = async (req, res) => {
  try {
    const { items, tableNumber, specialInstructions } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Order must include at least one item' });
    }

    // Resolve items from DB — we compute the total server-side
    // so the client cannot send a manipulated price
    let total = 0;
    const resolvedItems = [];

    for (const orderItem of items) {
      if (!isValidId(orderItem.menuItemId)) {
        return res.status(400).json({ message: `Invalid menu item ID: ${orderItem.menuItemId}` });
      }

      const dbItem = await MenuItem.findById(orderItem.menuItemId);
      if (!dbItem) {
        return res.status(404).json({ message: `Menu item not found: ${orderItem.menuItemId}` });
      }
      if (!dbItem.isAvailable) {
        return res.status(400).json({ message: `'${dbItem.name}' is currently unavailable` });
      }

      const qty = Math.max(1, parseInt(orderItem.quantity) || 1);
      total += dbItem.price * qty;

      resolvedItems.push({
        menuItem: dbItem._id,
        name: dbItem.name,
        price: dbItem.price,
        quantity: qty,
      });
    }

    const order = await Order.create({
      customer: req.user._id,
      items: resolvedItems,
      total,
      tableNumber,
      specialInstructions,
    });

    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/orders/my — customer's own orders
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ customer: req.user._id })
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/orders — all orders (manager only)
const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('customer', 'name email')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PATCH /api/orders/:id/status — manager updates status
const updateOrderStatus = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid order ID' });
    }

    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ message: 'Status is required' });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const currentIndex = STATUS_ORDER.indexOf(order.status);
    const newIndex = STATUS_ORDER.indexOf(status);

    // Allow cancellation only while Pending
    if (status === 'Cancelled') {
      if (order.status !== 'Pending') {
        return res.status(400).json({
          message: 'Order can only be cancelled while it is Pending',
        });
      }
    } else {
      // Status must move forward only
      if (newIndex === -1) {
        return res.status(400).json({ message: `Invalid status: ${status}` });
      }
      if (newIndex !== currentIndex + 1) {
        return res.status(400).json({
          message: `Cannot change status from '${order.status}' to '${status}'. Status must move forward.`,
        });
      }
    }

    order.status = status;
    await order.save();

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createOrder, getMyOrders, getAllOrders, updateOrderStatus };
