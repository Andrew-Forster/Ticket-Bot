const dotenv = require('dotenv');
dotenv.config();
const DB = require('./db/database');

const db = new DB();

const {
  Client,
  Collection,
  ActivityType,
  GatewayIntentBits,
  Events,
} = require('discord.js');

let config;
try {
  config = require('./config/config.json');
} catch {
  console.error(
    `Missing config file!\nExiting!`,
  );
  return;
}

const commandHandler = require('./src/utils/commandHandler');
const eventHandler = require('./src/utils/eventHandler');
const componentHandler = require('./src/utils/componentHandler');
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages, // Needed for reading messages in channels
    GatewayIntentBits.MessageContent, // Required if you need to read message content
    GatewayIntentBits.GuildMembers, // Needed if you're adding/removing users from tickets
    GatewayIntentBits.GuildMessageReactions, // If reactions are used for interactions
    GatewayIntentBits.GuildVoiceStates, // If managing voice tickets
  ],
});
const logHandler = require('./src/utils/logHandler');

client.commands = new Collection();
client.cooldowns = new Collection();

client.once(Events.ClientReady, async () => {
  console.log(`Logged in as ${client.user.displayName}`);
  const { sendEmbed } = logHandler.initialize(client);

  sendEmbed(`Logged in as ${client.user.displayName}`, '#61ff58');

  client.user.setPresence({
    activities: [
      {
        name: `Ticket Bot`,
        type: ActivityType.Custom,
      },
    ],
    status: 'online',
  });

  db.startDB();

  await commandHandler.loadCommands(client).catch(console.error);
  await eventHandler.loadEvents(client).catch(console.error);
  await componentHandler.loadComponents(client).catch(console.error);

});

client.on(Events.InteractionCreate, async (interaction) => {
  if (interaction.isCommand()) {
    await commandHandler
      .synchronizeCommands(interaction, client)
      .catch(console.error);
  } else {
    // await componentHandler
    //   .synchronizeComponent(interaction, client)
    //   .catch(console.error);
  }
});

module.exports = client;
module.exports = { db };
client.login(process.env.BOT_TOKEN).catch(console.error);
