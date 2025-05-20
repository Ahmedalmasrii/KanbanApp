const Order = require('../models/Order');
const Comment = require('../models/Comment');

exports.getOrders = async (req, res) => {
  try {
    const orders = await Order.find().populate('assignedTo');
    res.json(orders);
  } catch (err) {
    res.status(500).json({ msg: 'Kunde inte hämta beställningar' });
  }
};

exports.createOrder = async (req, res) => {
  try {
    const { item } = req.body;
    if (!item) return res.status(400).json({ msg: 'Beställning saknar innehåll' });

    const newOrder = new Order({ item, status: 'todo', createdBy: req.user.id });
    await newOrder.save();
    res.status(201).json(newOrder);
  } catch (err) {
    res.status(500).json({ msg: 'Kunde inte skapa beställning' });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const updateFields = { status };
    if (status === 'ordered') updateFields.orderedAt = new Date();
    if (status === 'delivered') updateFields.deliveredAt = new Date();

    const updated = await Order.findByIdAndUpdate(id, updateFields, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ msg: 'Kunde inte uppdatera beställning' });
  }
};
