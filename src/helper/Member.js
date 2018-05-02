'use strict';

const Messenger = require('./Messenger.js');
const Util = require('./Util.js');

let working = false;
const DISCORD_COOLDDOWN = 3000;

function getRole(message, role) {
  if (role.id) return role;

  return message.guild.roles.find('name', role);
}

class Member {
  static findMemberByName(members, name) {
    return members.find(member => Util.match(name, member.displayName, true));
  }

  static getMembersByRole(message, role) {
    role = getRole(message, role);
    let members = role.members.array();
    members = Util.sort(members, true);

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

  static listMembersWithRole(message, role) {
    if (working) return;

    const members = Member.getMembersByRole(message, role);

    const players = [];
    for (const player of members) {
      players.push(`${player.displayName}${player.flair ? player.flair : ''}`);
    }

    Messenger.sendMessage(message, {
      title: `📝 List of members with role: ${getRole(message, role).name}`,
      color: 0xf5f513,
      description: players.length > 0 ? players : 'None',
    });
  }

  static async clearMembersOfRole(message, role) {
    const members = Member.getMembersByRole(message, role);
    const removed = await Member.removeRoleFromMembers(message, members, role).catch(console.error);

    Messenger.sendMessage(message, {
      title: `❎ Cleared all members from role: ${getRole(message, role).name}`,
      description: removed.length > 0 ? removed.join('\n') : 'None',
    });
  }

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
          adding.push(member.displayName);
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
          removing.push(member.displayName);
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
}

module.exports = Member;
