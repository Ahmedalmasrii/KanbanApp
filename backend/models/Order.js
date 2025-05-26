const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  user: String,
  text: String,
  timestamp: { type: Date, default: Date.now }
});

const orderSchema = new mongoose.Schema({
  item: String,
  status: { type: String, enum: ['todo', 'ordered', 'delivered'], default: 'todo' },
  createdAt: { type: Date, default: Date.now },
  orderedAt: Date,
  deliveredAt: Date,
  dueDate: Date,
  comment: String,
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  comments: [commentSchema],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  deleted: { type: Boolean, default: false }
});

module.exports = mongoose.models.Order || mongoose.model('Order', orderSchema);
