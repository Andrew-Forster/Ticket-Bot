const {
  Events,
  ButtonStyle,
  EmbedBuilder,
  ButtonBuilder,
  ActionRowBuilder,
  MessageFlags,
  UserSelectMenuBuilder,
  ComponentType,
  OverwriteType,
} = require('discord.js');

async function showManagePanel(i, channel, category) {
  const closeButton = new ButtonBuilder()
    .setCustomId(`close`)
    .setLabel('Close Ticket')
    .setStyle(ButtonStyle.Danger)
    .setEmoji('🔒');

  const openButton = new ButtonBuilder()
    .setCustomId(`open`)
    .setLabel('Open Ticket')
    .setStyle(ButtonStyle.Success)
    .setEmoji('🔓');

  const addUserButton = new ButtonBuilder()
    .setCustomId(`addUser`)
    .setLabel('Add User')
    .setStyle(ButtonStyle.Primary)
    .setEmoji('➕');

  const removeUserButton = new ButtonBuilder()
    .setCustomId(`removeUser`)
    .setLabel('Remove User')
    .setStyle(ButtonStyle.Primary)
    .setEmoji('➖');

  const actionRow = new ActionRowBuilder();

  let isOpen = null;
  const users = await getUsersInChannel(channel);
  for (const user of users) {
    const member = await channel.guild.members.fetch(user).catch(() => null);
    if (member) {
      const hasViewChannelRole = member.roles.cache.some((role) =>
        channel.permissionsFor(role).has('ViewChannel'),
      );
      const memberPermissions = channel.permissionsFor(member);
      if (hasViewChannelRole) {
        continue;
      }
      if (memberPermissions.has('ViewChannel')) {
        isOpen = true;
        break;
      }
      isOpen = false;
    }
  }
  if (isOpen != null) {
    actionRow.addComponents(isOpen ? closeButton : openButton);
  }
  actionRow.addComponents(addUserButton);
  if (isOpen) {
    actionRow.addComponents(removeUserButton);
  }

  const message = await i.followUp({
    content: 'Ticket management options:',
    components: [actionRow],
    flags: MessageFlags.Ephemeral,
  });

  const filter = (interaction) => interaction.user.id === i.user.id;
  const collector = message.createMessageComponentCollector({
    filter,
    time: 60_000,
  });

  collector.on('collect', async (interaction) => {
    collector.stop();
    switch (interaction.customId) {
      case 'close':
        await closeTicket(channel, category);
        await interaction.channel.send({
          embeds: [
            new EmbedBuilder()
              .setTitle('🔒 Ticket Closed')
              .setDescription('Users have been removed.')
              .setColor('#ff0000'),
          ],
        });
        break;
      case 'open':
        const response = await openTicket(channel, category);
        if (response) {
          await interaction.reply({
            content: response,
            flags: MessageFlags.Ephemeral,
          });
          return;
        }
        await interaction.channel.send({
          embeds: [
            new EmbedBuilder()
              .setTitle('🔓 Ticket Opened')
              .setDescription('Users have been added.')
              .setColor('#00ff00'),
          ],
        });
        break;
      case 'addUser':
        const { users: usersToAdd, interaction: i1 } = await showUserSelect(
          interaction,
          'Select users to add to the ticket.',
        );
        if (usersToAdd) {
          const addedUsers = await addUsersToTicket(channel, usersToAdd);
          const mention = addedUsers.map((user) => `<@${user}>`).join(', ');

          if (addedUsers.length === 0) {
            await interaction.followUp({
              embeds: [
                new EmbedBuilder()
                  .setTitle('❌ No Users Added')
                  .setDescription('Users were already in the ticket.')
                  .setColor('#ff0000'),
              ],
              flags: MessageFlags.Ephemeral,
            });
            return;
          }

          await interaction.channel.send({
            embeds: [
              new EmbedBuilder()
                .setTitle(`✅ ${mention > 1 ? 'User' : 'Users'} Added`)
                .setDescription(
                  `${mention} ${mention > 1 ? 'have' : 'has'} been added to the ticket.`,
                )
                .setColor('#00ff00'),
            ],
          });
        }
        break;
      case 'removeUser':
        const { users: usersToRemove, interaction: i2 } = await showUserSelect(
          interaction,
          'Select users to remove from the ticket.',
        );
        if (usersToRemove) {
          const removedUsers = await removeUsersFromTicket(
            channel,
            usersToRemove,
          );
          const mention = removedUsers.map((user) => `<@${user}>`).join(', ');

          if (removedUsers.length === 0) {
            await interaction.followUp({
              embeds: [
                new EmbedBuilder()
                  .setTitle('❌ No Users Removed')
                  .setDescription(
                    'Users were not in the ticket or have roles that allow access.',
                  )
                  .setColor('#ff0000'),
              ],
              flags: MessageFlags.Ephemeral,
            });
            return;
          }

          await interaction.channel.send({
            embeds: [
              new EmbedBuilder()
                .setTitle(`❎ ${mention > 1 ? 'Users' : 'User'} Removed`)
                .setDescription(
                  `${mention} ${mention > 1 ? 'have' : 'has'} been removed from the ticket.`,
                )
                .setColor('#00ff00'),
            ],
          });
        }
        break;
    }
  });

  collector.on('end', async () => {
    if (!message || !message.guild || !message.channel) {
      return;
    }
    try {
      await i.deleteReply();
    } catch (err) {
      console.error('Error deleting reply:', err);
    }
    collector.stop();
  });
}

async function getUsersInChannel(channel) {
  const users = channel.permissionOverwrites.cache
    .filter((overwrite) => overwrite.type === OverwriteType.Member)
    .map((overwrite) => overwrite.id);

  return users;
}

async function closeTicket(channel, category) {
  await channel.setParent(category.closeCategoryId, { lockPermissions: false });
  const users = await getUsersInChannel(channel);
  users.forEach(async (userId) => {
    const member = await channel.guild.members.fetch(userId).catch(() => null);
    if (member) {
      await channel.permissionOverwrites.create(member, {
        ViewChannel: false,
        SendMessages: false,
        ReadMessageHistory: false,
      });
    }
  });
}

async function openTicket(channel, category) {
  await channel.setParent(category.categoryId, { lockPermissions: false });
  const users = await getUsersInChannel(channel);
  if (users.length === 0) return 'No users in ticket';
  users.forEach(async (userId) => {
    const member = await channel.guild.members.fetch(userId).catch(() => null);
    if (member) {
      await channel.permissionOverwrites.create(member, {
        ViewChannel: true,
        SendMessages: true,
        ReadMessageHistory: true,
      });
    }
  });
}

async function showUserSelect(i, text) {
  await i.deferReply({ flags: MessageFlags.Ephemeral });
  const userSelector = new UserSelectMenuBuilder()
    .setCustomId('user-selector')
    .setPlaceholder('Select users')
    .setMinValues(1)
    .setMaxValues(10);

  const actionRow = new ActionRowBuilder().addComponents(userSelector);

  const message = await i.editReply({
    embeds: [
      new EmbedBuilder()
        .setTitle('Manage Ticket')
        .setDescription(text)
        .setColor('#9ae1ff'),
    ],
    components: [actionRow],
    flags: MessageFlags.Ephemeral,
  });

  return new Promise((resolve, reject) => {
    const collectorFilter = (interaction) => interaction.user.id === i.user.id;
    const collector = message.createMessageComponentCollector({
      componentType: ComponentType.UserSelect,
      filter: collectorFilter,
      time: 60_000,
    });

    collector.on('collect', async (interaction) => {
      const users = interaction.values;
      i.deleteReply();
      collector.stop();
      resolve({ interaction, users });
    });

    collector.on('end', async (collected) => {
      if (collected.size === 0) {
        if (!message || !message.guild || !message.channel) {
          return; // Ensure we handle cases where the message or channel was deleted
        }
        try {
          i.deleteReply();
          collector.stop();
          reject('No user selected');
        } catch (err) {
          console.error('Error deleting reply:', err);
        }
      }
    });
  });
}

async function addUsersToTicket(channel, userIds) {
  const addedUsers = [];

  for (const userId of userIds) {
    const member = await channel.guild.members.fetch(userId).catch(() => null);
    if (!member) continue;

    const permissions = channel.permissionOverwrites.cache.get(userId);
    if (permissions && permissions.allow.has('ViewChannel')) continue;

    await channel.permissionOverwrites.create(member, {
      ViewChannel: true,
      SendMessages: true,
      ReadMessageHistory: true,
    });

    addedUsers.push(userId);
  }

  return addedUsers;
}

async function removeUsersFromTicket(channel, userIds) {
  const removedUsers = [];

  for (const userId of userIds) {
    const member = await channel.guild.members.fetch(userId).catch(() => null);
    if (!member) continue;

    const permissions = channel.permissionOverwrites.cache.get(userId);
    if (!permissions || !permissions.allow.has('ViewChannel')) continue;

    await channel.permissionOverwrites.delete(userId);

    removedUsers.push(userId);
  }

  return removedUsers;
}

module.exports = {
  closeTicket,
  openTicket,
  showUserSelect,
  addUsersToTicket,
  removeUsersFromTicket,
  showManagePanel,
};
