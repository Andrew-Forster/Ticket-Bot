const {
  SlashCommandBuilder,
  MessageFlags,
  StringSelectMenuBuilder,
  ChannelSelectMenuBuilder,
  ActionRowBuilder,
  ComponentType,
  ChannelType,
  StringSelectMenuOptionBuilder,
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require('discord.js');

const { embedPrompt } = require('../../utils/embeds/prompt');

const {
  getCollectors,
  findCategory,
} = require('../../../db/access/ticket');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ticket-attach')
    .setDescription('Attach a collector to a channel.'),

  async execute(interaction) {
    try {
      const r1 = await showChannelSelect({ interaction });
      const r2 = await showCollectorSelect({ interaction: r1.interaction });
      await attachCollector(r2, r1.channel);
    } catch (err) {
      
      console.error('Possible Ticket System attach error:', err);
      const errMsg = (typeof err === 'object' && err.message
        ? err.message.split(/[:.]\s+/)[0]
        : String(err) || 'An error occurred while attaching the collector.'
      ).substring(0, 60);
      await interaction.followUp({
        content: errMsg,
        flags: MessageFlags.Ephemeral,
      });
    }
  }, // end of execute
};

async function showChannelSelect({ interaction: i }) {
  await i.deferReply({ flags: MessageFlags.Ephemeral });
  const channelSelector = new ChannelSelectMenuBuilder()
    .setCustomId('channel-selector')
    .setPlaceholder('Select a channel')
    .setMinValues(1)
    .setMaxValues(1)
    .addChannelTypes(ChannelType.GuildText);

  const actionRow = new ActionRowBuilder().addComponents(channelSelector);

  const message = await i.editReply({
    embeds: [
      embedPrompt(
        'Select a channel to attach a ticket in.',
        null,
        'Attach a Ticket',
      ),
    ],
    components: [actionRow],
    flags: MessageFlags.Ephemeral,
  });

  return new Promise((resolve, reject) => {
    const collectorFilter = (interaction) => interaction.user.id === i.user.id;
    const collector = message.createMessageComponentCollector({
      componentType: ComponentType.ChannelSelect,
      filter: collectorFilter,
      time: 60_000,
    });

    collector.on('collect', async (interaction) => {
      const channel = interaction.values[0];
      await i.deleteReply();
      collector.stop();
      resolve({ interaction, channel });
    });

    collector.on('end', async (collected) => {
      if (collected.size === 0) {
        await i.deleteReply();
        collector.stop();
        reject('No channel selected');
      }
    });
  });
}

async function showCollectorSelect({ interaction: i }) {
  await i.deferReply({ flags: MessageFlags.Ephemeral });
  const collectors = await getCollectors(i);

  if (!collectors.length) {
    return Promise.reject(
      'No collectors found. Please create a collector first.',
    );
  }

  let options = [];
  collectors.forEach((c) => {
    if (!c) return;
    options.push(
      new StringSelectMenuOptionBuilder()
        .setLabel(c.title)
        .setDescription(c.desc)
        .setValue(c._id.toString()),
    );
  });

  const collectorSelector = new StringSelectMenuBuilder()
    .setCustomId('collector-selector')
    .setPlaceholder('Select a collector')
    .setMinValues(1)
    .setMaxValues(1)
    .addOptions(options);

  const actionRow = new ActionRowBuilder().addComponents(collectorSelector);

  const message = await i.editReply({
    embeds: [embedPrompt('Select a collector to attach a ticket in.')],
    components: [actionRow],
    flags: MessageFlags.Ephemeral,
  });
 
  return new Promise((resolve, reject) => {
    const collectorFilter = (interaction) => interaction.user.id === i.user.id;
    const collector = message.createMessageComponentCollector({
      componentType: ComponentType.StringSelect,
      filter: collectorFilter,
      time: 60_000,
    });
    collector.on('collect', async (interaction) => {
      const ticketCollectorId = interaction.values[0];
      const ticketCollector = collectors.find(
        (c) => c._id.toString() === ticketCollectorId,
      );
      await i.deleteReply();
      collector.stop();
      resolve({ interaction, ticketCollector });
    });

    collector.on('end', async (collected) => {
      if (collected.size === 0) {
        await i.deleteReply();
        collector.stop();
        reject('No collector selected');
      }
    });
  });
}

async function attachCollector({ interaction: i, ticketCollector }, channel) {
  await i.deferReply({ flags: MessageFlags.Ephemeral });
  let categories = [];

  for (const c of ticketCollector.categories) {
    const category = await findCategory(c._id.toString());
    if (category) categories.push(category);
  }

  if (categories.length === 0) {
    await i.deleteReply();
    return Promise.reject('No categories found in this collector.');
  }
  

  const embed = new EmbedBuilder()
    .setTitle(ticketCollector.title)
    .setDescription(ticketCollector.desc)
    .setColor(ticketCollector.color)
    .setImage(ticketCollector.image);

  let buttons = [];
  categories.forEach((c) => {
    buttons.push(
      new ButtonBuilder()
        .setCustomId(`ticket-${c._id.toString()}`)
        .setLabel(c.buttonText)
        .setStyle(getButtonStyle(c))
    );

    function getButtonStyle(c) {
      switch (c.buttonStyle) {
        case 'primary':
          return ButtonStyle.Primary;
        case 'secondary':
          return ButtonStyle.Secondary;
        case 'success':
          return ButtonStyle.Success;
        case 'danger':
          return ButtonStyle.Danger;
        default:
          return ButtonStyle.Secondary;
      }
    }
  });

  const actionRow = new ActionRowBuilder().addComponents(buttons);

  try {
    const targetChannel = await i.client.channels.fetch(channel);
    await targetChannel.send({ embeds: [embed], components: [actionRow] });

    await i.followUp({
      content: `Collector **${ticketCollector.title}** successfully attached to <#${channel}>.`,
      flags: MessageFlags.Ephemeral,
    });
  } catch (err) {
    console.error('Error sending message to the channel:', err);
    return Promise.reject('An error occurred while sending the collector.');
  }
}
