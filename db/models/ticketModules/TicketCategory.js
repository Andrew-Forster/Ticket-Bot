const mongoose = require('mongoose');

const ticketCategorySchema = new mongoose.Schema({
  buttonText: { type: String, required: true },
  buttonStyle: { type: String, required: true },
  categoryId: { type: String, required: true }, // Discord Category ID
  ticketResponseId: { type: mongoose.Schema.Types.ObjectId, ref: 'TicketResponse', required: true },
  buttonEmoji: { type: String, required: false },
});

const TicketCategory = mongoose.model('TicketCategory', ticketCategorySchema);

module.exports = TicketCategory;