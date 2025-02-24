const TicketResponse = require('../models/ticketModules/TicketResponse');
const TicketCategory = require('../models/ticketModules/TicketCategory');
const TicketCollector = require('../models/ticketModules/TicketCollector');
const Server = require('../models/Server');

async function submitTicketResponse(interaction, roles) {
    try {
        if (interaction.customId !== 'ticket-response-modal') return;
  
        const title = interaction.fields.getTextInputValue('title');
        const desc = interaction.fields.getTextInputValue('desc');
        const image = interaction.fields.getTextInputValue('image');
        const color = interaction.fields.getTextInputValue('color');
  
        // Create a new TicketResponse document
        const ticketResponse = new TicketResponse({
          title,
          desc,
          image: image || null,
          color: color || '#ffffff',
          roles: roles || [],
        });
  
        const server = await Server.findOne({ serverId: interaction.guild.id });
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
  
        await ticketResponse.save();

        return ticketResponse._id;
  
      } catch (error) {
        console.error('Modal handling error:', error);
        return { error: 'An error occurred while creating the Ticket Response Object.' };
      }
}

async function submitTicketCategory(interaction, categoryId, closeCategoryId, ticketResponseId, buttonStyle) {
    try {
        if (interaction.customId !== 'ticket-category-modal') return;
  
        const buttonText = interaction.fields.getTextInputValue('button-text');
        const buttonEmoji = interaction.fields.getTextInputValue('button-emoji');
  
        // Create a new TicketCategory document
        const ticketCategory = new TicketCategory({
          buttonText,
          buttonStyle,
          buttonEmoji,
          categoryId,
          closeCategoryId,
          ticketResponseId,
        });

        const server = await Server.findOne({ serverId: interaction.guild.id });
        if (server) {
          server.TicketCategories.push(ticketCategory._id);
          await server.save();
          await server.save();
        } else {
          const newServer = new Server({
            serverId: interaction.guild.id,
            TicketCategories: [ticketCategory._id],
          });
          await newServer.save();
        }
  
        await ticketCategory.save();

        return ticketCategory._id;
  
      } catch (error) {
        console.error('Modal handling error:', error);
        return { error: 'An error occurred while creating the Ticket Category Object.' };
      }
}

async function submitTicketCollector(interaction, categories) {
    try {
        if (interaction.customId !== 'ticket-collection-modal') return;
  
        const title = interaction.fields.getTextInputValue('collection-title');
        const desc = interaction.fields.getTextInputValue('collection-desc');
        const image = interaction.fields.getTextInputValue('collection-image');
        const color = interaction.fields.getTextInputValue('collection-color');
  
        // Create a new TicketCollector document
        const ticketCollector = new TicketCollector({
          title,
          desc,
          image: image || null,
          color: color || '#ffffff',
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
  
      } catch (error) {
        console.error('Modal handling error:', error);
        return { error: 'An error occurred while creating the Ticket Collector Object.' };
      }
}

module.exports = { submitTicketResponse, submitTicketCategory, submitTicketCollector };