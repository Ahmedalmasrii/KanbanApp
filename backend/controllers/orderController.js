const Order = require('../models/Order');
const Notification = require('../models/Notification');
const Comment = require('../models/Comment');

exports.getOrders = async (req, res) => {
  try {
    const orders = await Order.find({ deleted: false }).populate('assignedTo');
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

    if (updated && updated.createdBy && updated.createdBy.toString() !== req.user.id) {
      console.log(`🔔 Skickar notis till användare: ${updated.createdBy}`);
      await Notification.create({
        orderId: updated._id,
        userId: updated.createdBy,
        message: `Din beställning "${updated.item}" har nu statusen: ${status}.`
      });
    }
    

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

exports.softDeleteOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ msg: 'Beställning hittades inte' });

    order.deleted = true;
    await order.save();
    res.status(200).json({ msg: 'Beställning markerad som borttagen (soft delete)' });
  } catch (err) {
    res.status(500).json({ msg: 'Serverfel vid soft delete', error: err.message });
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

// 🔔 Notifikationer
exports.getUserNotifications = async (req, res) => {
  try {
    const notis = await Notification.find({ userId: req.user.id, read: false }).sort({ createdAt: -1 });
    res.json(notis);
  } catch {
    res.status(500).json({ msg: 'Kunde inte hämta notifikationer' });
  }
};

exports.markNotificationsAsRead = async (req, res) => {
  try {
    await Notification.updateMany({ userId: req.user.id, read: false }, { read: true });
    res.json({ msg: 'Alla notifikationer markerade som lästa' });
  } catch {
    res.status(500).json({ msg: 'Kunde inte uppdatera notifikationer' });
  }
};
