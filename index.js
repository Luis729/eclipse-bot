const Discord = require('discord.js');
const client = new Discord.Client();
const outdent = require('outdent');

const { prefix, token } = require('./config.json');
const { leadershipRoles, clanRules, rcsPassword } = require('./parameters.json');

client.on('ready', () => {
    console.log('Connected.');
    client.user.setActivity('your suggestions', { type: 'LISTENING' });
});

/* When a user types a command */
client.on('message', message => {
   // ignores all non-command messages and bot messages
   if (!message.content.startsWith(prefix) || message.author.bot)
      return;

   const args = message.content.slice(prefix.length).split(/ +/);
   const command = args.shift().toLowerCase();

   switch (command) {
      case 'identify': identify(message, args); break;
      case 'help': message.channel.send('Help command WIP.'); break;
      default: message.channel.send('Command not recognized. Type ``+help`` for full list of commands.'); break;
   }
});

/* When a new user joins the server */
client.on('guildMemberAdd', member => {
   member.guild.channels.get('422983940060479501').send(outdent({ 'trimLeadingNewline': true })`
      Welcome ${member.user} to ${member.guild.name}'s Discord server!
      **Please set your nickname to match your in game name.**

      1. If you’re looking to apply, please make sure you’ve read the clan rules. Clan rules can be found here: ${clanRules}. You’ll also need the RCS password to apply which can be found here: ${rcsPassword}.

      2. Apply in-game and tag **@Leadership** to get your server roles.`
   );
});

/* When a user leaves the server */
client.on('guildMemberRemove', member => {
   member.guild.channels.get('422983940060479501').send(`Whoops! ${member.user} stared directly at the Eclipse...`);
});

client.login(token);

/* Command functions */

/*
 * Makes an user to identify him/herself on WarMatch
 * By rule, user nickname on discord should be the same as his/her COC IGN
 *
 * $ +identify @PERIL
 * $ @PERIL, register your account in WarMatch by going to #wmbot and typing !wm identfiy PERIL
 * $
 * $ +identify @PERIL UV2J9YRV
 * $ @PERIL, register your account in WarMatch by going to #wmbot and typing !wm identify UV2J9YRV
 *
 * @param message    message to evaluate
 * @param args       arguments in message
 */
function identify(message, args) {
   if (!requireLeadershipRole(message) || !requireTagUsers(message))
      return;

   const taggedUser = client.channels.get(message.channel.id).members.get(message.mentions.users.first().id);
   if (!requireHumanUser(message, taggedUser))
      return;

   if (args.length === 1)
      message.channel.send(`${taggedUser.user}, register your account in WarMatch by going to <#275563260386869248> and typing -> \`\`!wm identify ${taggedUser.nickname}\`\``);
   else
      message.channel.send(`${taggedUser.user}, register your account in WarMatch by going to <#275563260386869248> and typing -> \`\`!wm identify ${args[1]}\`\``);

   message.delete();
}

/* Helper methods, for verification/validation */

/*
 * Makes sure that user that sent the message has a leadership roles
 *
 * @param message    message to evaluate
 * @return true if the user is has a leadership role, false otherwise
 */
function requireLeadershipRole(message) {
   if (!message.member.roles.some(role => leadershipRoles.includes(role.name))) {
      message.channel.send('You do not have permission to use this command.');
      return false;
   }
   return true;
}

/*
 * Makes sure that the user that sent the message tags other requireTagUsers
 *
 * @param message    message to evaluate
 * @param num        number of users to tag
 * @return true if user tagged enough users, false otherwise
 */
function requireTagUsers(message, num) {
   if (!num) num = 1;
   if (message.mentions.users.size < num) {
      message.channel.send(`You need to tag ${num > 1 ? `${num}  users` : 'a user'} for this command.`);
      return false;
   }
   return true;
}

/*
 */
function requireHumanUser(message, taggedUser) {
   if (taggedUser.bot) {
      message.channel.send('You cannot tag a bot for this command.');
      return false;
   }
   return true;
}
