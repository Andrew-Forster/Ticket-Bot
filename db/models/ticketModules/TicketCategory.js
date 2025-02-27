const mongoose = require("mongoose");
const config = require("../../../config/config.json");

// MongoDB
const ticketCategorySchema = new mongoose.Schema({
  buttonText: { type: String, required: true },
  buttonStyle: { type: String, required: true },
  categoryId: { type: String, required: true }, // Discord Category ID
  closeCategoryId: { type: String, required: true }, // Discord Category ID
  ticketResponseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "TicketResponse",
    required: true,
  },
  buttonEmoji: { type: String, required: false },
});

ticketCategorySchema.virtual("id").get(function () {
  return this._id.toHexString();
});

ticketCategorySchema.set("toJSON", {
  virtuals: true,
});

ticketCategorySchema.set("toObject", {
  virtuals: true,
});

const TicketCategory = mongoose.model("TicketCategory", ticketCategorySchema);

module.exports = () => {
  if (config.db_type === "mongodb") {
    return TicketCategory;
  }
};
