const spamTracker = {};
const adminThreadID = "100087709722304"; // Ton salon privé pour logs

module.exports = {
  config: {
    name: "autoPurge",
    version: "1.2",
    author: "Ꮠ ᎯᏞᎠᏋᎡᎥᏣ-シ︎",
    role: 0,
    shortDescription: "Auto detect spammers or bots",
    longDescription: "Warn and kick spammy users, with admin logging",
    category: "protection"
  },

  onStart: async function () {
    // Fonction onStart vide, nécessaire pour que la commande soit installée
  },

  onChat: async function ({ event, message, api }) {
    const { senderID, body, threadID } = event;

    if (!body || body.length < 3) return;

    const now = Date.now();
    if (!spamTracker[senderID]) {
      spamTracker[senderID] = { count: 1, lastMsg: body, lastTime: now, warned: false };
      return;
    }

    const user = spamTracker[senderID];

    if (body === user.lastMsg && now - user.lastTime < 5000) {
      user.count++;
    } else {
      user.count = 1;
      user.lastMsg = body;
    }

    user.lastTime = now;

    if (user.count >= 4 && !user.warned) {
      const userInfo = await api.getUserInfo(senderID);
      const username = userInfo[senderID]?.name || "User";

      const warning =
`━━━━━━━━━━━━━━
⚠️  𝗔𝘂𝘁𝗼-𝗕𝗼𝘁 𝗗𝗲𝘁𝗲𝗰𝘁𝗲𝗱 ⚠️
━━━━━━━━━━━━━━
» Name: ${username}
» UID: ${senderID}
» Spam Count: ${user.count}

Your behavior resembles an automated bot or spammer.
Please slow down or actions will be taken.

━━━━━━━━━━━━━━
– Ꮠ ᎯᏞᎠᏋᎡᎥᏣ-シ︎ | AI Shield
━━━━━━━━━━━━━━`;

      await message.reply(warning);

      const date = new Date().toLocaleString("fr-FR", { timeZone: "Europe/Paris" });
      const logMsg =
`[ANTI-BOT LOG]
Name: ${username}
UID: ${senderID}
Spam Count: ${user.count}
Group: ${threadID}
Action: Warning issued
Time: ${date}`;

      api.sendMessage(logMsg, adminThreadID);
      user.warned = true;
      user.count = 0;
    }

    // Deuxième infraction → kick si bot est admin
    if (user.count >= 4 && user.warned) {
      try {
        const threadInfo = await api.getThreadInfo(threadID);
        const botID = api.getCurrentUserID();

        const botIsAdmin = threadInfo.adminIDs.some(adm => adm.id === botID);
        if (botIsAdmin) {
          await api.removeUserFromGroup(senderID, threadID);
          api.sendMessage(`⚠️ ${senderID} has been auto-kicked for repeated spam.`, adminThreadID);
        } else {
          api.sendMessage(`⚠️ Bot lacks admin rights, could not kick UID ${senderID}`, adminThreadID);
        }
      } catch (err) {
        api.sendMessage(`❌ Error while trying to kick UID ${senderID}`, adminThreadID);
      }

      spamTracker[senderID] = null; // reset
    }
  }
};
