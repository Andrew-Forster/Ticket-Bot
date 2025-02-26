const mongoose = require("mongoose");
const { DataTypes } = require("sequelize");
const config = require("../../../config/config.json");
const { db } = require("../../../app");

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

module.exports = function getTicketCollectorModel() {
  if (config.db_type === "mongodb") {
    return TicketCollector;
  } else if (config.db_type === "mysql" || config.db_type === "sqlite") {
    // Imports placed lower to prevent circular dependencies
    const getServerModel = require("../Server");
    const getTicketCategoryModel = require("./TicketCategory");

    // SQL
    const TicketCollectorSQL = db.db.define("TicketCollector", {
      title: { type: DataTypes.STRING, allowNull: false },
      desc: { type: DataTypes.STRING, allowNull: false },
      image: { type: DataTypes.STRING, allowNull: true },
      color: { type: DataTypes.STRING, allowNull: false },
    });

    TicketCollectorSQL.associate = (models) => {
      TicketCollectorSQL.belongsTo(getServerModel(), {
        foreignKey: "serverId",
      });
      TicketCollectorSQL.belongsToMany(getTicketCategoryModel(), {
        through: "CollectorCategory",
      });
    };

    return TicketCollectorSQL;
  }
};
