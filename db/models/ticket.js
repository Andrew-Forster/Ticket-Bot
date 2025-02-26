const mongoose = require("mongoose");
const { DataTypes } = require("sequelize");
const config = require("../../config/config.json");
const { db } = require("../../app");

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

module.exports = function getTicketModel() {
  if (config.db_type === "mongodb") {
    return Ticket;
  } else if (config.db_type === "mysql" || config.db_type === "sqlite") {

    const TicketModelSQL = db.db.define("Ticket", {
      userId: { type: DataTypes.STRING, allowNull: false },
      channelId: { type: DataTypes.STRING, allowNull: false },
    });

    TicketModelSQL.associate = (models) => {
      TicketModelSQL.belongsTo(models.TicketCategory, {
        foreignKey: "ticketCategoryId",
      });

      TicketModelSQL.belongsTo(models.Server, {
        foreignKey: "serverId",
      });
    };

    return TicketModelSQL;
  }
};
