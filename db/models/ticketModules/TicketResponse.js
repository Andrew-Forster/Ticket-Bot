const mongoose = require("mongoose");
const { DataTypes } = require("sequelize");
const config = require("../../../config/config.json");
const { db } = require("../../database");
const getTicketCollectorModel = require("../ticketModules/TicketCollector");

// MongoDB Model
const ticketResponseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  desc: { type: String, required: true },
  image: { type: String, required: false },
  color: { type: String, required: true }, // Hex color code
  roles: { type: [String], required: false }, // Array of user IDs or roles to ping
});

const TicketResponse = mongoose.model("TicketResponse", ticketResponseSchema);

module.exports = function getTicketResponseModel() {
  if (config.db_type === "mongodb") {
    return TicketResponse;
  } else if (config.db_type === "mysql" || config.db_type === "sqlite") {

    // SQL Model
    const TicketResponseSQL = db.define("TicketResponse", {
      title: { type: DataTypes.STRING, allowNull: false },
      desc: { type: DataTypes.STRING, allowNull: false },
      image: { type: DataTypes.STRING, allowNull: true },
      color: { type: DataTypes.STRING, allowNull: false },
      roles: { type: DataTypes.JSON, allowNull: true },
    });

    TicketResponseSQL.hasMany(getTicketCollectorModel(), {
      foreignKey: "ticketResponseId",
    });
    return TicketResponseSQL;
  }
};
