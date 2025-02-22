const {
  SlashCommandBuilder,
  ActionRowBuilder,
  ModalBuilder,
  TextInputBuilder,
  ComponentType,
  RoleSelectMenuBuilder,
  ChannelSelectMenuBuilder,
  TextInputStyle,
  MessageFlags,
  EmbedBuilder,
  ChannelType,
  ButtonBuilder,
  ButtonStyle,
} = require('discord.js');

const config = require('../../../config/config.json');

const {
  submitTicketResponse,
  submitTicketCategory,
  submitTicketCollector
} = require('../../../db/access/ticketSetup');

// 1. Creates a Ticket Response
// Sends a role selector to the user
// Collects the roles the user wants to mention
// Sends the ticket response to the ticket channel
// Saves the ticket response to the database
module.exports = {
  data: new SlashCommandBuilder()
    .setName('ticket-setup')
    .setDescription('Create a Ticket System'),

  async execute(interaction) {
    let numberOfCategories = 0;
    let categories = []; // Object Ids to be saved to the database
    await showRoleSelector(interaction);

    async function showRoleSelector(i) {
      await i.deferReply({ flags: MessageFlags.Ephemeral });
      const roleSelector = new RoleSelectMenuBuilder()
        .setCustomId('role-selector')
        .setPlaceholder('Select roles to mention')
        .setMinValues(1)
        .setMaxValues(5);

      const actionRow = new ActionRowBuilder().addComponents(roleSelector);

      const message = await i.editReply({
        embeds: [
          embedPrompt(
            'Select the roles you want to mention when a ticket is created.',
          ),
        ],
        components: [actionRow],
        flags: MessageFlags.Ephemeral,
      });

      const collectorFilter = (iNew) => iNew.user.id === i.user.id;
      const collector = message.createMessageComponentCollector({
        componentType: ComponentType.RoleSelect,
        filter: collectorFilter,
        time: 60_000,
      });

      collector.on('collect', async (iNew) => {
        const roles = iNew.values.map((role) => role);
        await i.deleteReply();
        await showTicketResponseModal(iNew, roles);
        collector.stop();
      });

      collector.on('end', async (collected) => {
        if (collected.size === 0) {
          await i.deleteReply();
          await i.followUp({
            content: 'You did not select any roles.',
            flags: MessageFlags.Ephemeral,
          });
          collector.stop();
        }
      });
    }

    async function showTicketResponseModal(i, roles) {
      const modal = new ModalBuilder()
        .setCustomId('ticket-response-modal')
        .setTitle('Ticket Response After Creation');

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

      const filter = (iNew) => iNew.customId === 'ticket-response-modal';
      await i
        .awaitModalSubmit({ time: 900_000, filter }) // 15 minutes
        .then(async (iNew) => {
          try {
            const ticketResponseId = await submitTicketResponse(iNew, roles);
            await showTicketCategorySelector(iNew, ticketResponseId);
          } catch (err) {
            console.log('Error submitting ticket response:', err);
          }
        })
        .catch((err) =>
          console.log('No modal submit interaction was collected'),
        );
    }

    async function showTicketCategorySelector(i, ticketResponseId) {
      const categorySelector = new ChannelSelectMenuBuilder()
        .setCustomId('category-selector')
        .setPlaceholder('Select a category')
        .setMinValues(1)
        .setMaxValues(1)
        .addChannelTypes(ChannelType.GuildCategory);

      const actionRow = new ActionRowBuilder().addComponents(categorySelector);

      const message = await i.reply({
        embeds: [embedPrompt('Select a category to create a ticket in.')],
        components: [actionRow],
        flags: MessageFlags.Ephemeral,
      });

      const collectorFilter = (iNew) => iNew.user.id === i.user.id;
      const collector = message.createMessageComponentCollector({
        componentType: ComponentType.ChannelSelect,
        filter: collectorFilter,
        time: 60_000,
      });

      collector.on('collect', async (iNew) => {
        const category = iNew.values[0];
        i.deleteReply();
        await showTicketCategoryButtonStyleOptions(
          iNew,
          category,
          ticketResponseId,
        );
        collector.stop();
      });

      collector.on('end', async (collected) => {
        if (collected.size === 0) {
          await i.deleteReply();
          await i.followUp({
            content: 'You did not select a category.',
            flags: MessageFlags.Ephemeral,
          });
          collector.stop();
        }
      });
    }

    async function showTicketCategoryButtonStyleOptions(
      i,
      category,
      ticketResponseId,
    ) {
      await i.deferReply({ flags: MessageFlags.Ephemeral });
      const primaryButton = new ButtonBuilder()
        .setCustomId('primary')
        .setLabel('Primary')
        .setStyle(ButtonStyle.Primary);

      const secondaryButton = new ButtonBuilder()
        .setCustomId('secondary')
        .setLabel('Secondary')
        .setStyle(ButtonStyle.Secondary);

      const successButton = new ButtonBuilder()
        .setCustomId('success')
        .setLabel('Success')
        .setStyle(ButtonStyle.Success);

      const dangerButton = new ButtonBuilder()
        .setCustomId('danger')
        .setLabel('Danger')
        .setStyle(ButtonStyle.Danger);

      const linkButton = new ButtonBuilder()
        .setCustomId('link')
        .setLabel('Link 🔗')
        .setStyle(ButtonStyle.Secondary);

      const row = new ActionRowBuilder().addComponents([
        primaryButton,
        secondaryButton,
        successButton,
        dangerButton,
        linkButton,
      ]);

      const message = await i.followUp({
        embeds: [embedPrompt('Select a button style.')],
        components: [row],
        flags: MessageFlags.Ephemeral,
        fetchReply: true,
      });

      const collectorFilter = (iNew) => iNew.user.id === i.user.id;
      const collector = message.createMessageComponentCollector({
        componentType: ComponentType.Button,
        filter: collectorFilter,
        time: 60_000,
      });

      collector.on('collect', async (iNew) => {
        const buttonStyle = iNew.customId;
        await i.deleteReply(message.id);
        await showTicketCategoryModal(
          iNew,
          category,
          ticketResponseId,
          buttonStyle,
        );
        collector.stop();
      });

      collector.on('end', async (collected) => {
        if (collected.size === 0) {
          await i.deleteReply();
          await i.followUp({
            content: 'You did not select a button style.',
            flags: MessageFlags.Ephemeral,
          });
          collector.stop();
        }
      });
    }

    async function showTicketCategoryModal(
      i,
      category,
      ticketResponseId,
      buttonStyle,
    ) {
      const modal = new ModalBuilder()
        .setCustomId('ticket-category-modal')
        .setTitle('Ticket Category');

      const buttonText = new TextInputBuilder()
        .setCustomId('button-text')
        .setLabel('Button Text')
        .setMaxLength(20)
        .setStyle(TextInputStyle.Short)
        .setRequired(true);
      const buttonTextRow = new ActionRowBuilder().addComponents(buttonText);

      const buttonEmoji = new TextInputBuilder()
        .setCustomId('button-emoji')
        .setLabel('Button Emoji')
        .setMaxLength(35)
        .setStyle(TextInputStyle.Short)
        .setRequired(true);
      const buttonEmojiRow = new ActionRowBuilder().addComponents(buttonEmoji);

      modal.addComponents(buttonTextRow, buttonEmojiRow);

      await i.showModal(modal);

      const filter = (i) => i.customId === 'ticket-category-modal';
      await i
        .awaitModalSubmit({ time: 900_000, filter }) // 15 minutes
        .then(async (iNew) => {
          try {
            let result = await submitTicketCategory(
              iNew,
              category,
              ticketResponseId,
              buttonStyle,
            );
            numberOfCategories++;
            categories.push(result);
            await askAnotherCategory(iNew);
          } catch (err) {
            console.log('Error submitting ticket category:', err);
          }
        })
        .catch((err) =>
          console.log('No modal submit interaction was collected'),
        );
    }

    async function askAnotherCategory(i) {
      await i.deferReply({ flags: MessageFlags.Ephemeral });
      const response = await i.editReply({
        embeds: [
          embedPrompt(
            `Would you like to create another category? You currently have ${numberOfCategories}/5 categories.`,
          ),
        ],
        components: [
          new ActionRowBuilder().addComponents(
            new ButtonBuilder()
              .setCustomId('yes')
              .setLabel('Yes')
              .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
              .setCustomId('no')
              .setLabel('No, Finish Setup')
              .setStyle(ButtonStyle.Secondary),
          ),
        ],
        flags: MessageFlags.Ephemeral,
      });

      const collectorFilter = (iNew) => iNew.user.id === i.user.id;
      const collector = response.createMessageComponentCollector({
        componentType: ComponentType.Button,
        filter: collectorFilter,
        time: 60_000,
      });

      collector.on('collect', async (iNew) => {
        if (iNew.customId === 'yes') {
          await i.deleteReply();
          await showRoleSelector(iNew);
          collector.stop();
        } else if (iNew.customId === 'no') {
          await i.deleteReply();
          await showCollectionModal(iNew);
          collector.stop();
        }
      });
    }

    async function showCollectionModal(i) {
      const modal = new ModalBuilder()
        .setCustomId('ticket-collection-modal')
        .setTitle('Ticket Collection Setup');

      const title = new TextInputBuilder()
        .setCustomId('collection-title')
        .setLabel('Title')
        .setStyle(TextInputStyle.Short)
        .setMaxLength(20)
        .setRequired(true);
      const titleRow = new ActionRowBuilder().addComponents(title);

      const desc = new TextInputBuilder()
        .setCustomId('collection-desc')
        .setLabel('Description')
        .setStyle(TextInputStyle.Paragraph)
        .setRequired(true);
      const descRow = new ActionRowBuilder().addComponents(desc);

      const image = new TextInputBuilder()
        .setCustomId('collection-image')
        .setLabel('Image URL')
        .setStyle(TextInputStyle.Short)
        .setRequired(false);
      const imageRow = new ActionRowBuilder().addComponents(image);

      const color = new TextInputBuilder()
        .setCustomId('collection-color')
        .setLabel('Color (HEX) - Default: #ffffff')
        .setStyle(TextInputStyle.Short)
        .setRequired(false);
      const colorRow = new ActionRowBuilder().addComponents(color);

      modal.addComponents(titleRow, descRow, imageRow, colorRow);

      await i.showModal(modal);

      const filter = (i) => i.customId === 'ticket-collection-modal';
      await i
        .awaitModalSubmit({ time: 900_000, filter }) // 15 minutes
        .then(async (iNew) => {
          try {
            let result = await submitTicketCollector(iNew, categories);
            await iNew.reply({
              embeds: [embedPrompt('Ticket System setup complete!', '#5eff5e')],
              flags: MessageFlags.Ephemeral,
            });
          } catch (err) {
            console.log('Error submitting ticket collector:', err);
          }
        })
        .catch((err) =>
          console.log('No modal submit interaction was collected'),
        );
    }

  }, // end of execute
};

function embedPrompt(content, color = config.bot_color) {
  const embed = new EmbedBuilder()
    .setTitle('Create a Ticket System')
    .setDescription(content)
    .setColor(color);
  return embed;
}