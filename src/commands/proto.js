const Messenger = require('../helper/Messenger.js');
const { user } = require('../config/config.js');

let working = false;

function summon(message, num) {
  if (num <= 0) {
    working = false;
    return;
  }

  working = true;
  message.channel.send(`<@${user.peril}>: Can I code \`****\` bro? <:think:426636057082331136>`).catch((e) => Messenger.sendDeveloperError(message, e));

  setTimeout(() => summon(message, num - 1), 2000);
}

function reference(message) {
  const peril = message.guild.members.get(user.peril);

  if (peril) {
    Messenger.send(message, {
      title: peril.displayName,
      avatar: peril.user.avatarURL,
      description: 'Proto can\'t code `****`',
      footer: 'Today at 1:12 PM',
      color: 0xcccccc,
    });
  } else {
    message.channel.send('```PERIL - Today at 1:12 PM\nProto can\'t code ****```').catch((e) => Messenger.sendDeveloperError(message, e));
  }
}

class Command {
  constructor() {
    this.name = 'proto';

    this.args = 1;
    this.description = 'Fun commands, Prototype style';
    this.type = 'misc';
    this.usage = '<quote | summon [number] | reference>';
  }

  execute(message) {
    switch (message.args[0]) {
      case 'quote': message.channel.send('`He can\'t code ****`').catch((e) => Messenger.sendDeveloperError(message, e)); break;
      case 'summon': {
        if (working) return;

        if (message.author.id !== user.prototype) {
          message.channel.send('Nah you can\'t do this fam.').catch((e) => Messenger.sendDeveloperError(message, e));
          return;
        }

        let num = Number.parseInt(message.args[1], 10);
        if (num === undefined || num < 1) {
          num = 1;
        } else if (num > 10) {
          num = 10;
        }
        summon(message, num);
        break;
      }
      case 'reference': reference(message); break;
      default: Messenger.sendArgumentError(message, this); break;
    }
  }

  fix() { working = false; }
}

module.exports = Command;
