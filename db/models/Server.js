const mongoose = require("mongoose");

const ServerSchema = new mongoose.Schema({
    serverId: { type: String, required: true },
    TicketCollectors: [{ type: mongoose.Schema.Types.ObjectId, ref: "TicketCollector", required: false }],
    TicketCategoryTypes: [{ type: mongoose.Schema.Types.ObjectId, ref: "TicketCategoryType", required: false }],
    TicketResponses: [{ type: mongoose.Schema.Types.ObjectId, ref: "TicketResponse", required: false }],
});

module.exports = mongoose.model("Server", ServerSchema);