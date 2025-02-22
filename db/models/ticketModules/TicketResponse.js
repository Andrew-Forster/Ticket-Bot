const mongoose = require('mongoose');

const ticketResponseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  desc: { type: String, required: true },
  image: { type: String, required: false },
  color: { type: String, required: true }, // Hex color code
  roles: { type: [String], required: false }, // Array of user IDs or roles to ping
});

const TicketResponse = mongoose.model('TicketResponse', ticketResponseSchema);

module.exports = TicketResponse;
