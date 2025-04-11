const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  preferences: {
    type: Object,
    default: {
      theme: 'dark',
      notifications: true,
    },
  },
});

module.exports = mongoose.model('User', UserSchema);
