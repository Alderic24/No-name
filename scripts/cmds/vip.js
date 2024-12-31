const fs = require("fs");
const path = "./privileges.json";

function checkPrivileges(userID) {
  if (!fs.existsSync(path)) return [];
  const data = JSON.parse(fs.readFileSync(path, "utf-8"));
  const now = new Date();

  if (!data[userID]) return [];
  data[userID].privileges = data[userID].privileges.filter(
    (p) => new Date(p.expiresAt) > now
  );

  fs.writeFileSync(path, JSON.stringify(data, null, 2), "utf-8");
  return data[userID].privileges;
}

module.exports = {
  config: {
    name: "vip",
    aliases: ["vipstatus"],
    version: "1.0",
    author: "Ꮠ ᎯᏞᎠᏋᎡᎥᏣ-シ︎︎",
    countDown: 10,
    role: 0,
    shortDescription: "Buy VIP status for special privileges!",
    longDescription:
      "Users can buy VIP status, which grants special benefits like reduced cooldowns, higher chances of winning games, and more.",
    category: "economy",
    guide: "{pn} <duration_in_days> <price>",
  },

  onStart: async function ({ args, message, usersData, event }) {
    const duration = parseInt(args[0]);
    const price = parseInt(args[1]);
    const userID = event.senderID;

    if (!duration || duration <= 0) {
      return message.reply("❌ | Please specify a valid duration in days.");
    }

    if (!price || price <= 0) {
      return message.reply("❌ | Please specify a valid price in spina.");
    }

    const userData = await usersData.get(userID);
    if (userData.money < price) {
      return message.reply(
        "💸 | You don't have enough spina to buy VIP status!"
      );
    }

    // Deduct spina from user
    userData.money -= price;
    await usersData.set(userID, userData);

    // Add VIP status to the privileges file
    let data = {};
    if (fs.existsSync(path)) {
      data = JSON.parse(fs.readFileSync(path, "utf-8"));
    }

    if (!data[userID]) {
      data[userID] = { privileges: [] };
    }

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + duration);

    data[userID].privileges.push({
      name: "vip",
      expiresAt: expiresAt.toISOString(),
    });

    fs.writeFileSync(path, JSON.stringify(data, null, 2), "utf-8");

    message.reply(
      `✨💎 *VIP Status Activated!* 💎✨\n\n🎟 You are now a VIP for **${duration} days**! 🎉\n💰 Remaining balance: **${userData.money} spina**\n\nEnjoy your special privileges! 🌟`
    );
  },
};
