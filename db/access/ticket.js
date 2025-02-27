const { db } = require("../../app");
const TicketResponse = require("../models/ticketModules/TicketResponse")(db);
const TicketCategory = require("../models/ticketModules/TicketCategory")(db);
const TicketCollector = require("../models/ticketModules/TicketCollector")(db);
const Server = require("../models/Server")(db);
const Ticket = require("../models/Ticket")(db);

async function getCollectors(interaction) {
  try {
    let server = await db.get(Server, "Server", {
      serverId: interaction.guild.id,
    });

    if (!server) return [];

    let collectors = [];

    if (db.config.db_type === "mongodb") {
      for (const collectorId of server.TicketCollectors) {
        const collector = await TicketCollector.findById(collectorId);
        collectors.push(collector);
      }
    } else if (
      db.config.db_type === "mysql" ||
      db.config.db_type === "sqlite"
    ) {
      const ticketCollectors = await db.getAll(
        TicketCollector,
        "TicketCollector",
        { serverId: server.id }
      );
      collectors.push(...ticketCollectors);
    }

    return collectors;
  } catch (err) {
    console.error(err);
    return [];
  }
}

async function getCategories(ticketCollector) {
  let categories = [];
  try {
    if (db.config.db_type === "mongodb") {
      for (const c of ticketCollector.categories) {
        const category = await findCategory(c.toString());
        if (category) categories.push(category);
      }
    } else if (
      db.config.db_type === "mysql" ||
      db.config.db_type === "sqlite"
    ) {
      const collectorCategories = await db.db["CollectorCategory"].findMany({
        where: { ticketCollectorId: ticketCollector.id },
      });

      const ticketCategories = await Promise.all(
        collectorCategories.map(async (collectorCategory) => {
          return await db.get(TicketCategory, "TicketCategory", {
            id: collectorCategory.ticketCategoryId,
          });
        })
      );
      categories.push(...ticketCategories);
    }

    return categories;
  } catch (err) {
    console.error(err);
    return [];
  }
}

async function findCategory(categoryId) {
  return await db.find(TicketCategory, "TicketCategory", categoryId);
}

async function findResponse(responseId) {
  return await db.find(TicketResponse, "TicketResponse", responseId);
}

async function findTicket(channelId) {
  return await db.get(Ticket, "Ticket", { channelId });
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
  const server = await db.get(Server, "Server", {
    serverId: interaction.guild.id,
  });
  if (server) {
    if (db.config.db_type === "mongodb") {
      const ticketData = {
        userId: interaction.user.id,
        channelId,
        ticketCategoryId: categoryId,
      };

      const ticket = await db.create(Ticket, "Ticket", ticketData);
      server.Tickets.push(ticket.id);
      await server.save();

      return ticket;
    } else if (
      db.config.db_type === "mysql" ||
      db.config.db_type === "sqlite"
    ) {
      const ticketData = {
        userId: interaction.user.id,
        channelId,
        ticketCategoryId: parseInt(categoryId),
        serverId: parseInt(server.id),
      };

      const ticket = await db.create(Ticket, "Ticket", ticketData);
      await db.db["Server"].update({
        where: { serverId: interaction.guild.id },
        data: {
          tickets: {
            connect: { id: ticket.id },
          },
        },
      });
      return ticket;
    }
  }
  return null;
}

/**
 * Deletes a Ticket document from the database and removes it from the server's ticket array.
 * @param {Object} interaction - The interaction object from Discord.js.
 * @param {Object} ticket - The Ticket document to delete.
 * @returns {Promise<Boolean>} - A promise that resolves to `true` if the ticket was deleted successfully, `false` otherwise.
 */
async function deleteTicket(interaction, ticket) {
  const server = await db.get(Server, "Server", { serverId: interaction.guild.id });
  if (!server) return false;

  // For MongoDB, pull the ticket ID from the Tickets array
  if (db.config.db_type === "mongodb") {
    server.Tickets.pull(ticket._id);
    await server.save();
  } 
  // Delete the ticket itself
  await db.delete(Ticket, "Ticket", ticket.id);

  return true;
}

module.exports = {
  getCollectors,
  findCategory,
  findResponse,
  createTicket,
  findTicket,
  deleteTicket,
  getCategories,
};
