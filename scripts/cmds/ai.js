const axios = require('axios');
const UPoLPrefix = [
  '-corneila',
  'corneila',
  '/corneila',
  '-ai',
  'ai',
  '/ai',
  'bot',
  'ask'
]; 

module.exports = {
  config: {
    name: 'corneila',
    version: '1.2.1',
    role: 0,
    category: 'AI',
    author: 'Raphael scholar',
    shortDescription: '',
    longDescription: '',
  },
  
  onStart: async function () {},
  onChat: async function ({ message, event, args, api, threadID, messageID }) {
      
      const ahprefix = UPoLPrefix.find((p) => event.body && event.body.toLowerCase().startsWith(p));
      if (!ahprefix) {
        return; 
      } 
      
      const upol = event.body.substring(ahprefix.length).trim();

      // Si le préfixe est "corneila" ou "ai" et il n'y a pas de texte après le préfixe
      if (!upol) {
        await message.reply('𝐂𝐨𝐫𝐧𝐞𝐥𝐢a ࿐\n✿.•❀•.•❀•.✿\nHey, my name is Cornelia 🪶 ask me any questions darling ✏, I\'ll be happy to answer you.\n✿.•❀•.•❀•.✿');
        return;
      }
      
      // Si un message est donné après le préfixe, on peut envoyer une réponse par l'API comme avant
      const apply = ['Awww🥹, maybe you need my help', 'How can i help you?', 'How can i assist you today?', 'How can i help you?🙂'];
      const randomapply = apply[Math.floor(Math.random() * apply.length)];

      if (args[0] === 'hi') {
          message.reply(`${randomapply}`);
          return;
      }
      
      const encodedPrompt = encodeURIComponent(args.join(" "));

      await message.reply('thinking..');
  
      try {
          const response = await axios.get(`https://sandipbaruwal.onrender.com/gemini?prompt=${encodedPrompt}`);
          const UPoL = response.data.answer; 
          const upolres = `${UPoL}`;
          message.reply(upolres);
      } catch (error) {
          message.reply("Oops! Something went wrong while fetching the response.");
      }
  }
};
