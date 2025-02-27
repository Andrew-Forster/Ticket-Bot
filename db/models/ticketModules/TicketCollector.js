const mongoose = require("mongoose");
const { DataTypes } = require("sequelize");
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

const TicketCollector = mongoose.model(
  "TicketCollector",
  ticketCollectorSchema
);

module.exports = (db) => {
  if (config.db_type === "mongodb") {
    return TicketCollector;
  } else if (config.db_type === "mysql" || config.db_type === "sqlite") {
    // SQL
    const TicketCollectorSQL = db.db.define("TicketCollector", {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      title: { type: DataTypes.STRING, allowNull: false },
      desc: { type: DataTypes.STRING, allowNull: false },
      image: { type: DataTypes.STRING, allowNull: true },
      color: { type: DataTypes.STRING, allowNull: false },
      serverId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    });

    return TicketCollectorSQL;
  }
};
