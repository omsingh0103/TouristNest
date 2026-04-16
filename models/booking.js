const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    home: { type: mongoose.Schema.Types.ObjectId, ref: "Home", required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // ✅ Add this
    name: { type: String, required: true },
    checkIn: { type: Date, required: true },
    checkOut: { type: Date, required: true },
    gender: { type: String, enum: ["Male", "Female"], required: true },
    children: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Booking", bookingSchema);
