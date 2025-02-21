const path = require('path');
const fs = require('fs');

function loadMessages() {
  const messagesPath = path.resolve(__dirname, '../../config/messages.json');
  const rawData = fs.readFileSync(messagesPath, 'utf8');
  return JSON.parse(rawData);
}

const messages = loadMessages();

function getCdMessages() {
  const cooldownMessages = messages.cooldownMessages;
  return getRandomMessage(cooldownMessages);
}

function getRandomMessage(messages) {
  const randomIndex = Math.floor(Math.random() * messages.length);
  return messages[randomIndex];
}

function getDenyMessages() {
  const denyMessages = messages.denyMessages;
  return getRandomMessage(denyMessages);
}

function getMention() {
  const mentionMessages = messages.mentionMessages;
  return getRandomMessage(mentionMessages);
}

module.exports = {
  getCdMessages,
  getDenyMessages,
  getMention,
};
