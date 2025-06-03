const mongoose = require('mongoose'); // Importerar mongoose för att hantera databasscheman

// Schema för kommentarer kopplat till en order
const commentSchema = new mongoose.Schema({
  user: String, // Vem skrev kommentaren
  text: String, // Kommentartext
  timestamp: { type: Date, default: Date.now } // När kommentaren skapades
});

// Schema för en order
const orderSchema = new mongoose.Schema({
  item: String, // Namn eller beskrivning av beställningen
  status: { 
    type: String, 
    enum: ['todo', 'ordered', 'delivered'], // Statusalternativ
    default: 'todo' // Standardstatus
  },
  createdAt: { type: Date, default: Date.now }, // När beställningen skapades
  orderedAt: Date, // Datum när beställningen markerades som "ordered"
  deliveredAt: Date, // Datum när beställningen markerades som "delivered"
  dueDate: Date, // Sista datum för beställningen
  comment: String, // Eventuell kommentar (ej samma som arrayen nedan)
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Tilldelad användare
  comments: [commentSchema], // Array av kommentarer
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Vem som skapade beställningen
  deleted: { type: Boolean, default: false } // Soft delete för beställningen
});

// Exporterar modellen
module.exports = mongoose.models.Order || mongoose.model('Order', orderSchema);
