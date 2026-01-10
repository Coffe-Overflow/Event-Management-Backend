const mongoose = require("mongoose");

const organizerSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  contactPerson: {
    type: String,
    required: true
  },
  eventsOrganized: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

module.exports = mongoose.model("Organizer", organizerSchema);
