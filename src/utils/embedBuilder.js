const { EmbedBuilder } = require('discord.js');
const config = require('../../config/config.json');

function createEmbed({
  fields = [],
  titleText = '',
  description = null,
  color = config.bot_color,
  authorName = null,
  authorIconURL = null,
  thumbnailURL = null,
  imageURL = null,
  footerText = null,
  footerIconURL = null,
  url = null,
  timestamp = true,
}) {
  const embed = new EmbedBuilder();

  if (color) {
    embed.setColor(color);
  } else {
    embed.setColor(config.bot_color);
  }

  if (titleText) {
    embed.setTitle(titleText);
  }

  if (description) {
    embed.setDescription(description);
  }

  if (authorName) {
    embed.setAuthor({
      name: authorName,
      iconURL: authorIconURL || config.bot_logo,
    });
  }

  if (thumbnailURL) {
    embed.setThumbnail(thumbnailURL);
  }

  if (imageURL) {
    embed.setImage(imageURL);
  }

  if (url) {
    embed.setURL(url);
  }

  if (footerText || footerIconURL) {
    embed.setFooter({
      text: footerText || '',
      iconURL: footerIconURL || null,
    });
  }

  if (fields.length > 0) {
    embed.addFields(fields);
  }

  if (timestamp) {
    embed.setTimestamp(new Date());
  }

  return embed;
}

module.exports = { createEmbed };
