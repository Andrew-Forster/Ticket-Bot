const { Events, MessageFlags } = require('discord.js');
const TicketResponse = require('../../../../db/models/ticketModules/TicketResponse');
const Server = require('../../../../db/models/Server');
const {
  pendingTicketResponses,
} = require('../../../commands/admin/ticketSetup');

module.exports = {
  name: Events.InteractionCreate,
  once: false,
  async execute(interaction) {
    try {
      if (!interaction.isModalSubmit()) return;
      if (interaction.customId !== 'ticket-response-modal') return;

      const title = interaction.fields.getTextInputValue('title');
      const desc = interaction.fields.getTextInputValue('desc');
      const image = interaction.fields.getTextInputValue('image');
      const color = interaction.fields.getTextInputValue('color');

      // Retrieve the stored roles for this user
      const pendingData = pendingTicketResponses.get(interaction.user.id);
      const roles = pendingData ? pendingData.roles : [];

      // Create a new TicketResponse document
      const ticketResponse = new TicketResponse({
        title,
        desc,
        image: image || null,
        color: color || '#ffffff',
        roles: roles || [],
      });

      const server = await Server.findOne({ serverId: interaction.guild.id });
    //   const channel = interaction.channel;
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

      await interaction.reply({
        content: 'Ticket Response created successfully!',
        flags: MessageFlags.Ephemeral,
      });

      // Remove the temporary data for this user
      pendingTicketResponses.delete(interaction.user.id);
    } catch (error) {
      console.error('Modal handling error:', error);
      await interaction.reply({
        content: 'An error occurred while creating the Ticket Response.',
        flags: MessageFlags.Ephemeral,
      });
    }
  },
};
