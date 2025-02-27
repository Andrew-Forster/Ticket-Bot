const mongoose = require("mongoose");
const config = require("../../../config/config.json");

// MongoDB
const ticketResponseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  desc: { type: String, required: true },
  image: { type: String, required: false },
  color: { type: String, required: true }, // Hex color code
  roles: { type: [String], required: false }, // Array of user IDs or roles to ping
});

ticketResponseSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

ticketResponseSchema.set("toJSON", {
  virtuals: true,
});

ticketResponseSchema.set("toObject", {
  virtuals: true,
});

const TicketResponse = mongoose.model("TicketResponse", ticketResponseSchema);

module.exports = () => {
  if (config.db_type === "mongodb") {
    return TicketResponse;
  }
};
