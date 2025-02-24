const {
  ActionRowBuilder,
  ModalBuilder,
  TextInputBuilder,
  ComponentType,
  RoleSelectMenuBuilder,
  ChannelSelectMenuBuilder,
  TextInputStyle,
  MessageFlags,
  ChannelType,
  ButtonBuilder,
  ButtonStyle,
} = require('discord.js');

const {
  submitTicketResponse,
  submitTicketCategory,
  submitTicketCollector,
} = require('../../db/access/ticketSetup');

const { embedPrompt } = require('../utils/embeds/prompt');

/**
 * Shows a role selector to the user to select roles to mention when a ticket is created.
 * The user is prompted to select one to five roles and the selected roles are returned.
 * If the user doesn't select any roles within 1 minute, the function rejects with 'No roles selected'.
 * @param {Object} i - The interaction object.
 * @returns {Promise<Object>} - Resolves { iNew, roles } if successful, rejects an error if not.
 */
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

  return new Promise((resolve, reject) => {
    const collectorFilter = (iNew) => iNew.user.id === i.user.id;
    const collector = message.createMessageComponentCollector({
      componentType: ComponentType.RoleSelect,
      filter: collectorFilter,
      time: 60_000,
    });

    collector.on('collect', async (iNew) => {
      const roles = iNew.values.map((role) => role);
      await i.deleteReply();
      collector.stop();
      resolve({ iNew, roles });
    });

    collector.on('end', async (collected) => {
      if (collected.size === 0) {
        await i.deleteReply();
        reject('No roles selected');
      }
    });
  });
}

/**
 * Shows a modal to the user to input the text, image URL, and color of the ticket response
 * after a ticket is created.
 * The modal includes four text input fields, one for the title, description, image URL, and color.
 * The user must input something in each field and click the submit button to submit the modal.
 * The `submitTicketResponse` function is called with the user's input and the roles to ping.
 * If the submission is successful, the function resolves with the interaction and the ID of the newly
 * created TicketResponse document. If the submission fails, the error is caught and logged to the console.
 * @param {Object} opts - An object with the interaction and the roles to ping.
 * @returns {Promise<Object>} - Resolves { iNew, ticketResponseId } if successful, rejects an error if not.
 */
async function showTicketResponseModal({ iNew: i, roles }) {
  
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

  return new Promise((resolve, reject) => {
    const filter = (iNew) => iNew.customId === 'ticket-response-modal';

    i.awaitModalSubmit({ time: 900_000, filter }) // 15 minutes
      .then(async (iNew) => {
        try {
          const ticketResponseId = await submitTicketResponse(iNew, roles);
          if (ticketResponseId.error) {
            return reject(ticketResponseId.error);
          }
          resolve({ iNew, ticketResponseId });
        } catch (err) {
          console.log('Error submitting ticket response:', err);
          reject('An error occurred while creating the Ticket Response.');
        }
      })
      .catch(() => reject('No modal submit interaction was collected'));
  });
}

/**
 * Shows a category selector to the user to select a category for the ticket.
 * The user is prompted to select one category and the selected category is returned.
 * If the user doesn't select a category within 1 minute, the function rejects with 'No category selected'.
 * @param {Object} opts - An object with the interaction and ticket response ID.
 * @returns {Promise<Object>} - Resolves { iNew, category, ticketResponseId } if successful, rejects an error if not.
 */
async function showTicketCategorySelector({ iNew: i, ticketResponseId }, text) {
  await i.deferReply({ flags: MessageFlags.Ephemeral });
  const categorySelector = new ChannelSelectMenuBuilder()
    .setCustomId('category-selector')
    .setPlaceholder('Select a category')
    .setMinValues(1)
    .setMaxValues(1)
    .addChannelTypes(ChannelType.GuildCategory);

  const actionRow = new ActionRowBuilder().addComponents(categorySelector);

  const message = await i.editReply({
    embeds: [embedPrompt(text)],
    components: [actionRow],
    flags: MessageFlags.Ephemeral,
  });

  return new Promise((resolve, reject) => {
    const collectorFilter = (iNew) => iNew.user.id === i.user.id;
    const collector = message.createMessageComponentCollector({
      componentType: ComponentType.ChannelSelect,
      filter: collectorFilter,
      time: 60_000,
    });

    collector.on('collect', async (iNew) => {
      const category = iNew.values[0];
      await i.deleteReply();
      collector.stop();
      resolve({ iNew, category, ticketResponseId });
    });

    collector.on('end', async (collected) => {
      if (collected.size === 0) {
        await i.deleteReply();
        collector.stop();
        reject('No category selected');
      }
    });
  });
}

/**
 * Shows a selection of button styles for a ticket category button.
 * The user is prompted to select one of the styles, and the selected style is returned.
 * @param {Object} opts - An object with the interaction, category, and ticket response ID.
 * @returns {Promise<Object>} - Resolves { iNew, category, ticketResponseId, buttonStyle } if successful, rejects an error if not.
 */
async function showTicketCategoryButtonStyleOptions({
  iNew: i,
  category,
  categoryClose,
  ticketResponseId,
}) {
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
  return new Promise((resolve, reject) => {
    const collectorFilter = (iNew) => iNew.user.id === i.user.id;
    const collector = message.createMessageComponentCollector({
      componentType: ComponentType.Button,
      filter: collectorFilter,
      time: 60_000,
    });

    collector.on('collect', async (iNew) => {
      const buttonStyle = iNew.customId;
      await i.deleteReply(message.id);
      resolve({ iNew, category, categoryClose, ticketResponseId, buttonStyle });
      collector.stop();
    });

    collector.on('end', async (collected) => {
      if (collected.size === 0) {
        await i.deleteReply();
        reject('No button style selected');
      }
    });
  });
}

/**
 * Shows a modal to the user to input the text and emoji for the ticket category button.
 * The modal includes two text input fields, one for the button text and one for the button emoji.
 * The user must input something in each field and click the submit button to submit the modal.
 * The `submitTicketCategory` function is called with the user's input and the category ID, ticket response ID, and button style.
 * If the submission is successful, the `askAnotherCategory` function is called.
 * If the submission fails, the error is caught and logged to the console.
 * @param {Object} opts - An object with the interaction, category, ticket response ID, and button style.
 * @returns {Promise<Object>} - Resolves { iNew, result } if successful, rejects an error if not.
 */
async function showTicketCategoryModal({
  iNew: i,
  category,
  categoryClose,
  ticketResponseId,
  buttonStyle,
}) {
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
    .setRequired(false);
  const buttonEmojiRow = new ActionRowBuilder().addComponents(buttonEmoji);

  modal.addComponents(buttonTextRow, buttonEmojiRow);

  await i.showModal(modal);

  return new Promise((resolve, reject) => {
    const filter = (i) => i.customId === 'ticket-category-modal';
    i.awaitModalSubmit({ time: 900_000, filter }) // 15 minutes
      .then(async (iNew) => {
        try {
          let result = await submitTicketCategory(
            iNew,
            category,
            categoryClose,
            ticketResponseId,
            buttonStyle,
          );
          resolve({ iNew, result });
        } catch (err) {
          console.log('Error submitting ticket category:', err);
          reject(err);
        }
      })
      .catch((err) => {
        console.log('No modal submit interaction was collected');
        reject(err);
      });
  });
}

/**
 * Asks the user if they want to create another category.
 * If yes, the {@link showTicketCategorySelector} function is called again.
 * If no, the user is prompted to finish the setup by creating their ticket collector.
 * @param {Object} opts - An object with the interaction and the number of categories created so far.
 * @returns {Promise<Object>} - Resolves { iNew, result } if successful, rejects an error if not. Result is either 'yes' or 'no'.
 */
async function askAnotherCategory({ iNew: i }, numberOfCategories) {
  await i.deferReply({ flags: MessageFlags.Ephemeral });
  const components = [
    new ButtonBuilder()
      .setCustomId('yes')
      .setLabel(numberOfCategories < 5 ? 'Yes' : 'Complete Setup')
      .setStyle(
        numberOfCategories < 5 ? ButtonStyle.Primary : ButtonStyle.Success,
      )
      .setEmoji('✅'),
  ];

  if (numberOfCategories < 5) {
    components.push(
      new ButtonBuilder()
        .setCustomId('no')
        .setLabel('No, Finish Setup')
        .setStyle(ButtonStyle.Secondary)
        .setEmoji('➡️'),
    );
  }

  const response = await i.editReply({
    embeds: [
      embedPrompt(
        numberOfCategories < 5
          ? `Would you like to create another category? You currently have ${numberOfCategories}/${5} categories.
        
        If not you will be prompted to finish the setup by creating your ticket collector.`
          : `You currently have ${numberOfCategories} categories. You will be prompted to finish the setup by creating your ticket collector.`,
      ),
    ],
    components: [new ActionRowBuilder().addComponents(...components)],
    flags: MessageFlags.Ephemeral,
  });

  const collectorFilter = (iNew) => iNew.user.id === i.user.id;
  const collector = response.createMessageComponentCollector({
    componentType: ComponentType.Button,
    filter: collectorFilter,
    time: 60_000,
  });

  return new Promise((resolve, reject) => {
    collector.on('collect', async (iNew) => {
      try {
        await i.deleteReply();
        resolve({ iNew, result: iNew.customId });
        collector.stop();
      } catch (error) {
        reject('No button selected');
      }
    });
  });
}

/**
 * Shows a modal to the user, asking for information to create a ticket collector.
 * The modal contains text inputs for the title, description, image URL, and color of the ticket collector.
 * If the user submits the modal, the function will create a new TicketCollector document and save it to the database.
 * The function will resolve with the ID of the newly created TicketCollector document, or reject with an error message if something went wrong.
 * @param {Object} opts - An object with the interaction and the categories created so far.
 * @returns {Promise<Object>} - Resolves { iNew, id } if successful, rejects an error if not.
 */
async function showCollectionModal({ iNew: i }, categories) {
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

  return new Promise((resolve, reject) => {
    const filter = (i) => i.customId === 'ticket-collection-modal';
    i.awaitModalSubmit({ time: 900_000, filter }) // 15 minutes
      .then(async (iNew) => {
        let id = await submitTicketCollector(iNew, categories);
        if (id.error) {
          return reject(id.error);
        }
        resolve({ iNew, id });
      })
      .catch((err) => {
        console.log('No modal submit interaction was collected: ', err);
        reject('No modal submit interaction was collected');
      });
  });
}

module.exports = {
  showRoleSelector,
  showTicketResponseModal,
  showTicketCategorySelector,
  showTicketCategoryButtonStyleOptions,
  showTicketCategoryModal,
  askAnotherCategory,
  showCollectionModal,
};
