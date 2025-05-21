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
    const { item, dueDate } = req.body;
    if (!item) return res.status(400).json({ msg: 'Beställning saknar innehåll' });

    const newOrder = new Order({
      item,
      status: 'todo',
      createdBy: req.user.id,
      dueDate: dueDate || null
    });

    await newOrder.save();
    res.status(201).json(newOrder);
  } catch (err) {
    res.status(500).json({ msg: 'Kunde inte skapa beställning' });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, dueDate } = req.body;

    const updateFields = { status };
    if (status === 'ordered') updateFields.orderedAt = new Date();
    if (status === 'delivered') updateFields.deliveredAt = new Date();
    if (dueDate) updateFields.dueDate = dueDate;

    const updated = await Order.findByIdAndUpdate(id, updateFields, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ msg: 'Kunde inte uppdatera beställning' });
  }
};

exports.updateOrderDetails = async (req, res) => {
  try {
    const { assignedTo, comment, dueDate } = req.body;
    const update = {};

    if (assignedTo) update.assignedTo = assignedTo;
    if (dueDate) update.dueDate = dueDate;

    if (comment) {
      update.$push = {
        comments: {
          user: req.user.username,
          text: comment
        }
      };
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      update,
      { new: true }
    ).populate('assignedTo');

    if (!updatedOrder) return res.status(404).json({ msg: 'Beställning hittades inte' });
    res.json(updatedOrder);
  } catch (err) {
    res.status(500).json({ msg: 'Kunde inte uppdatera beställningen', error: err.message });
  }
};

exports.deleteOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ msg: 'Beställning hittades inte' });

    if (order.status !== 'delivered') {
      return res.status(403).json({ msg: 'Endast levererade beställningar kan tas bort' });
    }

    await order.deleteOne();
    res.status(200).json({ msg: 'Beställning borttagen' });
  } catch (err) {
    res.status(500).json({ msg: 'Serverfel vid radering', error: err.message });
  }
};

exports.getOrderComments = async (req, res) => {
  try {
    const comments = await Comment.find({ orderId: req.params.id }).sort({ timestamp: 1 });
    res.json(comments);
  } catch {
    res.status(500).json({ msg: 'Kunde inte hämta kommentarer' });
  }
};

exports.addOrderComment = async (req, res) => {
  try {
    const newComment = new Comment({
      orderId: req.params.id,
      user: req.user.username,
      text: req.body.text,
    });
    await newComment.save();
    res.status(201).json({ msg: 'Kommentar tillagd' });
  } catch {
    res.status(500).json({ msg: 'Kunde inte lägga till kommentar' });
  }
};

exports.assignManager = async (req, res) => {
  try {
    const updated = await Order.findByIdAndUpdate(
      req.params.id,
      { assignedTo: req.body.assignedTo },
      { new: true }
    );
    res.json(updated);
  } catch {
    res.status(500).json({ msg: 'Kunde inte tilldela chef' });
  }
};