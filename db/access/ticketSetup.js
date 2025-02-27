const { db } = require("../../app");
const Ticket = require("../models/Ticket");
const TicketResponse = require("../models/ticketModules/TicketResponse")(db);
const TicketCategory = require("../models/ticketModules/TicketCategory")(db);
const TicketCollector = require("../models/ticketModules/TicketCollector")(db);
const Server = require("../models/Server")(db);

async function submitTicketResponse(interaction, roles) {
  try {
    if (interaction.customId !== "ticket-response-modal") return;

    const title = interaction.fields.getTextInputValue("title");
    const desc = interaction.fields.getTextInputValue("desc");
    const image = interaction.fields.getTextInputValue("image");
    const color = interaction.fields.getTextInputValue("color");

    if (db.config.db_type === "mongodb") {
      const ticketResponse = await db.create(TicketResponse, "TicketResponse", {
        title,
        desc,
        image: image || null,
        color: color || "#ffffff",
        roles: roles || [],
      });

      let server = await db.get(Server, "Server", { serverId: interaction.guild.id });

      if (server) {
        server.TicketResponses.push(ticketResponse._id);
        await server.save();
      } else {
        const newServer = new Server({
          serverId: interaction.guild.id,
          TicketResponses: [ticketResponse._id],
        });
        await newServer.save();
      }
      return ticketResponse._id;
    } else if (
      db.config.db_type === "mysql" ||
      db.config.db_type === "sqlite"
    ) {
      let server = await db.get(Server, "Server", { serverId: interaction.guild.id });

      if (server) {
        const ticketResponse = await db.create(TicketResponse, "TicketResponse", {
          title,
          desc,
          image: image || null,
          color: color || "#ffffff",
          roles: roles || [],
          server: {
            connect: { id: server.id },
          },
        });
        return ticketResponse.id;
      } else {
        const server = await db.create(Server, "Server", {
          serverId: interaction.guild.id,
        });

        const ticketResponse = await db.create(TicketResponse, "TicketResponse", {
          title,
          desc,
          image: image || null,
          color: color || "#ffffff",
          roles: roles || [],
          server: { connect: { id: server.id } },
        });

        return ticketResponse.id;
      }
    }
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

    if (db.config.db_type === "mongodb") {
      const ticketCategory = await db.create(TicketCategory, "TicketCategory", {
        buttonText,
        buttonStyle,
        buttonEmoji,
        categoryId,
        closeCategoryId,
        ticketResponseId,
      });

      let server = await db.get(Server, "Server", { serverId: interaction.guild.id });

      if (server) {
        server.TicketCategories.push(ticketCategory._id);
        await server.save();
      } else {
        const newServer = new Server({
          serverId: interaction.guild.id,
          TicketCategories: [ticketCategory._id],
        });
        await newServer.save();
      }
      return ticketCategory._id;
    } else if (
      db.config.db_type === "mysql" ||
      db.config.db_type === "sqlite"
    ) {
      let server = await db.get(Server, "Server", { serverId: interaction.guild.id });

      if (server) {
        const ticketCategory = await db.create(TicketCategory, "TicketCategory", {
          buttonText,
          buttonStyle,
          buttonEmoji,
          categoryId,
          closeCategoryId,
          ticketResponse: { connect: { id: ticketResponseId } },
          server: { connect: { id: server.id } },
        });
        return ticketCategory.id;
      } else {
        const server = await db.create(Server, "Server", {
          serverId: interaction.guild.id,
        });

        const ticketCategory = await db.create(TicketCategory, "TicketCategory", {
          buttonText,
          buttonStyle,
          buttonEmoji,
          categoryId,
          closeCategoryId,
          ticketResponseId: { connect: { id: ticketResponseId } },
          server: { connect: { id: server.id } },
        });

        return ticketCategory.id;
      }
    }
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

    if (db.config.db_type === "mongodb") {
      // Create a new TicketCollector document
      const ticketCollector = new TicketCollector({
        title,
        desc,
        image: image || null,
        color: color || "#ffffff",
        categories: categories || [],
      });

      const server = await Server.findOne({ serverId: interaction.guild.id });
      if (server) {
        server.TicketCollectors.push(ticketCollector._id);
        await server.save();
      } else {
        const newServer = new Server({
          serverId: interaction.guild.id,
          TicketCollectors: [ticketCollector._id],
        });
        await newServer.save();
      }

      await ticketCollector.save();

      return ticketCollector._id;
    } else if (db.config.db_type === "mysql" || db.config.db_type === "sqlite") {
      let server = await db.get(Server, "Server", { serverId: interaction.guild.id });

      if (server) {
        const ticketCollector = await db.create(TicketCollector, "TicketCollector", {
          title,
          desc,
          image: image || null,
          color: color || "#ffffff",
          categories: {
            create: categories.map((categoryId) => ({
              category: { connect: { id: categoryId } },
            })),
          },
          server: { connect: { id: server.id } },
        });
        return ticketCollector.id;
      } else {
        const server = await db.create(Server, "Server", {
          serverId: interaction.guild.id,
        });

        const ticketCollector = await db.create(TicketCollector, "TicketCollector", {
          title,
          desc,
          image: image || null,
          color: color || "#ffffff",
          categories: {
            create: categories.map((categoryId) => ({
              category: { connect: { id: categoryId } },
            })),
          },
          server: { connect: { id: server.id } },
        });

        return ticketCollector.id;
      }
    }
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
