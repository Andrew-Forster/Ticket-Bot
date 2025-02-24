const {
  Events,
  ButtonStyle,
  EmbedBuilder,
  ButtonBuilder,
  ActionRowBuilder,
  MessageFlags,
  UserSelectMenuBuilder,
  ComponentType,
} = require('discord.js');

async function showManagePanel(i, channel) {
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

  let isOpen = true;
  const users = await getUsersInChannel(channel);
  if (users.length === 0) {
    isOpen = false;
  }
  for (const userId of users) {
    const member = await channel.guild.members.fetch(userId).catch(() => null);
    if (member) {
      const memberPermissions = channel.permissionsFor(member);
      if (!memberPermissions.has('ViewChannel')) {
        isOpen = false;
        break;
      }
    }
  }

  const actionRow = new ActionRowBuilder().addComponents(
    isOpen ? closeButton : openButton,
    addUserButton,
    removeUserButton,
  );

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
    i.deleteReply();
    collector.stop();
    switch (interaction.customId) {
      case 'close':
        await closeTicket(channel);
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
        await openTicket(channel);
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
        const { user: userToAdd, interaction: i1 } =
          await showUserSelect(interaction);
        if (userToAdd) {
          await addUserToTicket(channel, userToAdd);
          await interaction.channel.send({
            embeds: [
              new EmbedBuilder()
                .setTitle('➕ User Added')
                .setDescription(
                  `User <@${userToAdd}> has been added to the ticket.`,
                )
                .setColor('#00ff00'),
            ],
          });
        }
        break;
      case 'removeUser':
        const { user: userToRemove, interaction: i2 } =
          await showUserSelect(interaction);
        if (userToRemove) {
          await removeUserFromTicket(channel, userToRemove);
          await interaction.channel.send({
            embeds: [
              new EmbedBuilder()
                .setTitle('➖ User Removed')
                .setDescription(
                  `User <@${userToRemove}> has been removed from the ticket.`,
                )
                .setColor('#ff0000'),
            ],
          });
        }
        break;
    }
  });

  collector.on('end', async () => {
    i.deleteReply();
    collector.stop();
  });
}

async function getUsersInChannel(channel) {
  const users = [];
  channel.permissionOverwrites.cache.forEach((perm) => {
    if (perm.type === 1) {
      users.push(perm.id);
    }
  });
  return users;
}

async function closeTicket(channel) {
  const users = await getUsersInChannel(channel);
  users.forEach(async (userId) => {
    const member = await channel.guild.members.fetch(userId).catch(() => null);
    if (member) {
      await channel.permissionOverwrites.edit(member, {
        ViewChannel: false,
        SendMessages: false,
        ReadMessageHistory: false,
      });
    }
  });
}

async function openTicket(channel) {
  const users = await getUsersInChannel(channel);
  users.forEach(async (userId) => {
    const member = await channel.guild.members.fetch(userId).catch(() => null);
    if (member) {
      await channel.permissionOverwrites.edit(member, {
        ViewChannel: true,
        SendMessages: true,
        ReadMessageHistory: true,
      });
    }
  });
}

async function showUserSelect(i) {
  await i.deferReply({ flags: MessageFlags.Ephemeral });
  const userSelector = new UserSelectMenuBuilder()
    .setCustomId('user-selector')
    .setPlaceholder('Select a user')
    .setMinValues(1)
    .setMaxValues(1);

  const actionRow = new ActionRowBuilder().addComponents(userSelector);

  const message = await i.editReply({
    embeds: [
      new EmbedBuilder()
        .setTitle('Manage Ticket')
        .setDescription('Select a user to add or remove from the ticket.')
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
      const user = interaction.values[0];
      i.deleteReply();
      collector.stop();
      resolve({ interaction, user });
    });

    collector.on('end', async (collected) => {
      if (collected.size === 0) {
        i.deleteReply();
        collector.stop();
        reject('No user selected');
      }
    });
  });
}

async function addUserToTicket(channel, userId) {
  const member = await channel.guild.members.fetch(userId).catch(() => null);
  if (member) {
    await channel.permissionOverwrites.edit(member, {
      ViewChannel: true,
      SendMessages: true,
      ReadMessageHistory: true,
    });
  }
}

async function removeUserFromTicket(channel, userId) {
  const member = await channel.guild.members.fetch(userId).catch(() => null);
  if (member) {
    await channel.permissionOverwrites.edit(member, {
      ViewChannel: null,
      SendMessages: null,
      ReadMessageHistory: null,
    });
  }
}

module.exports = {
  closeTicket,
  openTicket,
  showUserSelect,
  addUserToTicket,
  removeUserFromTicket,
  showManagePanel,
};
