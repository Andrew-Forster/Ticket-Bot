const { SlashCommandBuilder } = require('discord.js');


module.exports = {
  data: new SlashCommandBuilder()
    .setName('manage')
    .setDescription('Bring\'s up the ticket management menu.'),

  async execute(interaction) {
    
  },
};
