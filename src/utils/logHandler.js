const chalk = require('chalk');
const config = require('../../config/config.json');
const { createEmbed } = require('./embedBuilder');

function initialize(client) {
  const defaultConsoleLog = console.log;
  const defaultConsoleError = console.error;
  const logChannel = client.channels.cache.get(config.log_channel);

  let messageQueue = [];
  let isSending = false;
  const delay = 4000; // To not get ratelimited

  function processQueue() {
    if (messageQueue.length === 0) {
      isSending = false;
      return;
    }

    isSending = true;
    const { description, color } = messageQueue.shift();

    if (logChannel) {
      const embed = createEmbed({ description, color });
      logChannel
        .send({ embeds: [embed] })
        .catch(console.error)
        .finally(() => {
          setTimeout(processQueue, delay);
        });
    } else {
      setTimeout(processQueue, delay);
    }
  }

  function sendEmbed(description, color) {
    messageQueue.push({ description, color });

    if (!isSending) {
      processQueue();
    }
  }

  console.log = function (...args) {
    defaultConsoleLog(config.bot_name, ...args);
    sendEmbed(args.join(' '), config.bot_color);
  };

  console.error = function (...args) {
    defaultConsoleError(config.bot_name, ...args);
    sendEmbed(args.join(' '), '#FF5733');
  };

  console.debug = function (...args) {
    defaultConsoleLog(config.bot_name, ...args);
    sendEmbed(args.join(' '), '#FFAE42');
  };

  console.task = function (...args) {
    defaultConsoleLog(chalk.yellow(config.bot_name, '[TASK]', ...args));
    sendEmbed(args.join(' '), '#FFAE42');
  };

  console.warn = function (...args) {
    defaultConsoleLog(chalk.yellow(config.bot_name, ...args));
    sendEmbed(args.join(' '), '#FFAE42');
  };
  return { sendEmbed };
}

module.exports = { initialize };
