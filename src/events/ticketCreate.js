const {
  Events,
  ButtonStyle,
  ChannelType,
  EmbedBuilder,
  ButtonBuilder,
  ActionRowBuilder,
  MessageFlags,
} = require('discord.js');
const { findCategory, findResponse } = require('../../db/access/ticket');

module.exports = {
  name: Events.InteractionCreate,
  once: false,
  async execute(i) {
    const interactionId = i.customId;
    try {
      if (!i.isButton()) return;
      if (!interactionId) return;
      if (!interactionId.includes('ticket-')) {
        return;
      }

      await i.deferUpdate();

      const categoryId = interactionId.split('-')[1];
      const category = await findCategory(categoryId);
      const response = await findResponse(category.ticketResponseId);

      const channel = await i.guild.channels.create({
        name: `${response.title.toLowerCase().replace(/ /g, '-')}-${i.user.username}`,
        type: ChannelType.GuildText,
      });

      if (category.categoryId) {
        let parent = i.guild.channels.cache.get(category.categoryId);
        channel.setParent(parent);
      }

      await channel.permissionOverwrites.create(i.user, {
        ViewChannel: true,
        SendMessages: true,
        ReadMessageHistory: true,
      });

      await channel.permissionOverwrites.create(i.guild.roles.everyone, {
        ViewChannel: false,
        SendMessages: false,
        ReadMessageHistory: false,
      });

      for (const role of response.roles) {
        await channel.permissionOverwrites.create(role, {
          ViewChannel: true,
          SendMessages: true,
          ReadMessageHistory: true,
        });
      }

      const embed = new EmbedBuilder()
        .setTitle(response.title)
        .setDescription(response.desc)
        .setImage(response.image);

      if (response.color && isValidHex(response.color)) {
        embed.setColor(response.color);
      } else {
        embed.setColor('#ffffff');
      }

      const button = new ButtonBuilder()
        .setCustomId(`manage-${channel.id}`)
        .setEmoji('🔒')
        .setStyle(ButtonStyle.Secondary);

      const actionRow = new ActionRowBuilder().addComponents(button);

      const roleMentions = response.roles.map((role) => `<@&${role}>`).join(', ');

      await channel.send({
        content: `${roleMentions}`,
        embeds: [embed],
        components: [actionRow],
      });

      await i.followUp({
        content: `Ticket created: ${channel}`,
        components: [],
        flags: MessageFlags.Ephemeral,
      });
    } catch (err) {
      console.error('Ticket creation error:', err);
      return;
    }
  },
};

function isValidHex(color) {
  return /^#([0-9A-F]{6}|[0-9A-F]{3})$/i.test(color);
}
