const mongoose = require("mongoose");
const config = require("../../config/config.json");

// MongoDB
const ServerSchema = new mongoose.Schema({
  serverId: { type: String, required: true },
  TicketCollectors: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TicketCollector",
      required: false,
    },
  ],
  TicketCategories: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TicketCategoryType",
      required: false,
    },
  ],
  TicketResponses: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TicketResponse",
      required: false,
    },
  ],
  Tickets: [
    { type: mongoose.Schema.Types.ObjectId, ref: "Ticket", required: false },
  ],
});

ServerSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

ServerSchema.set("toJSON", {
  virtuals: true,
});

ServerSchema.set("toObject", {
  virtuals: true,
});

const Server = mongoose.model("Server", ServerSchema);

module.exports = () => {
  if (config.db_type === "mongodb") {
    return Server;
  }
};
