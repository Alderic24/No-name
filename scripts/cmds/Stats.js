const https = require('https');

module.exports = {
  config: {
    name: "stats",
    aliases: ["upt"],
    version: "1.5",
    author: "S",
    role: 2,
    shortDescription: {
      en: "Uptime"
    },
    longDescription: {
      en: "Shows uptime, speed and ping functionalities."
    },
    category: "system",
    guide: {
      en: "Use {p}stats to see uptime, speed test, and ping."
    }
  },
  onStart: async function ({ api, event, usersData, threadsData }) {
    try {
      // Uptime Calculation
      const uptime = process.uptime();
      const hours = Math.floor(uptime / 3600);
      const minutes = Math.floor((uptime % 3600) / 60);
      const seconds = Math.floor(uptime % 60);
      const uptimeString = `${hours}Hrs ${minutes}min ${seconds}sec`;

      // Speed Test (via Fast.com API alternative)
      const getSpeed = async () => {
        return new Promise((resolve, reject) => {
          const startTime = Date.now();
          https.get('https://speed.cloudflare.com/__down?bytes=10000000', (res) => {
            res.on('data', () => {}); // Consomme les données sans les sauvegarder
            res.on('end', () => {
              const endTime = Date.now();
              const duration = (endTime - startTime) / 1000; // Durée en secondes
              const speed = (10 / duration).toFixed(2); // Vitesse en Mbps
              resolve(speed);
            });
          }).on('error', (err) => {
            reject(err);
          });
        });
      };

      const speedResult = await getSpeed();

      // Ping
      const timeStart = Date.now();
      await api.sendMessage("Calcul des statistiques... 📊", event.threadID);
      const ping = Date.now() - timeStart;

      let pingStatus = "Not smooth throw your router, buddy!";
      if (ping < 400) {
        pingStatus = "Smooth like Ferrari!";
      }

      // Total Users and Threads
      const allUsers = await usersData.getAll();
      const allThreads = await threadsData.getAll();

      // Create combined message
      const combinedMessage =
        `⏰ 𝗨𝗽𝘁𝗶𝗺𝗲\n ⭔ ${uptimeString}\n\n` +
        `📶 𝗦𝗽𝗲𝗲𝗱\n ⭔ ${speedResult} MBPS\n\n` +
        `♻️ 𝗣𝗶𝗻𝗴\n ⭔ ${ping} MS\n\n` +
        `👥 𝗨𝘀𝗲𝗿𝘀\n ⭔ ${allUsers.length} users\n\n` +
        `🚀 𝗧𝗵𝗿𝗲𝗮𝗱𝘀\n ⭔ ${allThreads.length} threads\n\n` +
        `🧑‍💻 𝗣𝗶𝗻𝗴 𝗦𝘁𝗮𝘁𝘂𝘀 ~ ${pingStatus}`;

      api.sendMessage(combinedMessage, event.threadID);
    } catch (error) {
      console.error(error);
      api.sendMessage("An error occurred while retrieving data.", event.threadID);
    }
  }
};
