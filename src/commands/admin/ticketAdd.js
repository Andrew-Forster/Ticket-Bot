const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  MessageFlags,
} = require('discord.js');
const { findTicket } = require('../../../db/access/ticket');
const { addUsers } = require('../../tickets/manage');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('add')
    .setDescription('Add users to the current ticket.')
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
      const channel = i.guild.channels.cache.get(i.channelId);

      await addUsers(i, channel);
     
    } catch (err) {
      console.error('Ticket management error:', err);
      await i.followUp({
        content: 'An error occurred while managing the ticket.',
        flags: MessageFlags.Ephemeral,
      });
    }
  },
};
