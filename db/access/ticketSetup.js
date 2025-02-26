const getTicketResponseModel = require("../models/ticketModules/TicketResponse");
const getTicketCategoryModel = require("../models/ticketModules/TicketCategory");
const getTicketCollectorModel = require("../models/ticketModules/TicketCollector");
const getServerModel = require("../models/Server");
const { db } = require("../../app");

const TicketResponse = getTicketResponseModel();
const TicketCategory = getTicketCategoryModel();
const TicketCollector = getTicketCollectorModel();
const Server = getServerModel();

async function submitTicketResponse(interaction, roles) {
  try {
    if (interaction.customId !== "ticket-response-modal") return;

    const title = interaction.fields.getTextInputValue("title");
    const desc = interaction.fields.getTextInputValue("desc");
    const image = interaction.fields.getTextInputValue("image");
    const color = interaction.fields.getTextInputValue("color");

    // Create a new TicketResponse document
    const ticketResponse = await db.create(TicketResponse, {
      title,
      desc,
      image: image || null,
      color: color || "#ffffff",
      roles: roles || [],
    });

    const server = await db.get(Server, { serverId: interaction.guild.id });
    if (server) {
      // server.TicketResponses.push(ticketResponse._id);
      // await server.save();
      await db.update(Server, db.getId(server), {
        TicketResponses: [...server.TicketResponses || [], db.getId(ticketResponse)],
      });
    } else {
      await db.create(Server, {
        serverId: interaction.guild.id,
        TicketResponses: [db.getId(ticketResponse)],
      });
    }

    return db.getId(ticketResponse);
  } catch (error) {
    console.error("Modal handling error:", error);
    return {
      error: "An error occurred while creating the Ticket Response Object.",
    };
  }
}

async function submitTicketCategory(
  interaction,
  categoryId,
  closeCategoryId,
  ticketResponseId,
  buttonStyle
) {
  try {
    if (interaction.customId !== "ticket-category-modal") return;

    const buttonText = interaction.fields.getTextInputValue("button-text");
    const buttonEmoji = interaction.fields.getTextInputValue("button-emoji");

    // Create a new TicketCategory document
    const ticketCategory = await db.create(TicketCategory, {
      buttonText,
      buttonStyle,
      buttonEmoji,
      categoryId,
      closeCategoryId,
      ticketResponseId,
    });

    const server = await db.get(Server, { serverId: interaction.guild.id });
    if (server) {
      // server.TicketCategories.push(ticketCategory._id);
      // await server.save();
      await db.update(Server, db.getId(server), {
        TicketCategories: [...server.TicketCategories || [], db.getId(ticketCategory)],
      });
    } else {
      await db.create(Server, {
        serverId: interaction.guild.id,
        TicketCategories: [db.getId(ticketCategory)],
      });
    }

    return db.getId(ticketCategory);
  } catch (error) {
    console.error("Modal handling error:", error);
    return {
      error: "An error occurred while creating the Ticket Category Object.",
    };
  }
}

async function submitTicketCollector(interaction, categories) {
  try {
    if (interaction.customId !== "ticket-collection-modal") return;

    const title = interaction.fields.getTextInputValue("collection-title");
    const desc = interaction.fields.getTextInputValue("collection-desc");
    const image = interaction.fields.getTextInputValue("collection-image");
    const color = interaction.fields.getTextInputValue("collection-color");

    // Create a new TicketCollector document
    const ticketCollector = await db.create(TicketCollector, {
      title,
      desc,
      image: image || null,
      color: color || "#ffffff",
      categories: categories || [],
    });

    const server = await db.get(Server, { serverId: interaction.guild.id });
    if (server) {
      // server.TicketCollectors.push(ticketCollector._id);
      // await server.save();
      await db.update(Server, db.getId(server), {
        TicketCollectors: [...server.TicketCollectors || [], db.getId(ticketCollector)],
      });
    } else {
      await db.create(Server, {
        serverId: interaction.guild.id,
        TicketCollectors: [db.getId(ticketCollector)],
      });
    }

    return db.getId(ticketCollector);
  } catch (error) {
    console.error("Modal handling error:", error);
    return {
      error: "An error occurred while creating the Ticket Collector Object.",
    };
  }
}

module.exports = {
  submitTicketResponse,
  submitTicketCategory,
  submitTicketCollector,
};
