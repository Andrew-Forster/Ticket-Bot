const {
    Events,
    ButtonStyle,
    EmbedBuilder,
    ButtonBuilder,
    ActionRowBuilder,
    MessageFlags,
  } = require('discord.js');
  
  module.exports = {
    name: Events.InteractionCreate,
    once: false,
    async execute(i) {
      try {
        if (!i.isButton()) return;
        const interactionId = i.customId;
        
        if (!interactionId.startsWith('manage-')) return;
        
        const channelId = interactionId.split('-')[1];
        const channel = i.guild.channels.cache.get(channelId);
        
        if (!channel) {
          return i.followUp({ content: 'Ticket channel not found.', ephemeral: true });
        }
        
        const closeButton = new ButtonBuilder()
          .setCustomId(`close-${channel.id}`)
          .setLabel('Close Ticket')
          .setStyle(ButtonStyle.Danger);
        
        const addUserButton = new ButtonBuilder()
          .setCustomId(`addUser-${channel.id}`)
          .setLabel('Add User')
          .setStyle(ButtonStyle.Primary);
        
        const removeUserButton = new ButtonBuilder()
          .setCustomId(`removeUser-${channel.id}`)
          .setLabel('Remove User')
          .setStyle(ButtonStyle.Primary);
        
        const saveTranscriptButton = new ButtonBuilder()
          .setCustomId(`saveTranscript-${channel.id}`)
          .setLabel('Save Transcript')
          .setStyle(ButtonStyle.Secondary);
        
        const actionRow = new ActionRowBuilder().addComponents(
          closeButton,
          addUserButton,
          removeUserButton,
          saveTranscriptButton
        );
        
        await i.followUp({
          content: 'Ticket management options:',
          components: [actionRow],
          ephemeral: true,
        });
      } catch (err) {
        console.error('Ticket management error:', err);
      }
    },
  };
  