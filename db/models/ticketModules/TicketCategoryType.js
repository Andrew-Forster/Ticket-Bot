const mongoose = require('mongoose');

const ticketCategoryTypeSchema = new mongoose.Schema({
  buttonText: { type: String, required: true },
  categoryId: { type: String, required: true }, // Discord Category ID
  ticketResponseId: { type: mongoose.Schema.Types.ObjectId, ref: 'TicketResponse', required: true },
});

const TicketCategoryType = mongoose.model('TicketCategoryType', ticketCategoryTypeSchema);

module.exports = TicketCategoryType;