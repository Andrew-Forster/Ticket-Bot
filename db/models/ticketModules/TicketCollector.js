const mongoose = require("mongoose");
const config = require("../../../config/config.json");

// MongoDB
const ticketCollectorSchema = new mongoose.Schema({
  title: { type: String, required: true },
  desc: { type: String, required: true },
  image: { type: String, required: false },
  color: { type: String, required: true }, // Hex color code
  categories: [
    { type: mongoose.Schema.Types.ObjectId, ref: "TicketCategoryType" },
  ],
});

ticketCollectorSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

ticketCollectorSchema.set("toJSON", {
  virtuals: true,
});

ticketCollectorSchema.set("toObject", {
  virtuals: true,
});

const TicketCollector = mongoose.model(
  "TicketCollector",
  ticketCollectorSchema
);


module.exports = () => {
  if (config.db_type === "mongodb") {
    return TicketCollector;
  }
};
