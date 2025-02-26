const mongoose = require("mongoose");
const { DataTypes } = require("sequelize");
const config = require("../../config/config.json");
const getTicketCategoryModel = require("./ticketModules/TicketCategory");
const { db } = require("../database");

// Define MongoDB Schema (Mongoose)
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

module.exports = function getTicketModel() {
  if (config.db_type === "mongodb") {
    return Ticket;
  } else if (config.db_type === "mysql" || config.db_type === "sqlite") {

    const TicketModelSQL = db.define("Ticket", {
      userId: { type: DataTypes.STRING, allowNull: false },
      channelId: { type: DataTypes.STRING, allowNull: false },
    });

    TicketModelSQL.belongsTo(getTicketCategoryModel(), {
      foreignKey: "ticketCategoryId",
    });
    return TicketModelSQL;
  }
};
