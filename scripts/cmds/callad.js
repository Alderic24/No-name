const { getStreamsFromAttachment, log } = global.utils;
const moment = require("moment-timezone");
const mediaTypes = ["photo", 'png', "animated_image", "video", "audio"];

module.exports = {
  config: {
    name: "callad",
    aliases: ["calladmin", "report"],
    version: "2.1-poetic",
    author: "Nthank (custom by Ꮠ ᎯᏞᎠᏋᎡᎥᏣ-シ︎︎)",
    countDown: 5,
    role: 0,
    shortDescription: {
      en: "Send a message to admin(s)"
    },
    longDescription: {
      en: "Report a problem or ask something directly to the admin(s)."
    },
    category: "utility",
    guide: {
      en: "{pn} your message"
    }
  },

  onStart: async function ({ args, message, event, usersData, threadsData, api, commandName }) {
    if (!args[0]) return message.reply("Please provide the message 📝 you want to send to the admin 📥");

    const { senderID, threadID, isGroup } = event;
    const adminIDs = global.GoatBot.config.adminBot || [];
    if (adminIDs.length == 0) return message.reply("Bot has no admin at the moment");

    const senderName = await usersData.getName(senderID);
    const threadName = isGroup ? (await threadsData.get(threadID)).threadName : null;
    const currentTime = moment().tz("Africa/Porto-Novo").format("HH:mm:ss");

    let attachments = [];
    try {
      attachments = await getStreamsFromAttachment([...event.attachments, ...(event.messageReply?.attachments || [])].filter(item => mediaTypes.includes(item.type)));
    } catch (err) {
      log.err("Attachment Error", err);
    }

    const bodyMessage =
      `==📨️ CALL ADMIN 📨️==\n` +
      `- User Name: ${senderName}\n` +
      `- User ID: ${senderID}\n` +
      (isGroup ? `- Sent from group: ${threadName}\n- Thread ID: ${threadID}` : "- Sent from user") +
      `\n- Time: ${currentTime} (GMT+1)\n\nContent:\n─────────────────\n${args.join(" ")}\n─────────────────\nReply this message to respond to user.`;

    const formMessage = {
      body: bodyMessage,
      mentions: [{ id: senderID, tag: senderName }],
      attachment: attachments
    };

    const success = [], fail = [];

    for (const adminID of adminIDs) {
      try {
        const sent = await api.sendMessage(formMessage, adminID);
        global.GoatBot.onReply.set(sent.messageID, {
          commandName,
          messageID: sent.messageID,
          threadID,
          messageIDSender: event.messageID,
          type: "userCallAdmin"
        });
        success.push(adminID);
      } catch (err) {
        fail.push({ adminID, error: err });
        log.err("Send Message Error to admin ID " + adminID, err);
      }
    }

    const replyMsg = `✅『Message Sent!』✉️\n\n╭───⊹⊱⋆｡˚🌸˚｡⋆⊰⊹───╮\n• 💌 Whispers carried your note to the admin...\n• 📇 Delivered to: ${success.length} admin(s)\n• ⏰ Time sent: ${currentTime} (GMT+1)\n• ✨ Await their gentle reply~\n╰───⊹⊱⋆｡˚🌸˚｡⋆⊰⊹───╯\nThank you for your trust and patience!`;

    return message.reply(replyMsg);
  },

  onReply: async ({ args, event, api, message, Reply, usersData, commandName }) => {
    const { type, threadID, messageIDSender } = Reply;
    const senderName = await usersData.getName(event.senderID);
    const currentTime = moment().tz("Africa/Porto-Novo").format("HH:mm:ss");

    const attachments = await getStreamsFromAttachment(event.attachments.filter(item => mediaTypes.includes(item.type)));

    const formMessage = {
      body:
        `✉️『Admin’s Reply』✅\n\n╭───⊹⊱⋆｡˚💬˚｡⋆⊰⊹───╮\n• 👤 Admin: ${senderName}\n• 🕒 Time: ${currentTime} (GMT+1)\n• ✉️ Message:\n💮${args.join(" ")}\n╰───⊹⊱⋆｡˚💬˚｡⋆⊰⊹───╯\n\n✨ You can reply to continue the talk!`,
      mentions: [{ id: event.senderID, tag: senderName }],
      attachment: attachments
    };

    api.sendMessage(formMessage, threadID, (err, info) => {
      if (err) return message.err(err);
      global.GoatBot.onReply.set(info.messageID, {
        commandName,
        messageID: info.messageID,
        messageIDSender: event.messageID,
        threadID: event.threadID,
        type: type === "userCallAdmin" ? "adminReply" : "userCallAdmin"
      });
    }, messageIDSender);
  }
};
