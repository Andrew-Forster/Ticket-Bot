const { SlashCommandBuilder, MessageFlags } = require('discord.js');

const { embedPrompt } = require('../../utils/embeds/prompt');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ticket-setup')
    .setDescription('Create a Ticket System'),

  async execute(interaction) {

  }, // end of execute
};
