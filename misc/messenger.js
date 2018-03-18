const outdent = require('outdent');
const Discord = require('discord.js');

const { rules, password, channels } = require('./parameters.js');
const { prefix } = require('../.data/config.js');
module.exports = {
  sendCommandList: async function(message, commands) {
    const embed =  new Discord.RichEmbed()
      .setAuthor('Eclipse Bot Help')
      .setDescription('**<mandatory argument> [optional argument]**\n\u200b')
      .setColor(0xe7a237)
      .setFooter(`Requested by ${message.member.displayName} at ${message.createdAt.toUTCString()}`);
    
    for (const commandCategory of commands) {
      if (commandCategory.type === 'leadership' && message.channel.parentID !== process.env.leadershipID)
        continue; // skips the iteration
      
      let header = [];
      switch (commandCategory.type) {
        case 'essentials': header = ['⭐ Essentials', '*Important commands*']; break;
        case 'leadership': header = ['🛑 Leadership', '*Must have the roles to use*']; break;
        case 'misc'      : header = ['😂 Miscellaneous', '*Random stuff for our members*']; break;
      }
      
      embed.addField(header[0], header[1])
      for (const command of commandCategory.commandList)
        embed.addField(`${prefix}${command.name}${command.usage ? ` ${command.usage}` : ' '}`, command == commandCategory.commandList[commandCategory.commandList.length - 1] ? command.description + '\n\u200b' : command.description); // + '\n\u200b'
    }
    
    return message.channel.send(embed);
  },
  
  sendImage: async function(message, info) {
    const { description, url } = info;
    if (!url) return;
        
    return message.channel.send(description ? description : '', { files: Array.isArray(url) ? url : [ url ] });
  },
  
  sendWelcomeMessage: async function(member) {
    return member.guild.channels.get(channels.welcome).send(outdent({ 'trimLeadingNewline': true })`
      Welcome ${member.user} to ${member.guild.name}'s Discord server!
      **Please set your nickname to match your in game name.**

      1. If you’re looking to apply, please make sure you’ve read the clan rules. Clan rules can be found here: ${rules}. You’ll also need the RCS password to apply which can be found here: ${password}.

      2. Apply in-game and tag **@Leadership** to get your server roles.
    `);
  },
  
  sendLeaveMessage: async function(member) {
    return member.guild.channels.get(channels.welcome).send(`**${member.displayName}** stared directly at the Eclipse...`);
  },

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
    if (!info)
      return console.log('sendMessage failed');
    
    return this.send(message, {
      title: info.title ? info.title : '',
      avatar: info.avatar ? info.avatar : '',
      color: info.color ? info.color : 0x3498db,
      description: info.description ? info.description : '',
      footer: info.request ? `Requested by ${message.member.displayName}` : '',
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
      message: 'You do not have permissions to use this command',
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
  
  sendError: async function(message, error) {
    if (!error || !error.message || !error.submessage)
      return console.log('sendError failed');
    
    return this.send(message, {
      title: error.title ? error.title : '❌ Error',
      color: error.color ? error.color : 0xff0000,
      message: error.message,
      submessage: `${error.submessage}.`,
    });
  },
  
  send: function(message, info) {
    if (!info)
      return 'send failed';
    
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
