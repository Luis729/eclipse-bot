const messenger = require('../misc/messenger.js');

module.exports = {
  name: 'jay',
  type: 'misc',
  usage: '<respect | fear>',
  description: 'Something important for you to know',

  args: 1,

  execute: async function(message, param) {
    const arg = param.args[0];

    switch (arg) {
      case 'respect':
      case 'fear':
        return messenger.sendMessage(message, {
          title: `${arg.charAt(0).toUpperCase()}${arg.slice(1)} Jay`,
<<<<<<< HEAD
          description: arg === 'respect' ? '@everyone respect the dark knight of Go Canada!' : 'You are too weak to take it',
=======
          description: arg === 'respect' ? '@everyone respect the dark knight of Go Canada!' : 'You are too weak to take it.',
>>>>>>> glitch
        });

      default:
        return messenger.sendArgumentError(message, this, 'Jay does not approve of this argument');
    }
  },
<<<<<<< HEAD

  irritatePeril: async function(message, num) {
    if (num == 0) return;

    if (message.author.id != user.jay)
      return message.channel.send('You fear him so much... you **[cannot](https://cdn.discordapp.com/attachments/390086345957179393/408337364868530206/trigger.gif)** try it.');

    message.channel.send(`<@${user.peril}>`).catch(e => console.log(e));

    setTimeout(() => {
      return this.irritatePeril(message, num - 1);
    }, 1000);
  },
=======
>>>>>>> glitch
};