const outdent = require('outdent');
const Discord = require('discord.js');

const { rules, password, channelCategory, channel, group, prefix } = require('../data/config.js');

module.exports = {
  sendCommandList: async function(message, commands) {
    const options = { weekday: 'short', year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric', timeZone: 'UTC', timeZoneName: 'short' };

    const embed =  new Discord.RichEmbed()
      .setAuthor('Eclipse Bot Help')
      .setDescription('**<mandatory argument> [optional argument]**\n\u200b')
      .setColor(0xe7a237)
      .setFooter(`Requested by ${message.member.displayName} on ${message.createdAt.toLocaleString('en-US', options)}`);

    for (const commandCategory of commands) {
      if (commandCategory.type === 'leadership' && message.channel.parentID !== channelCategory.leadership)
        continue;

      let header = [];
      switch (commandCategory.type) {
        case 'essentials': header = ['⭐ Essentials', '*Important commands*']; break;
        case 'leadership': header = ['🛑 Leadership', '*Must have the roles to use*']; break;
        case 'misc'      : header = ['😂 Miscellaneous', '*Random stuff for our members*']; break;
      }

      embed.addField(header[0], header[1]);
      for (const command of commandCategory.commandList)
        embed.addField(`${prefix}${command.name}${command.usage ? ` ${command.usage}` : ' '}`, command == commandCategory.commandList[commandCategory.commandList.length - 1] ? command.description + '\n\u200b' : command.description);
    }

    return message.channel.send(embed);
  },

  sendImage: async function(message, info) {
    const { description, url } = info;

    return message.channel.send(description ? description : '', { files: Array.isArray(url) ? url : [ url ] });
  },

  /* update color */
  sendWelcomeMessage: async function(member) {
    const message = { channel: member.guild.channels.get(channel.test) };

    return this.sendMessage(message, {
      description: outdent({ 'trimLeadingNewline': true })`
        Welcome ${member.user} to the **${member.guild.name}** Discord server!

        1. If you want to apply, make sure to read the [clan rules](${rules}), and fill out the form in the end. Apply in-game with the [RCS password](${password}).

        2. Tag <@&${group.leadership}> to get your roles.
      `,
      color: 0x21c32a,
    });
  },

  /* update color */
  sendLeaveMessage: async function(member) {
    const message = { channel: member.guild.channels.get(channel.test) };

    return this.sendMessage(message, {
      description: `**${member.displayName}** has left the server`,
      color: 0xff0000,
    });
  },

  /* update color */
  sendKickMessage: async function(message, member, reason) {
    return this.sendMessage(message, {
      title: '📛 Kicked Member',
      description: outdent({ 'trimLeadingNewline': true })`
        **${member.displayName}** is kicked by ${message.member.displayName}

        ${reason ? `Reason: ${reason}` : ''}
      `,
      color: 0xff0000,
    });
  },

  sendMessage: async function(message, info) {
    return this.send(message, {
      title: info.title ? info.title : '',
      avatar: info.avatar ? info.avatar : '',
      color: info.color ? info.color : 0x3498db,
      description: info.description ? info.description : '',
      footer: info.request ? `Requested by ${message.member.displayName}` : '',
    });
  },

  sendCommandDoesNotExistError: async function(message) {
    return this.sendError(message, {
      color: 0xf06c00,
      message: 'This command does not exist',
      submessage: 'Type `+help` for full list of commands',
    });
  },

  sendArgumentError: async function(message, command, warning) {
    return this.sendError(message, {
      title: '❌ Argument Error',
      color: 0xf06c00,
      message: warning,
      submessage: `Proper usage is ${prefix}${command.name}${command.usage ? ` ${command.usage}` : ' '}`,
    });
  },

  sendPermissionError: async function(message) {
    return this.sendError(message, {
      title: '🚫 Permission Denied',
      message: ' You do not have permissions to use this command',
      submessage: 'Talk to @Leadership if you think this is a mistake',
    });
  },

  sendBotTagError: async function(message, bot) {
    return this.sendError(message, {
      title: '🤖 Error',
      color: 0xf06c00,
      message: `${bot.displayName} is a bot`,
      submessage: 'You cannot use this command on a bot',
    });
  },

  sendDeveloperError: async function(message) {
    return this.sendError(message, {
      message: 'Something went wrong',
      submessage: 'Please let development team know',
    });
  },

  sendError: async function(message, error) {
    return this.send(message, {
      title: error.title ? error.title : '❌ Error',
      color: error.color ? error.color : 0xff0000,
      message: error.message,
      submessage: `${error.submessage}.`,
    });
  },

  send: function(message, info) {
    const embed = new Discord.RichEmbed()
      .setAuthor(info.title ? info.title : '', info.avatar ? info.avatar : '')
      .setDescription(info.description ? info.description : '')
      .setColor(info.color ? info.color : 0xcccccc)
      .setFooter(info.footer ? info.footer : '');

    if (info.message && info.submessage)
      embed.addField(info.message ? info.message : '', info.submessage ? info.submessage : '');

    return message.channel.send(embed);
  },
};