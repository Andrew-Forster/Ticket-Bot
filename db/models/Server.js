const mongoose = require("mongoose");
const { DataTypes } = require("sequelize");
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

const Server = mongoose.model("Server", ServerSchema);

module.exports = (db) => {
  if (config.db_type === "mongodb") {
    return Server;
  } else if (config.db_type === "mysql" || config.db_type === "sqlite") {
    // SQL
    const ServerSQL = db.db.define("Server", {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      serverId: { type: DataTypes.STRING, allowNull: false, unique: true },
    });

    return ServerSQL;
  }
};
