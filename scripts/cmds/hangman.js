const axios = require('axios');
const fs = require('fs');

const SCORE_FILE = __dirname + "/hangman_scores.json";
if (!fs.existsSync(SCORE_FILE)) fs.writeFileSync(SCORE_FILE, JSON.stringify({}));

module.exports = {
  config: {
    name: "pendu",
    aliases: ["hangman"],
    version: "2.0",
    author: "Ꮠ ᎯᏞᎠᏋᎡᎥᏣ-シ︎︎",
    countDown: 5,
    role: 0,
    shortDescription: "Jeu du pendu stylisé",
    longDescription: "Jeu du pendu avec choix de langue, astuce et sauvegarde de score",
    category: "games",
    guide: "{pn} FR|EN [easy|medium|hard] | {pn} stop | {pn} stats"
  },

  onStart: async function ({ message, event, args }) {
    const userID = event.senderID;
    const gameStates = global.gameStates || (global.gameStates = {});

    if (args[0]?.toLowerCase() === "stop") {
      if (gameStates[userID]) {
        delete gameStates[userID];
        return message.reply("⛔ Jeu du pendu arrêté.");
      } else return message.reply("⚠️ Aucun jeu en cours à arrêter.");
    }

    if (args[0]?.toLowerCase() === "stats") {
      const scores = JSON.parse(fs.readFileSync(SCORE_FILE, "utf8"));
      const userStats = scores[userID] || { wins: 0, fails: 0 };
      return message.reply(`📊 Stats du joueur:\n✔️ Victoires: ${userStats.wins}\n❌ Défaites: ${userStats.fails}`);
    }

    if (gameStates[userID]) return message.reply("⚠️ Tu as déjà une session de pendu active !");

    const lang = args[0]?.toLowerCase();
    if (!lang || !["fr", "en"].includes(lang)) {
      return message.reply(
        `🎮 𝙃𝙖𝙣𝙜𝙢𝙖𝙣 – Bienvenue dans le jeu du pendu !\n\n` +
        `📌 Choix de la langue : Tape "FR" 🇫🇷 ou "EN" 🇬🇧\n` +
        `🎯 Difficulté : easy, medium, hard (influence le nombre de vies)\n` +
        `📊 Statistiques : Tape "~hangman stats" pour voir tes victoires/défaites\n` +
        `⛔ Tape "~hangman stop" à tout moment pour quitter la partie\n\n` +
        `⏳ En attente de la langue et de la difficulté... (ex: ~hangman fr easy)`
      );
    }

    if (!["easy", "medium", "hard"].includes(args[1]?.toLowerCase())) {
      return message.reply(
        `⚠️ ${lang.toUpperCase()} détecté.\nVeuillez préciser la difficulté après la langue : easy, medium ou hard\n` +
        `Exemple : ~hangman ${lang} easy`
      );
    }

    const difficulty = args[1].toLowerCase();
    const livesByDifficulty = { easy: 8, medium: 6, hard: 4 };
    let word = "";

    if (lang === "fr") {
      const mots = JSON.parse(fs.readFileSync(__dirname + "/mots_fr.json", "utf8")).mots;
      let wordList = mots;
      if (difficulty === "easy") wordList = mots.filter(w => w.length <= 6);
      else if (difficulty === "medium") wordList = mots.filter(w => w.length > 6 && w.length <= 8);
      else if (difficulty === "hard") wordList = mots.filter(w => w.length > 8);
      if (wordList.length === 0) return message.reply("❌ Aucun mot trouvé pour ce niveau.");
      word = wordList[Math.floor(Math.random() * wordList.length)].toLowerCase();
    } else if (lang === "en") {
      try {
        const res = await axios.get("https://wordsapiv1.p.rapidapi.com/words/?random=true", {
          headers: {
            'x-rapidapi-key': '4c95a5e48dmsh1c371b85c254385p1f27d2jsn8f80d924db39',
            'x-rapidapi-host': 'wordsapiv1.p.rapidapi.com'
          }
        });
        word = res.data.word?.toLowerCase();
        if (!word) throw new Error("No word found");
      } catch (e) {
        return message.reply("❌ Erreur lors du chargement du mot anglais.");
      }
    }

    const lives = livesByDifficulty[difficulty];
    const progress = Array(word.length).fill("_");
    const guessed = [];

    const revealedLetters = [];
    while (revealedLetters.length < 2) {
      const index = Math.floor(Math.random() * word.length);
      const letter = word[index];
      if (!revealedLetters.includes(letter)) {
        revealedLetters.push(letter);
        for (let i = 0; i < word.length; i++) {
          if (word[i] === letter) progress[i] = letter;
        }
      }
    }

    gameStates[userID] = { word, progress, guessed, lives, lang, hintUsed: false };

    return message.reply(
      `🧠 Nouveau jeu de pendu – ${lang.toUpperCase()} / Mode: ${difficulty}\n\n` +
      `🔤 Mot: ${progress.join(" ")} (${word.length} lettres) ❤️ Vies: ${"🟥".repeat(lives)}\n💡 Taper une lettre ou "hint" pour une astuce.`
    );
  },

  onChat: async function ({ event, message }) {
    const userID = event.senderID;
    const input = event.body?.toLowerCase();
    const game = global.gameStates?.[userID];
    if (!game) return;

    const scores = JSON.parse(fs.readFileSync(SCORE_FILE, "utf8"));
    scores[userID] = scores[userID] || { wins: 0, fails: 0 };

    if (input === "stop") {
      delete global.gameStates[userID];
      return message.reply("🛑 Jeu annulé.");
    }

    if (input === "hint") {
      if (game.hintUsed) return message.reply("⚠️ Astuce déjà utilisée.");
      game.hintUsed = true;
      const unrevealed = game.word.split('').filter((c, i) => game.progress[i] === "_");
      const letter = unrevealed[Math.floor(Math.random() * unrevealed.length)];
      for (let i = 0; i < game.word.length; i++) if (game.word[i] === letter) game.progress[i] = letter;
      game.guessed.push(letter);
      return message.reply(`💡 Astuce utilisée ! Lettre révélée: ${letter}\n${game.progress.join(" ")}`);
    }

    if (!/^[a-zàâçéèêëîïôûùüÿñæœ]{1}$/i.test(input)) return;
    if (game.guessed.includes(input)) return message.reply("❌ Lettre déjà devinée !");

    game.guessed.push(input);
    if (game.word.includes(input)) {
      for (let i = 0; i < game.word.length; i++) if (game.word[i] === input) game.progress[i] = input;
    } else game.lives--;

    const hearts = "🟥".repeat(game.lives);

    if (!game.progress.includes("_")) {
      scores[userID].wins++;
      fs.writeFileSync(SCORE_FILE, JSON.stringify(scores, null, 2));
      delete global.gameStates[userID];
      return message.reply(`🎉 Bravo ! Tu as deviné : ${game.word.toUpperCase()}\n❤️ Vies restantes: ${game.lives}`);
    }

    if (game.lives <= 0) {
      scores[userID].fails++;
      fs.writeFileSync(SCORE_FILE, JSON.stringify(scores, null, 2));
      delete global.gameStates[userID];
      return message.reply(`☠️ Perdu ! Le mot était : ${game.word.toUpperCase()}`);
    }

    return message.reply(`🔤 Mot: ${game.progress.join(" ")}\n❤️ Vies: ${hearts}\n🔁 Lettres utilisées: ${game.guessed.join(", ")}`);
  }
};
