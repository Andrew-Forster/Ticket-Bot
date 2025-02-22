const {
  SlashCommandBuilder,
  ActionRowBuilder,
  ModalBuilder,
  TextInputBuilder,
  ComponentType,
  RoleSelectMenuBuilder,
  TextInputStyle,
  MessageFlags,
} = require('discord.js');

const pendingTicketResponses = new Map();

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ticket-response')
    .setDescription('Create a Ticket Response'),

  async execute(interaction) {
    await interaction.deferReply();
    // Role Selector
    const roleSelector = new RoleSelectMenuBuilder()
      .setCustomId('role-selector')
      .setPlaceholder('Select roles to mention')
      .setMinValues(1)
      .setMaxValues(5);

    const actionRow = new ActionRowBuilder().addComponents(roleSelector);

    const message = await interaction.editReply({ components: [actionRow] });

    const collectorFilter = (i) => i.user.id === interaction.user.id;
    const collector = message.createMessageComponentCollector({
      componentType: ComponentType.RoleSelect,
      filter: collectorFilter,
      time: 60_000,
    });


    collector.on('collect', async (i) => {
      const roles = i.values.map((role) => role);
      pendingTicketResponses.set(i.user.id, { roles });

      const modal = new ModalBuilder()
        .setCustomId('ticket-response-modal')
        .setTitle('Ticket Response');

      const title = new TextInputBuilder()
        .setCustomId('title')
        .setLabel('Title')
        .setStyle(TextInputStyle.Short)
        .setRequired(true);
      const titleRow = new ActionRowBuilder().addComponents(title);

      const desc = new TextInputBuilder()
        .setCustomId('desc')
        .setLabel('Description')
        .setStyle(TextInputStyle.Paragraph)
        .setRequired(true);
      const descRow = new ActionRowBuilder().addComponents(desc);

      const image = new TextInputBuilder()
        .setCustomId('image')
        .setLabel('Image URL')
        .setStyle(TextInputStyle.Short)
        .setRequired(false);
      const imageRow = new ActionRowBuilder().addComponents(image);

      const color = new TextInputBuilder()
        .setCustomId('color')
        .setLabel('Color (HEX) - Default: #ffffff')
        .setStyle(TextInputStyle.Short)
        .setRequired(false);
      const colorRow = new ActionRowBuilder().addComponents(color);

      modal.addComponents(titleRow, descRow, imageRow, colorRow);

      await i.showModal(modal);
      collector.stop();
      await i.message.delete();

    });
  },
};

module.exports.pendingTicketResponses = pendingTicketResponses;
