module.exports = {
  config: {
    name: "balance",
    aliases: ["bal"],
    version: "1.2",
    author: "NTKhang",
    countDown: 5,
    role: 0,
    description: {
      en: "View your money or the money of the tagged person",
    },
    category: "economy",
    guide: {
      en: "   {pn}: view your money\n   {pn} <@tag>: view the money of the tagged person"
    }
  },

  langs: {
    en: {
      money: "💰 **Your Balance** 💰\n\n🔑 **Wallet Information** 🔑\n\n✨ You have **%1** spina in your wallet 🏦💳\n\n*Use this wisely, and don't forget to spend some! 😏*",
      moneyOf: "💸 **%1's Balance** 💸\n\n🔑 **Wallet Information** 🔑\n\n✨ **%1** has **%2** spina in their wallet 💳💸\n\n*Don't let that wallet get too heavy! 💼*"
    }
  },

  onStart: async function ({ message, usersData, event, getLang }) {
    const lang = getLang;

    // If there are mentions
    if (Object.keys(event.mentions).length > 0) {
      const uids = Object.keys(event.mentions);
      let msg = "💳 **Account Balances of Mentioned Users** 💳\n";
      for (const uid of uids) {
        const userMoney = await usersData.get(uid, "money");
        const userName = event.mentions[uid].replace("@", "");
        msg += `✨ **${userName}** has **${userMoney}** spina 💸💳\n`;
      }
      return message.reply(msg);
    }

    // For the user's own balance
    const userData = await usersData.get(event.senderID);
    message.reply(getLang("money", userData.money));
  }
};
