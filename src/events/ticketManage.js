const { Events, MessageFlags } = require('discord.js');
const { findTicket, deleteTicket } = require('../../db/access/ticket');

module.exports = {
  name: Events.ChannelDelete,
  once: false,
  async execute(channel) {
    try {
      const ticket = await findTicket(channel.id); 

      if (ticket) {
        await deleteTicket(channel, ticket);
      }
    } catch (err) {
      console.error('Ticket management error:', err);
      await channel.send({
        content: 'An error occurred while managing the ticket.',
        flags: MessageFlags.Ephemeral,
      });
    }
  },
};
