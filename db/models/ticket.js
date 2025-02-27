const mongoose = require("mongoose");
const { DataTypes } = require("sequelize");
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

const Ticket = mongoose.model("Ticket", TicketSchema);

module.exports = (db) => {
  if (config.db_type === "mongodb") {
    return Ticket;
  } else if (config.db_type === "mysql" || config.db_type === "sqlite") {
    const TicketModelSQL = db.db.define("Ticket", {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      userId: { type: DataTypes.STRING, allowNull: false },
      channelId: { type: DataTypes.STRING, allowNull: false },
    });

    return TicketModelSQL;
  }
};
