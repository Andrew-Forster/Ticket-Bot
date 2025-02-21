const { REST, Routes, Collection } = require('discord.js');
const fs = require('fs');
const path = require('path');
const config = require('../../config/config.json');
const { getCdMessages, getDenyMessages } = require('./responseBuilder');
const { createEmbed } = require('./embedBuilder');

async function loadCommands(client) {
  const commands = [];
  const commandPath = path.join(__dirname, '../commands');

  const readFilesRecursively = (dir) => {
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        readFilesRecursively(fullPath);
      } else if (file.endsWith('.js')) {
        const command = require(fullPath);
        if ('data' in command && 'execute' in command) {
          commands.push(command.data.toJSON());
          client.commands.set(command.data.name, command);
        } else {
          console.error(
            `Command file at ${file} is missing required properties.`,
          );
        }
      }
    }
  };

  readFilesRecursively(commandPath);

  // Register commands
  if (config.deploy_commands) {
    const rest = new REST().setToken(process.env.BOT_TOKEN);
    try {
      console.log('Started refreshing application commands.');
      await rest.put(Routes.applicationCommands(client.user.id), {
        body: commands,
      });
      console.log('Successfully reloaded application commands.');
    } catch (error) {
      console.error('Error registering commands:', error);
    }
  }
}

async function synchronizeCommands(interaction, client) {
  if (!interaction.isCommand()) return;

  const command = client.commands.get(interaction.commandName);
  if (!command) {
    return interaction.reply({
      content: 'Something went wrong.',
      ephemeral: true,
    });
  }

  if (!interaction.inGuild()) {
    return interaction.reply({
      content: 'Commands can only be used on the guild.',
      ephemeral: true,
    });
  }

  const now = Date.now();
  const userId = interaction.user.id;
  const defaultCooldownDuration = 3;
  const globalCooldownAmount =
    (command.globalCooldown ?? defaultCooldownDuration) * 1_000;

  // Developer only commands
  if (command.developer && !config.dev_id.includes(userId)) {
    return interaction.reply({ content: getDenyMessages(), ephemeral: true });
  }

  // Server owner commands
  if (command.owner && interaction.user.id !== interaction.guild.ownerId) {
    return interaction.reply({
      content: 'This command is intended for the server owner only.',
      ephemeral: true,
    });
  }

  // Dev Cooldown Bypass
  if (config.dev_id.includes(userId)) {
    try {
      await command.execute(interaction);
    } catch (error) {
      console.error('Error executing command:', error);
    }
    return;
  }

  const globalCooldowns = client.globalCooldowns || new Collection();
  client.globalCooldowns = globalCooldowns;

  if (globalCooldowns.has(userId)) {
    const expirationTime = globalCooldowns.get(userId) + globalCooldownAmount;

    if (now < expirationTime) {
      const remainingTime = Math.ceil((expirationTime - now) / 1_000);
      return interaction.reply({
        content: getCdMessages().replace(
          '${remainingTime}',
          remainingTime,
        ),
        ephemeral: true,
      });
    }
  }

  // Global Cooldowns
  globalCooldowns.set(userId, now);
  setTimeout(() => globalCooldowns.delete(userId), globalCooldownAmount);

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error('Error executing command:', error);
  }
}

module.exports = { loadCommands, synchronizeCommands };
