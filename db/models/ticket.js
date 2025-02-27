const mongoose = require("mongoose");
const config = require("../../config/config.json");

// MongoDB
const TicketSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  channelId: { type: String, required: true },
  ticketCategoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "TicketCategory",
    required: true,
  },
});

TicketSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

TicketSchema.set("toJSON", {
  virtuals: true,
});

TicketSchema.set("toObject", {
  virtuals: true,
});

const Ticket = mongoose.model("Ticket", TicketSchema);

module.exports = () => {
  if (config.db_type === "mongodb") {
    return Ticket;
  }
};
