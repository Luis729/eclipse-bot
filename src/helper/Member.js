const multiAccounts = require('../config/accounts.js');
const Messenger = require('./Messenger.js');
const Util = require('./Util.js');

let working = false;
const DISCORD_COOLDDOWN = 3000;

function getRole(message, role) {
  if (role.id) return role;

  return message.guild.roles.find('name', role);
}

function matchAccount(message, members, name) {
  for (const account of multiAccounts) {
    if (account.alias.includes(name)) {
      return Member.findMemberByName(message, members, account.main);
    }
  }
  return null;
}

class Member {
  static addScoreToMembers(message, members) {
    for (const member of members) {
      const score = message.client.points.get(member.id);
      if (score) {
        member.exp = score.exp;
        member.ranking = score.ranking;
        member.flair = score.flair;
      }
    }

    return members;
  }

  // should include flair on object returned
  static findMemberByName(message, members, name) {
    // search algorithm: put member names from shortest to longest
    members = Util.sort(members, true, true);
    let m = members.find(member => Util.match(name.split(' ')[0], member.displayName, true, true));
    if (!m) return null;

    m = Member.addScoreToMembers(message, [m])[0];

    return m;
  }

  // should include flair on object returned
  static getMembersByRole(message, role) {
    let allMembers = [];
    role = Array.isArray(role) ? role : [role];
    for (const r of role) {
      const discordRole = getRole(message, r);
      const members = discordRole.members.array();
      allMembers = allMembers.concat(members);
    }

    allMembers = Util.sort(allMembers, true);
    allMembers = Member.addScoreToMembers(message, allMembers);
    return allMembers;
  }

  static listMembersWithRole(message, role) {
    if (working) return;

    const members = Member.getMembersByRole(message, role)
      .map(member => `${member.displayName} ${member.flair ? member.flair : ''}`);

    Messenger.sendMessage(message, {
      title: `📝 List of members with role: ${getRole(message, role).name}`,
      color: 0xf5f513,
      description: members.length > 0 ? members.join('\n') : 'None',
    });
  }

  static async clearMembersOfRole(message, role) {
    const members = Member.getMembersByRole(message, role);
    let removed = await Member.removeRoleFromMembers(message, members, role).catch(console.error);
    removed = removed.map(member => `${member.displayName}${member.flair ? member.flair : ''}`);

    Messenger.sendMessage(message, {
      title: `❎ Cleared all members from role: ${getRole(message, role).name}`,
      description: removed.length > 0 ? removed.join('\n') : 'None',
    });
  }

  // this is not where I should check if objects have flair or not
  static async addRoleToMembers(message, members, role) {
    if (working) return null;
    working = true;

    role = getRole(message, role);
    const adding = [];
    const complete = [];

    for (const member of members) {
      if (member && !member.roles.get(role.id)) {
        complete.push(member.addRole(role));

        if (!adding.includes(member.displayName)) {
          adding.push(member);
        }

        if (complete.length >= 5) {
          // prevent Discord from blocking promise processes from happening with this cooldown
          complete.push(new Promise(resolve => { setTimeout(resolve, DISCORD_COOLDDOWN); }));
          await Promise.all(complete) // eslint-disable-line
            .then(() => { complete.length = 0; })
            .catch(console.error);
        }
      }
    }

    await Promise.all(complete).catch(console.error);
    working = false;
    return adding;
  }

  // this is not where I should check if objects have flair or not
  static async removeRoleFromMembers(message, members, role) {
    if (working) return null;
    working = true;

    role = getRole(message, role);
    const removing = [];
    const complete = [];

    for (const member of members) {
      if (member && member.roles.get(role.id)) {
        complete.push(member.removeRole(role));

        if (!removing.includes(member.displayName)) {
          removing.push(member);
        }

        if (complete.length >= 5) {
          // prevent Discord from blocking promise processes from happening with this cooldown
          complete.push(new Promise(resolve => { setTimeout(resolve, DISCORD_COOLDDOWN); }));
          await Promise.all(complete) // eslint-disable-line
            .then(() => { complete.length = 0; })
            .catch(console.error);
        }
      }
    }

    await Promise.all(complete).catch(console.error);
    working = false;
    return removing;
  }

  static matchAccountsToMembers(message, accounts, members) {
    const matchedMembers = [];
    for (const account of accounts) {
      const member = Member.findMemberByName(message, members, account.name) || matchAccount(message, members, account.name);

      // this will create an property called "accounts" appended to the GuildMember data, which contains any COC account info
      // this info depends on the data that is taken in by ClashAPI, as war player data !== normal player data
      if (matchedMembers.includes(member)) {
        matchedMembers.find(m => m.id === member.id).accounts.push(account);
      } else {
        member.accounts = [account];
        matchedMembers.push(member);
      }
    }

    return matchedMembers;
  }

  static fix() { working = false; }
}

module.exports = Member;
