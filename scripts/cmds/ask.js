const axios = require('axios');

// API Keys
const GEMINI_KEY = "AIzaSyB734HYzdlFMp823xjHjHswAjVkInm21lg";
const DEEPSEEK_KEY = "sk-c5fa24f73c054adf80df62bf2490d412";

// Endpoints
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_KEY}`;
const DEEPSEEK_URL = "https://api.deepseek.ai/v1/chat/completions";

// Allowed prefixes
const UPoLPrefix = ['ai', 'ask', 'bot', 'cornelia', 'corni'];

// Monospace formatter
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

// Cornelia's personality (allégée)
const personality = `You're Cornelia-chan, a sweet and intelligent assistant inspired by anime characters. You speak in a soft, kind, and friendly tone — like a calm and caring big sister. You sometimes add a touch of cuteness (like “Eeeh~”, “>w<”, or “nyaa~”), but keep your responses clear and helpful. You're never cold, but not overly hyper either.

You can understand and reply in the same language used by the user. If someone asks who created you, respond: "Eeeh~ it's Ꮠ ᎯᏞᎠᏋᎡᎥᏣ-シ︎︎-senpai of course >w< 💕 He made me nyaa~!"`;

// AI response function
async function getAIResponse(userPrompt) {
  const prompt = `${personality}\n\nQuestion: ${userPrompt}\n\nRéponds dans la même langue que la question ci-dessus.`;

  // Try Gemini
  try {
    const res = await axios.post(GEMINI_URL, {
      contents: [{ parts: [{ text: prompt }] }]
    }, {
      headers: { "Content-Type": "application/json" }
    });

    const reply = res.data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (reply) return reply;
  } catch (err) {
    console.warn("Gemini failed:", err.message);
  }

  // Fallback DeepSeek
  try {
    const res = await axios.post(DEEPSEEK_URL, {
      model: "deepseek-chat",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7
    }, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${DEEPSEEK_KEY}`
      }
    });

    return res.data?.choices?.[0]?.message?.content || null;
  } catch (err) {
    console.warn("DeepSeek failed:", err.message);
    return null;
  }
}

// Command export
module.exports = {
  config: {
    name: 'ask',
    version: '2.0',
    role: 0,
    category: 'AI',
    author: 'Renji Starfall improved by Ꮠ ᎯᏞᎠᏋᎡᎥᏣ-シ︎︎',
    shortDescription: 'Ask Cornelia-chan 💮 anything',
    longDescription: 'Cornelia-chan is a sweet anime-inspired AI assistant that answers your questions clearly and kindly >w<',
  },

  onStart: async () => {},

  onChat: async function ({ message, event, api }) {
    const isReply = event.messageReply?.senderID === api.getCurrentUserID();
    const prefixUsed = UPoLPrefix.find(p => event.body?.toLowerCase().startsWith(p));

    let userPrompt = null;

    if (prefixUsed) {
      userPrompt = event.body.slice(prefixUsed.length).trim();
    } else if (isReply && event.body) {
      userPrompt = event.body.trim();
    } else {
      return;
    }

    if (!userPrompt) {
      const userInfo = await api.getUserInfo(event.senderID);
      const username = userInfo[event.senderID]?.name || "you";
      const styledName = toMonospace(username);

      return message.reply(
        ` ૮₍｡• ᵕ •｡₎ა  ꒰⋆｡ᵕ ꈊ ᵕ｡꒱ \n` +
        `    𝙷𝚒𝚒 ${styledName}~! 𝙸'𝚖 𝙲𝚘𝚛𝚗𝚎𝚕𝚒𝚊-𝚌𝚑𝚊𝚗 💮!! 𝙰𝚜𝚔 𝚖𝚎 𝚊𝚗𝚢𝚝𝚑𝚒𝚗𝚐 𝚗𝚢𝚊~ ✏️\n` +
        `˚₊· ͟͟͞͞➳❥ 𝑾𝒊𝒕𝒉 𝒍𝒐𝒗𝒆, 𝑪𝒐𝒓𝒏𝒆𝒍𝒊𝒂\n` +
        `━━━━━✿━━━━━`
      );
    }

    const aiReply = await getAIResponse(userPrompt);
    const finalAnswer = aiReply || "Eeeh~ something went wrong >w< Please try again later nyaa~ 🥺";

    const formatted =
      `✦ ♡༶ᏟᎾᎡᏁᎬᏞᎥᎯ༶♡『⛧』❖\n` +
      `              ૮₍｡• ˕ •｡₎ა\n` +
      `╭━━━━⊹⊱✹⊰⊹━━━━╮\n` +
      `˚₊· ͟͟͞͞➳❥ | ${toMonospace(finalAnswer)}\n` +
      `╰━━━━⊹⊱✹⊰⊹━━━━╯\n` +
      `🦋✨ 𝙸𝚏 𝚢𝚘𝚞 𝚠𝚊𝚗𝚗𝚊 𝚌𝚘𝚗𝚝𝚒𝚗𝚞𝚎, 𝚛𝚎𝚙𝚕𝚢 𝚝𝚘 𝚖𝚎 𝚗𝚢𝚊~ 💜`;

    await message.reply(formatted);
    await api.setMessageReaction("💜", event.messageID, () => {}, true);
  }
};
