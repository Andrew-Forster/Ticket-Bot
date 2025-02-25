const TicketResponse = require('../models/ticketModules/TicketResponse');
const TicketCategory = require('../models/ticketModules/TicketCategory');
const TicketCollector = require('../models/ticketModules/TicketCollector');
const Ticket = require('../models/Ticket');
const Server = require('../models/Server');

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
  const category = await TicketCategory.findById(categoryId);
  return category;
}

async function findResponse(responseId) {
  const response = await TicketResponse.findById(responseId);
  return response;
}

async function findTicket(channelId) {
  const ticket = await Ticket.findOne({ channelId });
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
  const ticket = new Ticket({
    userId: interaction.user.id,
    channelId,
    ticketCategoryId: categoryId,
  });
  await ticket.save();

  const server = await Server.findOne({ serverId: interaction.guild.id });
  if (server) {
    server.Tickets.push(ticket._id);
    await server.save();
  } else {
    const newServer = new Server({
      serverId: interaction.guild.id,
      Tickets: [ticket._id],
    });
    await newServer.save();
  }

  return ticket;
}

async function deleteTicket(interaction, ticket) {
  const server = await Server.findOne({ serverId: interaction.guild.id });
  if (!server) return false;
  server.Tickets.pull(ticket._id);
  await server.save();

  await Ticket.deleteOne({ _id: ticket._id });

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
