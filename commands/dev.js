const fs = require('fs');

const playerManager = require('../helper/playerManager.js');

const emoji = require('../misc/emoji.js');

module.exports = {
  name: 'dev',
  type: 'developer',

  execute: async function(message, param) {
    const { args } = param;

    if (!args) return message.channel.send('Needs argument');

    switch (args[0]) {
      case 'countdown': return this.countdown(message, 10, 10);
      case 'reset': return this.resetRanking(message);
      case 'load': return this.load(message);
      case 'save': return this.save(message);
      case 'set':
        if (args.length < 3 || !message.mentions || isNaN(args[2]) || (args[3] && isNaN(args[3])))
          return message.channel.send('Wrong usage');

        return this.setPlayer(message, parseInt(args[2]), parseInt(args[3]), args[4]);
        
      case 'loadmee': return this.loadFromMee6(message);
      default: return message.channel.send('Wrong argument');
    }
  },

  countdown: async function(message, num, start) {
    if (num === start) await message.delete().catch(e => console.error(e));
    if (num === 0) return;

    await message.channel.send(num).then(msg => msg.delete(1000).catch(e => console.error(e)))
      .catch(e => console.error(e));

    this.countdown(message, num - 1);
  },

  load: async function(message) {
    const players = JSON.parse(fs.readFileSync('./data/players.json', 'utf8'));

    for (const { id, exp, ranking, flair } of players) {
      playerManager.setPlayer(message, { id: id }, {
        exp: exp,
        ranking: ranking,
        flair: flair,
      });
    }

    return message.channel.send('Player backup loaded.');
  },

  save: async function(message) {
    const { client, guild, channel } = message;
    const { points }  = client;
    const players = [];

    for (const { user } of guild.members.array()) {
      if (points.get(user.id)) {
        const { exp, ranking, flair } = points.get(user.id);

        players.push({
          id: user.id,
          exp: exp,
          ranking: ranking,
          flair: flair,
        });
      }
    }

    return fs.writeFile('./data/players-backup.json', JSON.stringify(players), e => {
      if (e) console.error(e);
      channel.send('Points backup saved.');
    });
  },

  setPlayer: async function(message, EXP, RANKING, FLAIR) {
    const player = message.mentions.users.first();
    const { points } = message.client;

    const em = emoji.getEmoji(FLAIR, message.client);

    playerManager.setPlayer(message, player, {
      exp: EXP,
      ranking: RANKING,
      flair: em,
    });

    const { exp, level, ranking, flair } = points.get(player.id);

    return message.channel.send(`Set <@${player.id}>'s exp to ${exp}, level ${level}, ${ranking} ER ${flair ? flair : ''}`);
  },

  loadFromMee6: async function(message) {
    function parseArray(msg, num, array) {
      if (num === array.length)
        return message.channel.send(`Done. Array size is ${array.length}`);

      const { user } = array[num];

      if (user.bot) {
        parseArray(message, num + 1, array);
        return;
      }

      message.channel.send(`!rank <@${user.id}>`);

      setTimeout(() => {
        parseArray(message, num + 1, array);
      }, 4000);
    }

    parseArray(message, 0, message.guild.members.array());
  },
};
