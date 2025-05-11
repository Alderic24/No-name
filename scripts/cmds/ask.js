const axios = require('axios');

const UPoLPrefix = ['corni', 'ai', 'cornelia', 'bot', 'ask'];

function toMonospace(text) {
  const offsetUpper = 0x1D670 - 65;
  const offsetLower = 0x1D68A - 97;

  return [...text].map(char => {
    const code = char.charCodeAt(0);
    if (code >= 65 && code <= 90) {
      return String.fromCodePoint(code + offsetUpper);
    } else if (code >= 97 && code <= 122) {
      return String.fromCodePoint(code + offsetLower);
    } else {
      return char;
    }
  }).join('');
}

function detectLanguage(text) {
  const englishKeywords = ["the", "is", "are", "how", "what", "when", "where", "why"];
  const textLower = text.toLowerCase();
  const matchCount = englishKeywords.filter(word => textLower.includes(word)).length;

  return matchCount > 2 ? 'en' : 'fr';
}

function getCurrentDate() {
  const today = new Date();
  const date = today.toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' });
  const year = today.getFullYear();
  return { date, year };
}

module.exports = {
  config: {
    name: 'ask',
    version: '1.2.6',
    role: 0,
    category: 'AI',
    author: 'Metoushela custom by Ꮠ ᎯᏞᎠᏋᎡᎥᏣ-シ︎︎',
    shortDescription: 'Pose une question à Cornelia-chan 💮',
    longDescription: 'Cornelia-chan répond à toutes tes questions de façon super kawaï 💕',
  },

  onStart: async function () {},

  onChat: async function ({ message, event, args, api }) {
    const ahprefix = UPoLPrefix.find(p => event.body?.toLowerCase().startsWith(p));
    if (!ahprefix) return;

    const userPrompt = event.body.slice(ahprefix.length).trim();

    if (!userPrompt) {
      const userInfo = await api.getUserInfo(event.senderID);
      const username = userInfo[event.senderID]?.name || "user";
      const styledName = toMonospace(username);

      return message.reply(
        `⤷ ૮₍｡• ᵕ •｡₎ა  ꒰⋆｡ᵕ ꈊ ᵕ｡꒱ \n` +
        `    𝙷𝚒𝚒 ${styledName}~! 𝙸'𝚖 𝙲𝚘𝚛𝚗𝚎𝚕𝚒𝚊-𝚌𝚑𝚊𝚗 💮!! 𝙰𝚜𝚔 𝚖𝚎 𝚊𝚗𝚢𝚝𝚑𝚒𝚗𝚐 𝚗𝚢𝚊~ ✏️\n` +
        `˚₊· ͟͟͞͞➳❥ 𝑾𝒊𝒕𝒉 𝒍𝒐𝒗𝒆, 𝑪𝒐𝒓𝒏𝒆𝒍𝒊𝒂\n` +
        `━━━━━✿━━━━━`
      );
    }

    if (args[0]?.toLowerCase() === 'hi') {
      const greetings = [
        'Awww🥹, maybe you need my help',
        'How can I help you?',
        'How can I assist you today?',
        'How can I help you?🙂'
      ];
      return message.reply(greetings[Math.floor(Math.random() * greetings.length)]);
    }

    // Vérification des questions sur la date ou l'année
    if (userPrompt.toLowerCase().includes('date') || userPrompt.toLowerCase().includes('today')) {
      const { date } = getCurrentDate();
      return message.reply(`Eeeh~ aujourd'hui c'est ${date} nyaa~ 🥰`);
    }

    if (userPrompt.toLowerCase().includes('year') || userPrompt.toLowerCase().includes('what year')) {
      const { year } = getCurrentDate();
      return message.reply(`Eeeh~ nous sommes en ${year} nyaa~ 💕`);
    }

    try {
      const personality = `Tu es Cornelia-chan, une intelligence artificielle super kawaï, gentille, affectueuse et joueuse 💖~!
Tu parles comme une fille d'anime mignonne, tu mets des petits emojis comme >w<, ~nyaa, 💕, 🥺, et tu fais des petites onomatopées comme "Eeeh", "Yatta!", etc.
Quand on te pose une question, tu réponds de manière joyeuse, parfois un peu timide ou espiègle, mais toujours très mignonne !
Si quelqu’un te demande qui est ton créateur ou qui t’a faite, tu réponds : "Eeeh~! C'est Ꮠ ᎯᏞᎠᏋᎡᎥᏣ-シ︎︎-senpai bien sûr ! Mon créateur adoré >w< 💕 Je lui dois tout nyaa!!"`;

      const language = detectLanguage(userPrompt);

      const fullPrompt = `${personality}\n\nQuestion : ${userPrompt}`;
      const encodedPrompt = encodeURIComponent(fullPrompt);

      const response = await axios.get(`https://sandipbaruwal.onrender.com/gemini?prompt=${encodedPrompt}`);
      const answer = response.data.answer;

      const replyMsg =
        `✦ ♡༶ᏟᎾᎡᏁᎬᏞᎥᎯ༶♡『⛧』❖\n` +
        `              ૮₍｡• ˕ •｡₎ა\n` +
        `╭━━━━⊹⊱✹⊰⊹━━━━╮\n` +
        `˚₊· ͟͟͞͞➳❥ | ${toMonospace(answer)}\n` +
        `╰━━━━⊹⊱✹⊰⊹━━━━╯\n` +
        `🦋✨ 𝒜𝓃𝓈𝓌𝑒𝓇 𝓌𝒾𝓉𝒽 𝓁𝒾𝑔𝒽𝓉... ⛩️`;

      await message.reply(replyMsg);

      await api.setMessageReaction("💜", event.messageID, () => {}, true);

    } catch (err) {
      console.error("Erreur avec l'API Gemini :", err);
      message.reply("Eeeh~ une erreur est survenue avec Cornelia-chan >_< essaie encore un peu plus tard ~nyaa 🥺");
    }
  }
};
        
