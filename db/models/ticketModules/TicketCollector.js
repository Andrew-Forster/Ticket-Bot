const mongoose = require("mongoose");
const { DataTypes } = require("sequelize");
const config = require("../../../config/config.json");
const { db } = require("../../database");
const getTicketCategoryModel = require("../ticketModules/TicketCategory");

const ticketCollectorSchema = new mongoose.Schema({
  title: { type: String, required: true },
  desc: { type: String, required: true },
  image: { type: String, required: false },
  color: { type: String, required: true }, // Hex color code
  categories: [
    { type: mongoose.Schema.Types.ObjectId, ref: "TicketCategoryType" },
  ],
});

const TicketCollector = mongoose.model("TicketCollector", ticketCollectorSchema);

module.exports = function getTicketCollectorModel() {
  if (config.db_type === "mongodb") {
    return TicketCollector;
  } else if (config.db_type === "mysql" || config.db_type === "sqlite") {

    const TicketCollectorSQL = db.define("TicketCollector", {
      title: { type: DataTypes.STRING, allowNull: false },
      desc: { type: DataTypes.STRING, allowNull: false },
      image: { type: DataTypes.STRING, allowNull: true },
      color: { type: DataTypes.STRING, allowNull: false },
    });
    
    TicketCollectorSQL.hasMany(getTicketCategoryModel(), {
      foreignKey: "ticketCollectorId",
    });

    return TicketCollectorSQL;
  }
};
