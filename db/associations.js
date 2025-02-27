function setupAssociations(db) {
  const { Server, TicketCollector, TicketCategory, TicketResponse, Ticket } = db.models;

  // Server Associations
  Server.hasMany(TicketCollector, {
    foreignKey: 'serverId',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  });
  Server.hasMany(TicketCategory, {
    foreignKey: 'serverId',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  });
  Server.hasMany(TicketResponse, {
    foreignKey: 'serverId',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  });
  Server.hasMany(Ticket, {
    foreignKey: 'serverId',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  });

  // Ticket Associations
  Ticket.belongsTo(TicketCategory, {
    foreignKey: 'ticketCategoryId',
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE'
  });
  Ticket.belongsTo(Server, {
    foreignKey: 'serverId',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  });

  // TicketCollector Associations
  TicketCollector.belongsTo(Server, {
    foreignKey: 'serverId',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  });
  TicketCollector.belongsToMany(TicketCategory, {
    through: 'CollectorCategory',
    foreignKey: 'collectorId',
    otherKey: 'categoryId'
  });

  // TicketCategory Associations
  TicketCategory.belongsTo(Server, {
    foreignKey: 'serverId',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  });
  TicketCategory.belongsTo(TicketResponse, {
    foreignKey: 'ticketResponseId',
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE'
  });
  TicketCategory.belongsToMany(TicketCollector, {
    through: 'CollectorCategory',
    foreignKey: 'categoryId',
    otherKey: 'collectorId'
  });
  TicketCategory.hasMany(Ticket, {
    foreignKey: 'ticketCategoryId',
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE'
  });

  // TicketResponse Associations
  TicketResponse.belongsTo(Server, {
    foreignKey: 'serverId',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  });
  TicketResponse.hasMany(TicketCategory, {
    foreignKey: 'ticketResponseId',
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE'
  });
};

module.exports = { setupAssociations };