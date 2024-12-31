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
    version: "1.3",
    author: "Ꮠ ᎯᏞᎠᏋᎡᎥᏣ-シ︎︎",
    countDown: 10,
    role: 0,
    shortDescription: "Buy or check your VIP status!",
    longDescription:
      "Users can buy a VIP pass for 3 days or check their current VIP privileges.",
    category: "economy",
    guide: "{pn} to check VIP status or just {pn} to buy VIP for 1M spina.",
  },

  onStart: async function ({ args, message, usersData, event }) {
    const userID = event.senderID;

    if (args.length === 0) {
      // Check the user's current privileges
      const privileges = checkPrivileges(userID);
      if (privileges.length === 0) {
        return message.reply(
          "💔 Oops! No VIP privileges detected! 💔\n\n" +
          "🌟 Want to shine brighter than the rest? Get your *VIP Pass* now for **1,000,000 spina** and enjoy exclusive perks for the next **3 days**! 🎉\n" +
          "💰 Simply type `~vip` to unlock the ultimate experience! \n\n" +
          "✨ Don't miss out on the fun—become a VIP today! ✨"
        );
      }

      const vipStatus = privileges
        .map(
          (priv) =>
            `✨ *Privilege:* ${priv.name}\n📅 *Expires At:* ${new Date(
              priv.expiresAt
            ).toLocaleString()}`
        )
        .join("\n\n");

      return message.reply(
        `💎 *Your Active VIP Privileges:* 💎\n\n${vipStatus}`
      );
    }

    const price = 1000000; // Fixed price of 1,000,000 spina for the VIP pass

    const userData = await usersData.get(userID);
    if (userData.money < price) {
      return message.reply(
        "💸 | You don't have enough spina to buy the VIP pass!"
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
    expiresAt.setDate(expiresAt.getDate() + 3); // Fixed 3-day duration

    data[userID].privileges.push({
      name: "vip",
      expiresAt: expiresAt.toISOString(),
    });

    fs.writeFileSync(path, JSON.stringify(data, null, 2), "utf-8");

    message.reply(
      `✨💎 *VIP Pass Activated!* 💎✨\n\n🎟 You are now a VIP for the next **3 days**! 🎉\n💰 Remaining balance: **${userData.money} spina**\n\nEnjoy your special privileges! 🌟`
    );
  },
};
