const Achievement = require('../helper/Achievement.js');
const { channel: channelConfig, clash, prefix } = require('../config/config.js');
const Check = require('../helper/Check.js');
const fs = require('fs');
const Messenger = require('../helper/Messenger.js');
const moment = require('moment-timezone');

const DONATION_ACHIEVEMENT = clash.achievementName.donations;
const LOAD_ERRORMSG = {
  message: 'Donation stats failed to load',
  submessage: 'Ping a developer as soon as possible',
};
const SAVE_ERRORMSG = {
  message: 'Donation stats failed to save',
  submessage: 'Check console for more details',
};

let defaultChannel;
let working = true;

// run automatic donation report
setTimeout(() => normallyPostDonations(defaultChannel), getTimeUntilSunday(moment()));

function getTimeUntilSunday(now) {
  const sunday = moment(now).day(7).startOf('day') // eslint-disable-line
  return sunday.diff(now);
}

function normallyPostDonations(channel) {
  if (working) return;

  const logMessage = { channel: channel.guild.channels.get(channelConfig.development) };
  postDonations(logMessage, true, defaultChannel);
  setTimeout(() => normallyPostDonations(channel), getTimeUntilSunday(moment()));
}

async function postDonations(message, save, channel) {
  working = true;

  const fileData = Achievement.loadFileData(message, DONATION_ACHIEVEMENT, { error: LOAD_ERRORMSG });
  const accountData = await Achievement.loadAPIData(message, DONATION_ACHIEVEMENT);

  if (!fileData || !accountData) {
    working = false;
    return;
  }

  // will post to logMessage channel if saving (overriding or it is Sunday midnight)
  // otherwise will post to message channel
  const logMessage = { channel: channel };
  const netDonations = getNetDonations(fileData, accountData);
  postNetDonations(save ? logMessage : message, netDonations, save);

  if (save) await saveAPIDonations(message);
  working = false;
}

async function updateDonations(message, overwrite) {
  working = true;

  const saveInfo = {
    success: {
      title: `🚩 Donation Stats ${overwrite ? 'Overwrited' : 'Updated'}`,
      description: `Run \`${prefix}donate update\` again when a new player joins`,
    },
    error: SAVE_ERRORMSG,
  };

  if (overwrite) {
    await saveAPIDonations(message, saveInfo);
    working = false;
    return;
  }

  const fileData = Achievement.loadFileData(message, DONATION_ACHIEVEMENT, { error: LOAD_ERRORMSG });
  const accountData = await Achievement.loadAPIData(message, DONATION_ACHIEVEMENT);

  if (!fileData || !accountData) {
    working = false;
    return;
  }

  // add new players to file
  for (const data of accountData) {
    if (!fileData.some(d => d.id === data.id)) {
      fileData.push(data);
    }
  }

  Achievement.saveData(message, DONATION_ACHIEVEMENT, fileData, saveInfo);
  working = false;
}

async function handleOverwriteRequest(message) {
  if (!Check.isLeadership(message.member)) {
    Messenger.sendPermissionError(message);
    return;
  }

  working = true;

  const confirm = await Messenger.confirm(message, {
    content: `this command will override local data. Are you sure you want to run \`${prefix}${(new Command).name} ${message.args[0]} -overwrite\`?`,
    yes: '👍 Overwriting current data...',
    no: '👍 Updating data with no overwrite...',
  });

  updateDonations(message, confirm);
}

function getNetDonations(fileData, accountData) {
  const netDonations = [];
  for (const data of fileData) {
    const net = accountData.find(s => s.tag === data.tag);
    if (!net) continue;

    net.value -= data.value;
    netDonations.push(net);
  }

  return netDonations.sort((a, b) => {
    const aName = a.name.toLowerCase();
    const bName = b.name.toLowerCase();
    return a.value < b.value ? 1 :
      a.value > b.value ? -1 :
        aName > bName ? 1 :
          aName < bName ? -1 : 0;
  });
}

function postNetDonations(message, netDonations, save) {
  for (const donation of netDonations) donation.value = `${donation.value} troops`;

  Messenger.sendRankings(message, {
    title: '🔖 Donation Report',
    color: 0xdac31d,
    footer: save ? `Pulled on ${moment().format('MMM D, YYYY [at] h:mm A z')}` : null,
    request: !save,
    requestTime: !save,
  }, netDonations);
}

async function saveAPIDonations(message, info) {
  // do not turn on/off working status, this command is called from other commands
  // that are run by that status already
  const accountData = await Achievement.loadAPIData(message, DONATION_ACHIEVEMENT);
  Achievement.saveData(message, DONATION_ACHIEVEMENT, accountData, info);
}

async function initialize(channel) {
  if (channel) {
    defaultChannel = channel;
    const donationFilePath = Achievement.getAchievementFilePath(DONATION_ACHIEVEMENT);
    const logMessage = { channel: channel.guild.channels.get(channelConfig.development) };
    if (!fs.existsSync(donationFilePath)) {
      await saveAPIDonations(logMessage);
    }
    // prevents members from calling this command until defaultChannel is initialized
    working = false;
  }
}

class Command {
  constructor(channel) {
    initialize(channel);

    this.name = 'donate';

    this.description = 'Track donations of everyone in clan';
    this.type = 'essentials';
    this.usage = '[update [-o | -overwrite]]';
  }

  execute(message) {
    if (working) {
      console.log('nope');
      return;
    }

    switch (message.args[0]) {
      case 'update': {
        if (message.options.includes('o') || message.options.includes('overwrite')) {
          handleOverwriteRequest(message);
          break;
        }

        updateDonations(message, false);
        break;
      }
      default: postDonations(message, false); break;
    }
  }
}

module.exports = Command;