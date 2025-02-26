const mongoose = require("mongoose");
const { DataTypes } = require("sequelize");
const config = require("../../../config/config.json");
const { db } = require("../../../app");

// MongoDB
const ticketCategorySchema = new mongoose.Schema({
  buttonText: { type: String, required: true },
  buttonStyle: { type: String, required: true },
  categoryId: { type: String, required: true }, // Discord Category ID
  closeCategoryId: { type: String, required: true }, // Discord Category ID
  ticketResponseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "TicketResponse",
    required: true,
  },
  buttonEmoji: { type: String, required: false },
});

const TicketCategory = mongoose.model("TicketCategory", ticketCategorySchema);

module.exports = function getTicketCategoryModel() {
  if (config.db_type === "mongodb") {
    return TicketCategory;
  } else if (config.db_type === "mysql" || config.db_type === "sqlite") {
    // SQL
    const TicketCategorySQL = db.db.define("TicketCategory", {
      buttonText: { type: DataTypes.STRING, allowNull: false },
      buttonStyle: { type: DataTypes.STRING, allowNull: false },
      categoryId: { type: DataTypes.STRING, allowNull: false },
      closeCategoryId: { type: DataTypes.STRING, allowNull: false },
      buttonEmoji: { type: DataTypes.STRING, allowNull: true },
    });

    TicketCategorySQL.associate = (models) => {
      TicketCategorySQL.belongsTo(models.Server, {
        foreignKey: "serverId",
      });
      TicketCategorySQL.belongsTo(models.TicketResponse, {
        foreignKey: "ticketResponseId",
      });
      TicketCategorySQL.belongsToMany(models.TicketCollector, {
        through: "CollectorCategory",
      });
      TicketCategorySQL.hasMany(models.Ticket, {
        foreignKey: "ticketCategoryId",
      });
    };

    return TicketCategorySQL;
  }
};
