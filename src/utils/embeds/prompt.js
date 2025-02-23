
const { EmbedBuilder } = require('discord.js');
const config = require('../../../config/config.json');

function embedPrompt(content, color = config.bot_color) {
  const embed = new EmbedBuilder()
    .setTitle('Create a Ticket System')
    .setDescription(content)
    .setColor(color);
  return embed;
}

module.exports = {
  embedPrompt,
};