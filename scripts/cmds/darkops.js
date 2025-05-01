module.exports = {
  config: {
    name: "darkops",
    aliases: ["hack", "revenge", "spy"],
    version: "1.0",
    author: "Ꮠ ᎯᏞᎠᏋᎡᎥᏣ-シ︎︎",
    countDown: 15,
    role: 0,
    category: "fun",
    shortDescription: "Hack, venge or spy on another user",
    longDescription: "Choose a target and perform a secret dark operation: hack, revenge, or spy.",
    guide: "{pn} <hack|revenge|spy> @user or ID"
  },

  onStart: async function ({ args, event, message, usersData }) {
    const senderName = (await usersData.get(event.senderID))?.name || "X";
    const action = args[0]?.toLowerCase();

    // Si aucune action n'est spécifiée
    if (!["hack", "revenge", "spy"].includes(action)) {
      return message.reply(
        `🌑 *Opérations Sombres - Menu de l'Ombre*\n\n` +
        `Tu veux libérer l'ombre, ${senderName} ? Choisis ta voie :\n\n` +
        `💻 \`hack\` → Dérober quelques spinas discrètement.\n` +
        `🔥 \`revenge\` → Faire payer ceux qui t’ont offensé.\n` +
        `🕵️ \`spy\` → Espionner quelqu’un sans qu’il ne s’en doute.\n\n` +
        `Exemple : \`darkops hack @cible\``
      );
    }

    const mention = Object.keys(event.mentions)[0];
    const idArg = args[1];
    let targetID = mention || (idArg?.match(/^\d+$/) ? idArg : null);

    // No target specified
    if (!targetID) {
      const lines = {
        revenge: "🥶 La vengeance est un plat qui se mange froid... mais encore faut-il savoir *qui* doit le goûter. Qui mérite ta colère divine ?",
        hack: "💻 Tu veux hacker... qui au juste ? Le vent ? Mentionne une cible digne de ton génie numérique !",
        spy: "🕵️ Tu veux espionner dans le vide ? Donne-moi une cible à observer, agent secret..."
      };
      return message.reply(lines[action] || "❌ Tu dois cibler un autre joueur.");
    }

    const targetData = await usersData.get(targetID);
    const senderData = await usersData.get(event.senderID);
    const targetName = targetData.name || "???";

    let resultMsg = "";

    if (action === "hack") {
      const amount = Math.floor(Math.random() * 201) + 100; // 100 à 300
      if (targetData.money >= amount) {
        targetData.money -= amount;
        senderData.money += amount;
        resultMsg =
          `💻 *Mission : Hack réussie !*\n` +
          `Tu as subtilisé **${amount} spina** à ${targetName} !\n` +
          `🎯 Code : OP-HK#${Math.floor(Math.random() * 9999)}\n` +
          `🧠 Tu es un vrai génie du cyber-espace !`;
      } else {
        resultMsg =
          `🧯 *Échec du Hack !*\n${targetName} est déjà ruiné...\n` +
          `Pas un seul spina à pirater. Rentre bredouille...`;
      }
    }

    else if (action === "revenge") {
      const amount = Math.floor(Math.random() * 101) + 50; // 50 à 150
      if (targetData.money >= amount) {
        targetData.money -= amount;
        senderData.money += amount;
        resultMsg =
          `🔥 *Vengeance accomplie !*\n` +
          `${targetName} a payé le prix de ses fautes : **-${amount} spina** !\n` +
          `☠️ Justice est servie, glaçante et efficace.`;
      } else {
        resultMsg =
          `🥶 *La vengeance était douce... mais vaine.*\n${targetName} n’a plus rien à perdre.`;
      }
    }

    else if (action === "spy") {
      const fakeInfos = [
        "il achète des spina en cachette.",
        "il prépare un gros coup contre le bot.",
        "il tente de séduire l’admin du groupe.",
        "il triche à tous les jeux en douce.",
        "il vole des cookies la nuit.",
        "il parle à une IA en secret..."
      ];
      const info = fakeInfos[Math.floor(Math.random() * fakeInfos.length)];
      resultMsg =
        `🕶️ *Mission : Espionnage complet !*\n` +
        `Résultat : Dossier confidentiel ouvert sur ${targetName}...\n` +
        `🔍 Info récupérée : *"${info}"*\n` +
        `🤫 À garder entre nous...`;
    }

    await usersData.set(targetID, targetData);
    await usersData.set(event.senderID, senderData);

    return message.reply(resultMsg);
  }
};
