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

const { createTranscript } = require('../utils/utils');

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
        const resClose = await closeTicketFlow(interaction, channel, category);
        interaction.channel.send(resClose);
        await createTranscript(interaction);
        break;
      case 'open':
        const resOpen = await openTicketFlow(interaction, channel, category);
        interaction.channel.send(resOpen);
        break;
      case 'addUser':
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });
        await addUsers(interaction, channel);
        break;
      case 'removeUser':
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });
        await removeUsers(interaction, channel);
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

async function openTicketFlow(i, channel, category) {
  const response = await openTicket(channel, category);
  if (response) {
    return {
      content: response,
      flags: MessageFlags.Ephemeral,
    };
  }
  return {
    embeds: [
      new EmbedBuilder()
        .setTitle('🔓 Ticket Opened')
        .setDescription('Users have been added.')
        .setColor('#00ff37'),
    ],
  };
}

async function closeTicketFlow(i, channel, category) {
  const response = await closeTicket(channel, category);
  if (response) {
    return {
      content: response,
      flags: MessageFlags.Ephemeral,
    };
  }
  return {
    embeds: [
      new EmbedBuilder()
        .setTitle('🔒 Ticket Closed')
        .setDescription('Users have been removed.')
        .setColor('#ffc800'),
    ],
  };
}

async function deleteTicketFlow(i, channel, category) {
  const confirmation = await i.reply({
    embeds: [
      new EmbedBuilder()
        .setTitle('Delete Ticket')
        .setDescription('Are you sure you want to delete this ticket?')
        .setColor('#ff0000'),
    ],
    components: [
      new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('confirm')
          .setLabel('Confirm')
          .setStyle(ButtonStyle.Danger),
        new ButtonBuilder()
          .setCustomId('cancel')
          .setLabel('Cancel')
          .setStyle(ButtonStyle.Primary),
      ),
    ],
  });

  const filter = (interaction) => interaction.user.id === i.user.id;
  const collector = confirmation.createMessageComponentCollector({
    filter,
    time: 60_000,
  });

  collector.on('collect', async (interaction) => {
    collector.stop();
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });
    switch (interaction.customId) {
      case 'confirm':
        await channel.delete();
        break;
      case 'cancel':
        await interaction.editReply({
          embeds: [
            new EmbedBuilder()
              .setTitle('❌ Ticket Deletion Cancelled')
              .setColor('#99ff00'),
          ],
          components: [],
        });
        break;
    }
  });

  collector.on('end', async () => {
    collector.stop();
    if (!confirmation || !confirmation.guild || !confirmation.channel) {
      return;
    }
    try {
      await confirmation.deleteReply();
    } catch (err) {
      console.error('Error deleting reply:', err);
    }
  });
}

async function addUsers(i, channel) {
  const { users: usersToAdd, interaction } = await showUserSelect(
    i,
    'Select users to add to the ticket.',
  );
  if (usersToAdd) {
    const addedUsers = await addUsersToTicket(channel, usersToAdd);
    const mention = addedUsers.map((user) => `<@${user}>`).join(', ');

    if (addedUsers.length === 0) {
      await i.followUp({
        embeds: [
          new EmbedBuilder()
            .setTitle('❌ No Users Added')
            .setDescription('Users were already in the ticket.')
            .setColor('#ff7b00'),
        ],
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    await i.channel.send({
      embeds: [
        new EmbedBuilder()
          .setTitle(addedUsers.length > 1 ? `✅ Users Added` : `✅ User Added`)
          .setDescription(`Added ${mention} to the ticket.`)
          .setColor('#00c3ff'),
      ],
    });
  }
}

async function removeUsers(i, channel) {
  const { users: usersToRemove, interaction } = await showUserSelect(
    i,
    'Select users to remove from the ticket.',
  );
  if (usersToRemove) {
    const removedUsers = await removeUsersFromTicket(channel, usersToRemove);
    const mention = removedUsers.map((user) => `<@${user}>`).join(', ');

    if (removedUsers.length === 0) {
      await i.followUp({
        embeds: [
          new EmbedBuilder()
            .setTitle('❌ No Users Removed')
            .setDescription(
              'Users were not in the ticket or have roles that allow access.',
            )
            .setColor('#ff7b00'),
        ],
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    await i.channel.send({
      embeds: [
        new EmbedBuilder()
          .setTitle(
            removedUsers.length > 1 ? `❎ Users Removed` : `❎ User Removed`,
          )
          .setDescription(`Removed ${mention} from the ticket.`)
          .setColor('#00c3ff'),
      ],
    });
  }
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
  addUsers,
  removeUsers,
  getUsersInChannel,
  closeTicketFlow,
  openTicketFlow,
  deleteTicketFlow,
};
