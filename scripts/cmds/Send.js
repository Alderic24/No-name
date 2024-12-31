module.exports = {
  config: {
    name: "send",
    aliases: ["transfer", "sendmoney"],
    version: "1.0",
    author: "Ꮠ ᎯᏞᎠᏋᎡᎥᏣ-シ︎︎",
    countDown: 10,
    role: 0,
    shortDescription: "Transfer spina to another player",
    longDescription: "Transfer your spina to another player by mentioning them or entering their user ID.",
    category: "economy",
    guide: "{pn} <@tag|userID> <amount of spina>\nUsage Example: ~send @JohnDoe 100",
  },

  onStart: async function ({ args, message, usersData, event }) {
    if (args.length < 2) {
      return message.reply("❌ | *Please specify a valid target and amount of spina.* 💖");
    }

    const target = args[0];
    const transferAmount = parseInt(args[1]);
    const user = event.senderID;
    const userData = await usersData.get(user);

    // Validation de la cible et du montant
    if (!target || !transferAmount || !Number.isInteger(transferAmount) || transferAmount <= 0) {
      return message.reply("❌ | *Please specify a valid amount and a target player.* 💖");
    }

    // Vérification de l'argent disponible
    if (transferAmount > userData.money) {
      return message.reply("💸 | *You don't have enough spina to complete this transfer.* 💔");
    }

    // Identifier la cible
    let targetID;
    let targetName = target;  // Au cas où on reçoit un ID direct

    if (target.startsWith("<@") && target.endsWith(">")) {
      // Extraction de l'ID à partir de la mention
      targetID = target.slice(2, -1);
      targetName = event.mentions[targetID]?.replace("@", "") || targetID; // Si mention
    } else {
      targetID = target;
      const targetData = await usersData.get(targetID);
      if (targetData) {
        targetName = targetData.username || targetID;  // Récupère le nom du joueur si disponible
      }
    }

    // Vérification si l'utilisateur cible existe
    const targetData = await usersData.get(targetID);
    if (!targetData) {
      return message.reply("❌ | *The specified player does not exist or is not registered.* 💔");
    }

    // Transfert des spina
    userData.money -= transferAmount;
    targetData.money += transferAmount;

    // Mise à jour des données des deux joueurs
    await usersData.set(user, userData);
    await usersData.set(targetID, targetData);

    // Message de confirmation avec des éléments kawaï
    message.reply(
      `💫✨ *Spina Transfer Successful!* ✨💫\n\n🌸 You successfully sent **${transferAmount}** spina to **${targetName}** 🎀💖\n\n🤑 *Your new balance:* **${userData.money}** spina 🐾\n\n🌟 May the spina bring joy to both of you! 🌸`
    );
  },
};
