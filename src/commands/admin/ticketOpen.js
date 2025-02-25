const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  MessageFlags,
} = require('discord.js');
const { findTicket, findCategory } = require('../../../db/access/ticket');
const { openTicketFlow } = require('../../tickets/manage');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('open')
    .setDescription('Open the current ticket.')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

  async execute(i) {
    try {
      const ticket = await findTicket(i.channelId);
      if (!ticket) {
        await i.reply({
          embeds: [embedPrompt('This is not a ticket channel.')],
          ephemeral: true,
        });
        return;
      }
      const category = await findCategory(ticket.ticketCategoryId);
      const channel = i.guild.channels.cache.get(i.channelId);

      const res = await openTicketFlow(i, channel, category);
      if (res) {
        await i.reply(res);
      }
     
    } catch (err) {
      console.error('Ticket management error:', err);
      await i.followUp({
        content: 'An error occurred while managing the ticket.',
        flags: MessageFlags.Ephemeral,
      });
    }
  },
};
