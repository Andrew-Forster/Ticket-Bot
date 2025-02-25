const { SlashCommandBuilder,
  PermissionFlagsBits,
  MessageFlags,
 } = require('discord.js');
const { findTicket, findCategory } = require('../../../db/access/ticket');
const { showManagePanel } = require('../../tickets/manage');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('manage')
    .setDescription('Bring\'s up the ticket management menu.')
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
      await i.deferReply({ flags: MessageFlags.Ephemeral });

      const category = await findCategory(ticket.ticketCategoryId);
      const channel = i.guild.channels.cache.get(i.channelId);

      await showManagePanel(i, channel, category); 
    } catch (err) {
      console.error('Ticket management error:', err);
      await i.followUp({
        content: 'An error occurred while managing the ticket.',
        flags: MessageFlags.Ephemeral,
      });
    }
  },
};
