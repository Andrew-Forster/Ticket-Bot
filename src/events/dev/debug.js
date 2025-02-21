const { Events } = require('discord.js');

module.exports = {
  name: Events.Debug,
  once: false,
  execute(info) {
    //console.debug(info);
  },
};
