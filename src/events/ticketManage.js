const { Events, MessageFlags } = require('discord.js');

const { showManagePanel } = require('../tickets/manage');
const { findCategory } = require('../../db/access/ticket');

module.exports = {
  name: Events.InteractionCreate,
  once: false,
  async execute(i) {
    try {
      if (!i.isButton()) return;
      const interactionId = i.customId;

      if (!interactionId.startsWith('manage-')) return;

      const categoryId = interactionId.split('-')[1];
      const category = await findCategory(categoryId);
      const channelId = i.channelId;
      const channel = i.guild.channels.cache.get(channelId);

      const permissions = channel.permissionsFor(i.user);
      if (!permissions.has('ManageChannels')) {
        await i.update({});
        return;
      }

      if (!channel) {
        return i.followUp({
          content: 'Ticket channel not found.',
          flags: MessageFlags.Ephemeral,
        });
      }

      await i.deferReply({ flags: MessageFlags.Ephemeral });

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
