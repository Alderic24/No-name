module.exports = {
 config: {
  name: "top",
  version: "1.5",
  author: "Ꮠ ᎯᏞᎠᏋᎡᎥᏣ-シ︎︎",
  role: 0,
  shortDescription: {
   en: "Top 20 Rich Users",
  },
  longDescription: {
   en: "Stylish ranking for the top 20 rich users without showing those with 0 spina.",
  },
  category: "group",
  guide: {
   en: "{pn}",
  },
 },
 onStart: async function ({ api, args, message, event, usersData }) {
  const allUsers = await usersData.getAll();

  // Filtrer les utilisateurs avec une fortune > 0
  const filteredUsers = allUsers.filter((user) => user.money > 0);

  // Trier les utilisateurs et limiter à 20
  const topUsers = filteredUsers.sort((a, b) => b.money - a.money).slice(0, 20);

  // Segments
  const titans = topUsers.slice(0, 5);
  const risingStars = topUsers.slice(5, 13);
  const flops = topUsers.slice(13, 20);

  const formatTitans = (users) =>
   users
    .map(
     (user, index) =>
      `🌟 *#${index + 1}* - ${user.name.toUpperCase()} 🎉\n💎 Fortune : *${user.money} spina*\n`
    )
    .join("\n");

  const formatOthers = (users, startIndex) =>
   users
    .map(
     (user, index) =>
      `✨ ${startIndex + index + 1}. ${user.name} - ${user.money}💰`
    )
    .join("\n");

  const formatFlops = (users, startIndex) =>
   users
    .map(
     (user, index) =>
      `🤡 ${startIndex + index + 1}. ${user.name} - ${user.money}💸`
    )
    .join("\n");

  const messageText = `🏆 *【𝐂𝐥𝐚𝐬𝐬𝐞𝐦𝐞𝐧𝐭 𝐝𝐞𝐬 𝟐𝟎 𝐩𝐥𝐮𝐬 𝐑𝐢𝐜𝐡𝐞𝐬】* 🏆\n\n` +
   `👑 *【𝐋𝐄𝐒 𝐓𝐈𝐓𝐀𝐍𝐒 - 𝐓𝐨𝐩 𝟓】*\n${formatTitans(titans)}\n` +
   `🌟 *【𝐋𝐄𝐒 𝐄𝐓𝐎𝐈𝐋𝐄𝐒 𝐌𝐎𝐍𝐓𝐀𝐍𝐓𝐄𝐒】*\n${formatOthers(risingStars, 5)}\n\n` +
   `🤡 *【𝐋𝐄𝐒 𝐅𝐋𝐎𝐏𝐒】*\n${formatFlops(flops, 13)}`;

  message.reply(messageText);
 }
};
