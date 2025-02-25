const { SlashCommandBuilder, MessageFlags } = require('discord.js');

const {
  showRoleSelector,
  showTicketResponseModal,
  showTicketCategorySelector,
  showTicketCategoryButtonStyleOptions,
  showTicketCategoryModal,
  askAnotherCategory,
  showCollectionModal,
} = require('../../tickets/setup');

const { embedPrompt } = require('../../utils/embeds/prompt');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setup')
    .setDescription('Create a Ticket System'),

  async execute(interaction) {
    let numberOfCategories = 0;
    let categories = []; // Object Ids to be saved to the database

    try {
      const response = await cmdFlow(interaction, categories, numberOfCategories);
      await response.iNew.reply({
        embeds: [embedPrompt('Ticket System setup complete!', '#5eff5e')],
        flags: MessageFlags.Ephemeral,
      });
    } catch (err) {
      console.error('Possible Ticket System setup error:', err);
      await interaction.followUp({
        content: 'An error occurred while setting up the Ticket System.',
        flags: MessageFlags.Ephemeral,
      });
    }
  }, // end of execute
};

async function cmdFlow(i, categories, numberOfCategories) {
  const r1 = await showRoleSelector(i);
  const r2 = await showTicketResponseModal(r1);
  const r3 = await showTicketCategorySelector(r2, 'Select a category to create a ticket in.');
  const r4 = await showTicketCategorySelector(r3, 'Select a category for closed tickets to go.');
  const category = r3.category;
  const categoryClose = r4.category;
  const obj = { category, categoryClose, ticketResponseId: r4.ticketResponseId, iNew: r4.iNew };
  const r5 = await showTicketCategoryButtonStyleOptions(obj);
  const r6 = await showTicketCategoryModal(r5);
  categories.push(r6.result);
  numberOfCategories++;
  const r7 = await askAnotherCategory(r6, numberOfCategories);
  if (r7.result === 'yes' && numberOfCategories < 5) {
    return await cmdFlow(r7.iNew, categories, numberOfCategories);
  } else if (r7.result === 'no' || numberOfCategories === 5) {
    const r8 = await showCollectionModal(r7, categories);
    return r8; 
  }

  return { numberOfCategories, categories };
} 