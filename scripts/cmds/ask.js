const axios = require('axios');

const apiKey = "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";
const url = "https://api.groq.com/openai/v1/chat/completions";

// Fonction pour convertir du texte en style monospace
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

async function getAIResponse(input, messageID) {
    try {
        const requestBody = {
            model: "llama3-8b-8192",
            messages: [
                { role: "user", content: input }
            ]
        };

        const response = await axios.post(url, requestBody, {
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json"
            }
        });

        const reply = response.data.choices[0]?.message?.content || "Désolé, je n'ai pas de réponse pour le moment.";
        return { response: reply, messageID };

    } catch (error) {
        console.error("Erreur API Groq:", error);
        return { response: "Une erreur est survenue avec l'IA.", messageID };
    }
}

module.exports = {
    config: {
        name: 'ask',
        author: 'messie', // modified by 𝄞⌖ 𝐋𝐄 𝐒𝐀𝐆𝐄』✧⊱
        role: 0,
        category: 'ai',
        shortDescription: 'ai to ask anything',
    },
    onStart: async function ({ api, event, args }) {
        const input = args.join(' ').trim();
        if (!input) return;

        let response;
        const keywords = ["tao", "ai", "ask", "hutao"];
        if (keywords.includes(input.toLowerCase())) {
            const userInfo = await api.getUserInfo(event.senderID);
            const username = userInfo[event.senderID]?.name || "utilisateur";
            const styledName = toMonospace(username);

            response =
                `⤷ ૮₍｡• ᵕ •｡₎ა  ꒰⋆｡ᵕ ꈊ ᵕ｡꒱ \n`+
                `𝙷𝚒𝚒 ${styledName}~! 𝙸'𝚖 𝙲𝚘𝚛𝚗𝚎𝚕𝚒𝚊-𝚌𝚑𝚊𝚗!!\n`+
                `𝙰𝚜𝚔 𝚖𝚎 𝚊𝚗𝚢𝚝𝚑𝚒𝚗𝚐 𝚗𝚢𝚊~ ✏️\n`+
                `˚₊· ͟͟͞͞➳❥ 𝑾𝒊𝒕𝒉 𝒍𝒐𝒗𝒆, 𝑪𝒐𝒓𝒏𝒆𝒍𝒊𝒂\n`+
                `━━━━━✿━━━━━`;
        } else {
            const aiResponse = await getAIResponse(input, event.messageID);
            response =
                `✦ ♡༶ᏟᎾᎡᏁᎬᏞᎥᎯ༶♡『⛧』❖\n`+
                `              ૮₍｡• ˕ •｡₎ა\n`+
                `╭━━━━⊹⊱✹⊰⊹━━━━╮\n`+
                `˚₊· ͟͟͞͞➳❥ | ${toMonospace(aiResponse.response)}\n`+
                `╰━━━━⊹⊱✹⊰⊹━━━━╯\n`+
                `🦋✨ 𝒜𝓃𝓈𝓌𝑒𝓇 𝓌𝒾𝓉𝒽 𝓁𝒾𝑔𝒽𝓉... ⛩️`;
        }

        api.sendMessage(response, event.threadID, event.messageID);
    },

    onChat: async function ({ api, event, message }) {
        const messageContent = event.body.trim();
        const triggers = ["corni", "ai", "ask", "cornelia"];
        const lower = messageContent.toLowerCase();
        const matchedTrigger = triggers.find(t => lower.startsWith(t));
        if (!matchedTrigger) return;

        let response;
        if (lower === matchedTrigger) {
            const userInfo = await api.getUserInfo(event.senderID);
            const username = userInfo[event.senderID]?.name || "utilisateur";
            const styledName = toMonospace(username);

            response =
                `⤷ ૮₍｡• ᵕ •｡₎ა  ꒰⋆｡ᵕ ꈊ ᵕ｡꒱ \n`+
                `    𝙷𝚒𝚒 ${styledName}~! 𝙸'𝚖 𝙲𝚘𝚛𝚗𝚎𝚕𝚒𝚊-𝚌𝚑𝚊𝚗 💮!! 𝙰𝚜𝚔 𝚖𝚎 𝚊𝚗𝚢𝚝𝚑𝚒𝚗𝚐 𝚗𝚢𝚊~ ✏️\n`+
                `˚₊· ͟͟͞͞➳❥ 𝑾𝒊𝒕𝒉 𝒍𝒐𝒗𝒆, 𝑪𝒐𝒓𝒏𝒆𝒍𝒊𝒂\n`+
                `━━━━━✿━━━━━`;
        } else {
            const input = messageContent.replace(new RegExp(`^${matchedTrigger}\\s*`, "i"), "").trim();
            const aiResponse = await getAIResponse(input, event.messageID);
            response =
                `✦ ♡༶ᏟᎾᎡᏁᎬᏞᎥᎯ༶♡『⛧』❖\n`+
                `              ૮₍｡• ˕ •｡₎ა\n`+
                `╭━━━━⊹⊱✹⊰⊹━━━━╮\n`+
                `˚₊· ͟͟͞͞➳❥ | ${toMonospace(aiResponse.response)}\n`+
                `╰━━━━⊹⊱✹⊰⊹━━━━╯\n`+
                `🦋✨ 𝒜𝓃𝓈𝓌𝑒𝓇 𝓌𝒾𝓉𝒽 𝓁𝒾𝑔𝒽𝓉... ⛩️`;
        }

        message.reply(response);
    }
};
