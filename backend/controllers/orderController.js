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
