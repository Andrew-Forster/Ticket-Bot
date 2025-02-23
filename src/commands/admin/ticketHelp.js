const {
  SlashCommandBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  ComponentType,
} = require('discord.js');

const ticketSetup = require('./ticketSetup');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ticket-help')
    .setDescription('Creating a ticket system'),

  async execute(interaction) {
    const embed = new EmbedBuilder().setTitle('Create a Ticket System')
      .setDescription(`
**Steps:**

1. **Create a Ticket Response**
> This will be the message that will be sent to the ticket channel when the user creates a ticket.

2. **Create some Ticket Categories**
> These will be the buttons that the user can click to create a ticket.
> Ex. Bug Report, Feature Request, Applications, etc.

3. **Create a Ticket Collector**
> This will be the embed that will be sent to the ticket channel when the user clicks on a ticket category.
          `);

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('create')
        .setLabel('Create')
        .setStyle(ButtonStyle.Primary)
        .setEmoji('🎫'),
    );

    const response = await interaction.reply({
      embeds: [embed],
      components: [row],
    });

    const collectorFilter = (i) => i.user.id === interaction.user.id;
    const collector = response.createMessageComponentCollector({
      componentType: ComponentType.Button,
      filter: collectorFilter,
      time: 60_000,
    });

    collector.on('collect', async (i) => {
      if (i.customId === 'create') {
        await interaction.deleteReply();
        ticketSetup.execute(i);
        collector.stop();
      }
    });

    collector.on('end', (collected) => {
      if (collected.size === 0) {
        response.delete();
      }
    });
  },
};
