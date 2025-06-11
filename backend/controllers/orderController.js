const Order = require('../models/Order');
const Notification = require('../models/Notification');
const Comment = require('../models/Comment');
const AuditLog = require('../models/ActivityLog');
const User = require('../models/User');

// Hämta alla beställningar för företaget
exports.getOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      deleted: false,
      companyName: req.user.companyName
    }).populate('assignedTo');
    res.json(orders);
  } catch (err) {
    res.status(500).json({ msg: 'Kunde inte hämta beställningar' });
  }
};

// Skapa en ny beställning
exports.createOrder = async (req, res) => {
  try {
    const { item, dueDate } = req.body;
    if (!item) return res.status(400).json({ msg: 'Beställning saknar innehåll' });

    const newOrder = new Order({
      item,
      status: 'todo',
      createdBy: req.user.id,
      dueDate: dueDate || null,
      companyName: req.user.companyName
    });

    await newOrder.save();

    await AuditLog.create({
      user: req.user.id,
      action: `Skapade ny beställning: "${item}"`,
      companyName: req.user.companyName
    });

    res.status(201).json(newOrder);
  } catch (err) {
    res.status(500).json({ msg: 'Kunde inte skapa beställning' });
  }
};

// Uppdatera status
exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, dueDate } = req.body;

    const updateFields = { status };
    if (status === 'ordered') updateFields.orderedAt = new Date();
    if (status === 'delivered') updateFields.deliveredAt = new Date();
    if (dueDate) updateFields.dueDate = dueDate;

    const updated = await Order.findOneAndUpdate(
      { _id: id, companyName: req.user.companyName },
      updateFields,
      { new: true }
    );

    if (updated && updated.createdBy?.toString() !== req.user.id) {
      await Notification.create({
        orderId: updated._id,
        userId: updated.createdBy,
        message: `Din beställning "${updated.item}" har nu statusen: ${status}.`,
        companyName: req.user.companyName
      });
    }

    await AuditLog.create({
      user: req.user.id,
      action: `Uppdaterade status på "${updated.item}" till "${status}"`,
      companyName: req.user.companyName
    });

    res.json(updated);
  } catch (err) {
    res.status(500).json({ msg: 'Kunde inte uppdatera beställning' });
  }
};

// Uppdatera detaljer
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

    const updatedOrder = await Order.findOneAndUpdate(
      { _id: req.params.id, companyName: req.user.companyName },
      update,
      { new: true }
    ).populate('assignedTo');

    if (!updatedOrder) return res.status(404).json({ msg: 'Beställning hittades inte' });

    if (assignedTo) {
      await AuditLog.create({
        user: req.user.id,
        action: `Tilldelade "${updatedOrder.item}" till ${assignedTo}`,
        companyName: req.user.companyName
      });
    }

    if (comment) {
      await AuditLog.create({
        user: req.user.id,
        action: `Kommenterade "${updatedOrder.item}": "${comment}"`,
        companyName: req.user.companyName
      });
    }

    res.json(updatedOrder);
  } catch (err) {
    res.status(500).json({ msg: 'Kunde inte uppdatera beställningen', error: err.message });
  }
};

// Soft delete
exports.softDeleteOrder = async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      companyName: req.user.companyName
    });

    if (!order) return res.status(404).json({ msg: 'Beställning hittades inte' });

    order.deleted = true;
    await order.save();

    await AuditLog.create({
      user: req.user.id,
      action: `Tog bort beställningen "${order.item}" (soft delete)`,
      companyName: req.user.companyName
    });

    res.status(200).json({ msg: 'Beställning markerad som borttagen (soft delete)' });
  } catch (err) {
    res.status(500).json({ msg: 'Serverfel vid soft delete', error: err.message });
  }
};

// Hämta kommentarer
exports.getOrderComments = async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      companyName: req.user.companyName
    });
    if (!order) return res.status(404).json({ msg: 'Beställning hittades inte' });

    const comments = await Comment.find({ orderId: req.params.id }).sort({ timestamp: 1 });
    res.json(comments);
  } catch {
    res.status(500).json({ msg: 'Kunde inte hämta kommentarer' });
  }
};

// Lägg till kommentar
exports.addOrderComment = async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      companyName: req.user.companyName
    });
    if (!order) return res.status(404).json({ msg: 'Beställning hittades inte' });

    const newComment = new Comment({
      orderId: req.params.id,
      user: req.user.username,
      text: req.body.text
    });
    await newComment.save();

    await AuditLog.create({
      user: req.user.id,
      action: `Lade till kommentar till order ${req.params.id}: "${req.body.text}"`,
      companyName: req.user.companyName
    });

    res.status(201).json({ msg: 'Kommentar tillagd' });
  } catch {
    res.status(500).json({ msg: 'Kunde inte lägga till kommentar' });
  }
};

// Tilldela chef
exports.assignManager = async (req, res) => {
  try {
    const updated = await Order.findOneAndUpdate(
      { _id: req.params.id, companyName: req.user.companyName },
      { assignedTo: req.body.assignedTo },
      { new: true }
    );
    if (!updated) return res.status(404).json({ msg: 'Beställning hittades inte' });

    await AuditLog.create({
      user: req.user.id,
      action: `Tilldelade beställning ${req.params.id} till ${req.body.assignedTo}`,
      companyName: req.user.companyName
    });

    res.json(updated);
  } catch {
    res.status(500).json({ msg: 'Kunde inte tilldela chef' });
  }
};

// Hämta olästa notiser
exports.getUserNotifications = async (req, res) => {
  try {
    const notis = await Notification.find({
      userId: req.user.id,
      read: false,
      companyName: req.user.companyName
    }).sort({ createdAt: -1 });
    res.json(notis);
  } catch {
    res.status(500).json({ msg: 'Kunde inte hämta notifikationer' });
  }
};

// Markera notiser som lästa
exports.markNotificationsAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { userId: req.user.id, read: false, companyName: req.user.companyName },
      { read: true }
    );
    res.json({ msg: 'Alla notifikationer markerade som lästa' });
  } catch {
    res.status(500).json({ msg: 'Kunde inte uppdatera notifikationer' });
  }
};

// Hämta audit-loggar
exports.getAuditLogs = async (req, res) => {
  try {
    const logs = await AuditLog.find({
      companyName: req.user.companyName
    }).sort({ timestamp: -1 }).populate('user', 'username role');
    res.json(logs);
  } catch {
    res.status(500).json({ msg: 'Kunde inte hämta audit trail' });
  }
};
