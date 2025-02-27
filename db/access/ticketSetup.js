const { db } = require("../../app");
const TicketResponse = require("../models/ticketModules/TicketResponse")(db);
const TicketCategory = require("../models/ticketModules/TicketCategory")(db);
const TicketCollector = require("../models/ticketModules/TicketCollector")(db);
const Server = require("../models/Server")(db);

const dbType = db.config.db_type;

async function submitTicketResponse(interaction, roles) {
  try {
    if (interaction.customId !== "ticket-response-modal") return;

    const title = interaction.fields.getTextInputValue("title");
    const desc = interaction.fields.getTextInputValue("desc");
    const image = interaction.fields.getTextInputValue("image");
    const color = interaction.fields.getTextInputValue("color");

    const ticketResponse = new TicketResponse({
      title,
      desc,
      image: image || null,
      color: color || "#ffffff",
      roles: roles || [],
    });

    let server = await db.get(Server, { serverId: interaction.guild.id });

    if (dbType === "mysql" || dbType === "sqlite") {
      if (!server) {
        server = await Server.create({ serverId: interaction.guild.id });
      }
      ticketResponse.serverId = server.id;
      await ticketResponse.save();
    } else if (dbType === "mongodb") {
      await ticketResponse.save();
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

    let ticketCategory;

    if (dbType === "mysql" || dbType === "sqlite") {
      ticketCategory = new TicketCategory({
        buttonText,
        buttonStyle,
        buttonEmoji,
        categoryId,
        closeCategoryId,
        ticketResponseId,
        serverId: interaction.guild.id,
      });

      let server = await db.get(Server, { serverId: interaction.guild.id });
      if (!server) {
        server = await Server.create({ serverId: interaction.guild.id });
      }

      ticketCategory.serverId = server.id;

      await ticketCategory.save();
    } else if (dbType === "mongodb") {
      ticketCategory = new TicketCategory({
        buttonText,
        buttonStyle,
        buttonEmoji,
        categoryId,
        closeCategoryId,
        ticketResponseId,
      });

      await ticketCategory.save();

      let server = await db.get(Server, { serverId: interaction.guild.id });
      if (server) {
        await server.save();
      } else {
        const newServer = new Server({
          serverId: interaction.guild.id,
          TicketCategorys: [ticketCategory._id],
        });
        await newServer.save();
      }
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
    const color =
      interaction.fields.getTextInputValue("collection-color") || "#ffffff";

    let ticketCollector;

    if (dbType === "mysql" || dbType === "sqlite") {
      ticketCollector = new TicketCollector({
        title,
        desc,
        image: image || null,
        color,
      });

      let server = await db.get(Server, { serverId: interaction.guild.id });
      if (!server) {
        server = await Server.create({ serverId: interaction.guild.id });
      }

      ticketCollector.serverId = server.id;
      
      await ticketCollector.save();
      console.log("Ticket Collector Object:", ticketCollector);
      console.log(ticketCollector instanceof TicketCollector); // Should be true
      const categoryIds = categories.map((c) => c.id);
      await ticketCollector.addTicketCategorys(categoryIds);
    } else if (dbType === "mongodb") {
      ticketCollector = new TicketCollector({
        title,
        desc,
        image: image || null,
        color,
        categories: categories || [],
      });

      await ticketCollector.save();

      let server = await db.get(Server, { serverId: interaction.guild.id });
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
