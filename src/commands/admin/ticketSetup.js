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
    .setName('ticket-setup')
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
  const r3 = await showTicketCategorySelector(r2);
  const r4 = await showTicketCategoryButtonStyleOptions(r3);
  const r5 = await showTicketCategoryModal(r4);
  categories.push(r5.result);
  numberOfCategories++;
  const r6 = await askAnotherCategory(r5, numberOfCategories);
  if (r6.result === 'yes' && numberOfCategories < 5) {
    return await cmdFlow(r6.iNew, categories, numberOfCategories);
  } else if (r6.result === 'no' || numberOfCategories === 5) {
    const r7 = await showCollectionModal(r6, categories);
    return r7;
  }

  return { numberOfCategories, categories };
}