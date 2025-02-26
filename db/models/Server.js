const mongoose = require("mongoose");
const { DataTypes } = require("sequelize");
const config = require("../../config/config.json");
const { db } = require("../../app");

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

const Server = mongoose.model("Server", ServerSchema);

module.exports = function getServerModel() {
  if (config.db_type === "mongodb") {
    return Server;
  } else if (config.db_type === "mysql" || config.db_type === "sqlite") {
    // SQL
    const ServerSQL = db.db.define("Server", {
      serverId: { type: DataTypes.STRING, allowNull: false, unique: true },
      TicketCollectors: { type: DataTypes.JSON, allowNull: true }, // Store as an array of IDs
      TicketCategories: { type: DataTypes.JSON, allowNull: true },
      TicketResponses: { type: DataTypes.JSON, allowNull: true },
      Tickets: { type: DataTypes.JSON, allowNull: true },
    });

    ServerSQL.associate = (models) => {
      ServerSQL.hasMany(models.TicketCollector, { foreignKey: "serverId" });
      ServerSQL.hasMany(models.TicketCategory, { foreignKey: "serverId" });
      ServerSQL.hasMany(models.TicketResponse, { foreignKey: "serverId" });
      ServerSQL.hasMany(models.Ticket, { foreignKey: "serverId" });
    };

    return ServerSQL;
  }
};
