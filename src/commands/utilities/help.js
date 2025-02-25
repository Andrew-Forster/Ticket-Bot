const { SlashCommandBuilder } = require('discord.js');
const createEmbed = require('../../utils/embedBuilder');


module.exports = {
  data: new SlashCommandBuilder()
    .setName('commands')
    .setDescription('Command List!'),

  async execute(interaction) {
    const commands = interaction.client.commands;
    const commandList = commands
      .map((cmd) => `\`/${cmd.data.name}\``)
      .join(', ');

    embedOptions = {
      titleText: 'List of commands',
      description: commandList,
    };

    const embed = createEmbed.createEmbed(embedOptions);
    await interaction.reply({ embeds: [embed] });
  },
};
