const messenger = require('../helper/messenger.js');
const playerManager = require('../helper/playerManager.js');

const emoji = require('../misc/emoji.js');

module.exports = {
  name: 'flair',
  type: 'developer',
  usage: '<emoji>',
  description: 'Set your own custom flair! Use any emojis from this server or a default Discord emoji!',

  args: 1,

  execute: function(message, param) {
    const name = param.args[0];
    const flair = emoji.getEmoji(name);

    if (!flair)
      return messenger.sendArgumentError(message, this, 'There is no such emoji');

    playerManager.updateFlair(message, flair);

    return messenger.sendMessage(message, {
      title: '🎉 Flair Updated',
      color: 0x3ea92e,
      description: `You are now ${message.member.displayName} ${flair}`,
    });
  },
};
