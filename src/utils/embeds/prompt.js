
const { EmbedBuilder } = require('discord.js');
const config = require('../../../config/config.json');

function embedPrompt(content, color = config.bot_color, title = 'Create a Ticket System') {
  const embed = new EmbedBuilder()
    .setTitle(title)
    .setDescription(content)
    .setColor(color);
  return embed;
}

module.exports = {
  embedPrompt,
};