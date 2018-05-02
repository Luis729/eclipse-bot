'use strict';

const Messenger = require('../helper/Messenger.js');

let done = true;

class Command {
  constructor() {
    this.name = 'poison';

    this.description = 'Can you properly kill the clan castle troops?';
    this.type = 'misc';
  }

  async execute(message) {
    if (!done) return;

    done = false;
    await Messenger.sendImage(message, { url: 'https://i.imgur.com/RG0lRA1.png' }).catch(console.error);
    await Messenger.sendImage(message, { url: 'https://i.imgur.com/7hJSaQK.png' }, 3000).catch(console.error);
    await Messenger.sendImage(message, { url: 'https://i.imgur.com/sDIsfhj.png' }, 4000).catch(console.error);
    await Messenger.sendImage(message, { url: 'https://i.imgur.com/zi1QV9r.png' }, 2000).catch(console.error);
    done = true;
  }
}

module.exports = new Command();