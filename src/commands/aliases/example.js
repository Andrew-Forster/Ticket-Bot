const { SlashCommandBuilder } = require('discord.js');
const aboutCommand = require('../utilities/about');

//@note: Example on how you could do aliases.

module.exports = {
  data: new SlashCommandBuilder()
    .setName('about_alias')
    .setDescription('Ticket Bot'),

  async execute(interaction) {
    return aboutCommand.execute(interaction);
  },
};
