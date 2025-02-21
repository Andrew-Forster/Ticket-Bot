// const mongoose = require("mongoose");

// const TicketSchema = new mongoose.Schema({
//     userId: String,
//     channelId: String,
//     status: { type: String, default: "open" }
// });

// module.exports = mongoose.model("Ticket", TicketSchema);

const { DataTypes } = require("sequelize");
const db = require("../database");

const Ticket = db.define("Ticket", {
    userId: { type: DataTypes.STRING, allowNull: false },
    channelId: { type: DataTypes.STRING, allowNull: false },
    status: { type: DataTypes.STRING, defaultValue: "open" }
});

module.exports = Ticket;