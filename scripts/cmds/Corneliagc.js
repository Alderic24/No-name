module.exports = {
  config: {
    name: "corneliagc",
    aliases: ["Cornelia","corngc"],
    version: "1.0",
    author: "Jesan | fixed by mero",
    countDown: 10,
    role: 0,
    shortDescription: {
      en: "Adds user to admin support group."
    },
    longDescription: {
      en: "This command adds the user to the bot admin support group."
    },
    category: "⚘𝐂𝐨𝐫𝐧𝐞𝐥𝐢𝐚",
    guide: {
      en: "{pn} :to add yourself to the admin support group"
    }
  },

  onStart: async function ({ api, args, message, event }) {
    const supportGroupId = "6449429501820415"; // ID of the support group

    const threadID = event.threadID;
    const userID = event.senderID;

    // Check if the user is already in the support group
    try {
      const threadInfo = await api.getThreadInfo(supportGroupId);
      const participantIDs = threadInfo.participantIDs;
      if (participantIDs.includes(userID)) {
        // User is already in the support group
        api.sendMessage(
          "✅ | Tu as déjà été ajouté au groupe de mon admin.Vérifie dans ta boîte d'invitation par msg ou vérifie tes spams au cas où tu ne retrouverais pas le groupe.",
          threadID
        );
      } else {
        // Add user to the support group
        api.addUserToGroup(userID, supportGroupId, (err) => {
          if (err) {
            console.error("❎ | Failed to add user to support group:", err);
            api.sendMessage(
              "❎ | Désolé, j'arrive pas à t'ajouter au groupe. Utiliser la cmd ~callad pour contacter mon admin",
              threadID
            );
          } else {
            api.sendMessage(
              "✅ | Tu viens d'être ajouté au groupe de mon admin .Si tu ne trouves pas le groupe, vérifie tes invitation par msg ou regarde dans ta boîte de spam. Amuse-toi bien!",
              threadID
            );
          }
        });
      }
    } catch (e) {
      console.error("Failed to get thread info:", e);
      api.sendMessage(
        "❎ | Impossible de récupérer les informations ℹ️ sur sur le groupe, L'ID du groupe à peut-être été modifié",
        threadID
      );
    }
  }
};
