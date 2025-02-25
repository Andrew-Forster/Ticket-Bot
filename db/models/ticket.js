

const mongoose = require("mongoose");

const TicketSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    channelId: { type: String, required: true },
    ticketCategoryId: { type: mongoose.Schema.Types.ObjectId, ref: "TicketCategory", required: true },
    transcript: { type: String, required: false },
});

module.exports = mongoose.model("Ticket", TicketSchema);
