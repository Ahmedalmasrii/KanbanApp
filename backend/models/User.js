const mongoose = require('mongoose'); // Importerar mongoose för att hantera databasscheman

// Definierar användarschemat
const userSchema = new mongoose.Schema({
  username: String, // Användarnamn
  email: String,    // E-postadress
  password: String, // Hashat lösenord
  role: { 
    type: String, 
    enum: ['admin', 'manager', 'user', 'viewer'], // Användarroll
    default: 'user' // Standardroll
  },
  active: { type: Boolean, default: true }, // Om kontot är aktivt eller ej
  loginAttempts: { type: Number, default: 0 }, // Räknare för inloggningsförsök (för att låsa konton vid fel)
  lockUntil: { type: Date, default: null } // Om kontot är låst (tidpunkt fram till när det är låst)
});

// Exporterar modellen
module.exports = mongoose.model('User', userSchema);
