const mongoose = require('mongoose');

const ticketCollectorSchema = new mongoose.Schema({
  title: { type: String, required: true },
  desc: { type: String, required: true },
  image: { type: String, required: false },
  color: { type: String, required: true }, // Hex color code
  categories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'TicketCategoryType' }],
});

const TicketCollector = mongoose.model('TicketCollector', ticketCollectorSchema);

module.exports = TicketCollector;
