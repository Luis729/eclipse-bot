const { user } = require('../data/config.js');

const messenger = require('../helper/messenger.js');

module.exports = {
  name: 'proto',
  type: 'misc',
  usage: '<quote | summon [number] | reference>',
  description: 'Fun commands, Prototype style',

  args: 1,

  execute: async function(message, param) {
    const { args } = param;
    
    switch (args[0]) {
      case 'quote':     return message.channel.send('`He can\'t code shit`');
      case 'summon':    return this.summonPeril(message, !isNaN(args[1]) ? parseInt(args[1]) : 1 );
      case 'reference': return this.referencePeril(message);
      default:          return messenger.sendArgumentError(message, this, 'This argument does not exist');
    }
  },

  summonPeril: async function(message, num) {
    if (num <= 0) return;

    if (message.author.id != user.prototype)
      return message.channel.send('Nah you can\'t do this fam.');

    message.channel.send(`<@${user.peril}>`).catch(e => console.log(e));

    setTimeout(() => {
      return this.summonPeril(message, num - 1);
    }, 1000);
  },

  referencePeril: async function(message) {
    const peril = message.guild.members.get(user.peril);

    if (peril)
      return messenger.send(message, {
        title: peril.displayName,
        avatar: peril.user.avatarURL,
        description: 'Proto can\'t code shit',
        footer: 'Today at 1:12 PM',
        color: 0xcccccc,
      });

    return message.channel.send('```PERIL - Today at 1:12 PM\nProto can\'t code shit```');
  },
};
