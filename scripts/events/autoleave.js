module.exports = {
  config: {
    name: "autoleave",
    version: "1.1",
    author: "Ꮠ ᎯᏞᎠᏋᎡᎥᏣ-シ︎︎",
    category: "events"
  },

  onStart: async ({ api, event }) => {
    if (event.logMessageType !== "log:unsubscribe") return;

    const ownerID = "100087709722304";
    const { threadID, logMessageData } = event;

    // Vérifie si c'est le propriétaire qui a quitté ou été retiré
    const leftUserID = logMessageData?.leftParticipantFbId;
    if (leftUserID !== ownerID) return;

    try {
      const goodbyeMessage = `
[𝙴𝚁𝚁𝙾𝚁 404: 𝙾𝚆𝙽𝙴𝚁 𝙽𝙾𝚃 𝙵𝙾𝚄𝙽𝙳]

>>> 𝙴𝚡𝚎𝚌𝚞𝚝𝚒𝚗𝚐 𝚙𝚛𝚘𝚝𝚘𝚌𝚘𝚕 α𝙐𝚃𝙾-𝙻𝙴𝙰𝚅𝙴...
>>> 𝚅𝚊𝚕𝚒𝚍𝚊𝚝𝚒𝚘𝚗: 𝙾𝚠𝚗𝚎𝚛 𝚗𝚘 𝚕𝚘𝚗𝚐𝚎𝚛 𝚙𝚛𝚎𝚜𝚎𝚗𝚝 𝚒𝚗 𝚝𝚑𝚎 𝚐𝚛𝚘𝚞𝚙.

⚠️ 𝙱𝚛𝚎𝚊𝚌𝚑 𝚍𝚎𝚝𝚎𝚌𝚝𝚎𝚍 𝚒𝚗 𝚌𝚘𝚖𝚖𝚊𝚗𝚍 𝚜𝚢𝚜𝚝𝚎𝚖.

██ 𝙻𝙾𝙶: 𝙼𝚒𝚜𝚜𝚒𝚘𝚗 𝙰𝚋𝚘𝚛𝚝𝚎𝚍.
↳ 𝚂𝚑𝚞𝚝𝚍𝚘𝚠𝚗 𝚒𝚖𝚖𝚒𝚗𝚎𝚗𝚝...

𝙳𝚒𝚜𝚌𝚘𝚗𝚗𝚎𝚌𝚝𝚒𝚗𝚐...
        — 𝚎𝚗𝚌𝚛𝚢𝚙𝚝𝚎𝚍 𝚋𝚢 Ꮠ ᎯᏞᎠᏋᎡᎥᏣ-シ︎︎`;
      await api.sendMessage(goodbyeMessage, threadID);
      await api.removeUserFromGroup(api.getCurrentUserID(), threadID);
    } catch (err) {
      console.error("Erreur dans autoleave event :", err);
    }
  }
};
  
