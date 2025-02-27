
const { db } = require('../../app');
const TicketResponse = require("../models/ticketModules/TicketResponse")(db);
const TicketCategory = require("../models/ticketModules/TicketCategory")(db);
const TicketCollector = require("../models/ticketModules/TicketCollector")(db);
const Server = require("../models/Server")(db);
const Ticket = require("../models/Ticket")(db);

async function getCollectors(interaction) {
  const server = await Server.findOne({ serverId: interaction.guild.id });
  if (!server) return [];

  let collectors = [];
  for (const collectorId of server.TicketCollectors) {
    const collector = await TicketCollector.findById(collectorId);
    collectors.push(collector);
  }

  return collectors;
}

async function findCategory(categoryId) {
  const category = await db.find(TicketCategory, categoryId);
  return category;
}

async function findResponse(responseId) {
  const response = await db.find(TicketResponse, responseId);
  return response;
}

async function findTicket(channelId) {
  const ticket = await db.get(Ticket, { channelId });
  return ticket;
}

/**
 * Creates a new Ticket document and saves it to the database.
 * Also adds the ticket to the server's ticket array in the Server document.
 * @param {Object} interaction - The interaction object from Discord.js.
 * @param {String} categoryId - The ID of the TicketCategory document.
 * @param {String} channelId - The ID of the channel where the ticket was created.
 * @returns {Promise<Object>} - A promise that resolves to the newly created Ticket document.
 */
async function createTicket(interaction, categoryId, channelId) {
  const ticket = await db.create(Ticket, {
    userId: interaction.user.id,
    channelId,
    ticketCategoryId: categoryId,
  });

  const server = await db.get(Server, { serverId: interaction.guild.id });
  if (server) {
    server.Tickets.push(db.getId(ticket));
    await server.save();
  } else {
    const newServer = new Server({
      serverId: interaction.guild.id,
      Tickets: [db.getId(ticket)],
    });
    await newServer.save();
  }

  return ticket;
}

async function deleteTicket(interaction, ticket) {
  const server = await db.get(Server, { serverId: interaction.guild.id });
  if (!server) return false;
  server.Tickets.pull(ticket._id);
  await server.save();

  await db.delete(Ticket, { _id: ticket._id });

  return true;
}

module.exports = {
  getCollectors,
  findCategory,
  findResponse,
  createTicket,
  findTicket,
  deleteTicket,
};
