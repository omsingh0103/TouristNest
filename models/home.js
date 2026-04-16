const mongoose = require('mongoose');

const homeSchema = mongoose.Schema({
  houseName: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  rating: {
    type: Number,
    required: true
  },
  photo: [String], // Store multiple photo paths as an array of strings
  description: String,

  // 👇 NEW FIELD to store the host who created this home
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',   // assuming your user model is 'User'
    required: true
  }
});

module.exports = mongoose.model('Home', homeSchema);
