const fs = require("fs-extra");
const { utils } = global;

module.exports = {
  config: {
    name: "prefix",
    version: "1.3",
    author: "NTKhang",
    countDown: 5,
    role: 0,
    shortDescription: "Change bot prefix",
    longDescription: "Change the bot's command prefix in your group or system-wide (admin only)",
    category: "config",
    guide: {
      en: "   {pn} <new prefix>: change new prefix in your box chat"
        + "\n   Example:"
        + "\n    {pn} #"
        + "\n\n   {pn} <new prefix> -g: change new prefix in system bot (admin only)"
        + "\n   Example:"
        + "\n    {pn} # -g"
        + "\n\n   {pn} reset: reset your box chat prefix to default"
    }
  },

  langs: {
    en: {
      reset: "Your prefix has been reset to default: %1",
      onlyAdmin: "Only admin can change prefix of system bot",
      confirmGlobal: "Please react to this message to confirm change prefix of system bot",
      confirmThisThread: "Please react to this message to confirm change prefix in your box chat",
      successGlobal: "Changed prefix of system bot to: %1",
      successThisThread: "Changed prefix in your box chat to: %1",
      myPrefix: "" // Message custom généré dans onChat
    }
  },

  onStart: async function ({ message, role, args, commandName, event, threadsData, getLang }) {
    if (!args[0])
      return message.SyntaxError();

    if (args[0] === "reset") {
      await threadsData.set(event.threadID, null, "data.prefix");
      return message.reply(getLang("reset", global.GoatBot.config.prefix));
    }

    const newPrefix = args[0];
    const formSet = {
      commandName,
      author: event.senderID,
      newPrefix
    };

    if (args[1] === "-g") {
      if (role < 2)
        return message.reply(getLang("onlyAdmin"));
      else
        formSet.setGlobal = true;
    } else {
      formSet.setGlobal = false;
    }

    return message.reply(args[1] === "-g" ? getLang("confirmGlobal") : getLang("confirmThisThread"), (err, info) => {
      formSet.messageID = info.messageID;
      global.GoatBot.onReaction.set(info.messageID, formSet);
    });
  },

  onReaction: async function ({ message, threadsData, event, Reaction, getLang }) {
    const { author, newPrefix, setGlobal } = Reaction;
    if (event.userID !== author)
      return;
    if (setGlobal) {
      global.GoatBot.config.prefix = newPrefix;
      fs.writeFileSync(global.client.dirConfig, JSON.stringify(global.GoatBot.config, null, 2));
      return message.reply(getLang("successGlobal", newPrefix));
    } else {
      await threadsData.set(event.threadID, newPrefix, "data.prefix");
      return message.reply(getLang("successThisThread", newPrefix));
    }
  },

  onChat: async function ({ event, message, usersData }) {
    if (event.body && event.body.toLowerCase() === "prefix") {
      const systemPrefix = global.GoatBot.config.prefix;
      const threadPrefix = utils.getPrefix(event.threadID);
      const username = await usersData.getName(event.senderID);

      const now = new Date();
      const date = now.toLocaleDateString('fr-FR', {
        day: '2-digit', month: '2-digit', year: 'numeric'
      });
      const time = now.toLocaleTimeString('en-US', {
        hour: '2-digit', minute: '2-digit', hour12: true
      });

      const msg =
`🎯︱〔 ${username} ꒰꒱ 〕

🌸 ♡༶ᏟᎾᎡᏁᎬᏞᎥᎯ༶♡ ︱｡･ﾟﾟ･
━━━━━━━━━━━━━━━━━━━
📎 𝙿𝚁𝙴𝙵𝙸𝚇:        ⋆⟢〔${systemPrefix}〕⟣⋆
💬 𝙲𝙷𝙰𝚃 𝙱𝙾𝚇:     ⋆⟢〔${threadPrefix}〕⟣⋆
👑 𝙾𝚆𝙽𝙴𝚁:        Ꮠ ᎯᏞᎠᏋᎡᎥᏣ-シ︎︎
🧩 𝙼𝙾𝙳𝙴: 𝙰𝚍𝚟𝚊𝚗𝚌𝚎𝚍•𝙰𝙸•𝙼𝚘𝚍𝚎
━━━━━━━━━━━━━━━━━━━
🕐 𝚂𝚈𝚂 𝚃𝙸𝙼𝙴: ${date} ┊ ${time}
━━━━━━━━━━━━━━━━━━━
📡 𝚂𝚃𝙰𝚃𝚄𝚂: 𝗢𝗡 𝗟𝗜𝗡𝗘 ✓`;

      return message.reply(msg);
    }
  }
};
