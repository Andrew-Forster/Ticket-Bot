const {
  SlashCommandBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require('discord.js');
const createEmbed = require('../../utils/embedBuilder');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('about')
    .setDescription('Displays information about Ticket Bot'),
  async execute(interaction) {
    await interaction.deferReply();

    const embedOptions = {
      description: `A cool Ticket Bot`,
      timestamp: false,
    };

    const adButton = new ButtonBuilder()
      .setLabel('Github')
      .setStyle(ButtonStyle.Link)
      .setURL(`https://andrewjf.com/gh`);
    const row = new ActionRowBuilder().addComponents(adButton);

    const embed = createEmbed.createEmbed(embedOptions);

    await interaction.editReply({ embeds: [embed], components: [row] });
  },
};
