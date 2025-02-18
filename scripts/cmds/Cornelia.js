~cmd install cornelia.js const axios = require("axios");
module.exports = {
	config: {
		name: 'cornelia',
		version: '1.2',
		author: 'Xemon',
		countDown: 15,
		role: 0,
		shortDescription: 'Cornelia AI',
		longDescription: {
			vi: 'Chat với simsimi',
			en: 'Chat with Cornelia'
		},
		category: 'funny',
		guide: {
			vi: '   {pn} [on | off]: bật/tắt simsimi'
				+ '\n'
				+ '\n   {pn} <word>: chat nhanh với simsimi'
				+ '\n   Ví dụ:\n    {pn} hi',
			en: '   {pn} <word>: chat with hina'
				+ '\n   Example:\n    {pn} hi'
		}
	},

	langs: {
		vi: {
			turnedOn: 'Bật simsimi thành công!',
			turnedOff: 'Tắt simsimi thành công!',
			chatting: 'Đang chat với simsimi...',
			error: 'Simsimi đang bận, bạn hãy thử lại sau'
		},
		en: {
			turnedOn: 'Mode blabla activé (¬◡¬)✧ !',
			turnedOff: 'Nonnnnn 🥺😭!',
			chatting: 'Already Chatting with hina...',
			error: 'Quoi ? 🐸'
		}
	},

	onStart: async function ({ args, threadsData, message, event, getLang }) {
		const allowedGroupId = "6449429501820415"; // L'ID autorisé
		if (event.threadID !== allowedGroupId) {
			return message.reply("Accès exclusif 🍂 ! Mais , pour toi je peut faire une exception 😉✨. Tape simplement la cmd « ~corneliagc » 📝 pour rejoindre ma communauté 👥 et pour discuter avec moi au temps de fois que tu le veux. Merci💓 !!!");
		}

		if (args[0] === 'parle' || args[0] === 'tgl') {
			await threadsData.set(event.threadID, args[0] === "parle", "settings.simsimi");
			return message.reply(args[0] === "parle" ? getLang("turnedOn") : getLang("turnedOff"));
		} else if (args[0]) {
			const yourMessage = args.join(" ");
			try {
				const responseMessage = await getMessage(yourMessage, "fr");
				return message.reply(`${responseMessage}`);
			} catch (err) {
				console.error(err);
				return message.reply(getLang("error"));
			}
		}
	},

	onChat: async ({ args, message, threadsData, event, isUserCallCommand, getLang }) => {
		const allowedGroupId = "6449429501820415"; // L'ID autorisé
		if (event.threadID !== allowedGroupId) {
			return; // Ne fait rien si ce n'est pas le bon groupe
		}

		if (args.length > 1 && !isUserCallCommand && await threadsData.get(event.threadID, "settings.simsimi")) {
			try {
				const responseMessage = await getMessage(args.join(" "), "fr");
				return message.reply(`${responseMessage}`);
			} catch (err) {
				return message.reply(getLang("error"));
			}
		}
	}
};

async function getMessage(yourMessage, langCode) {
	const res = await axios.post(
		'https://api.simsimi.vn/v1/simtalk',
		new URLSearchParams({
			'text': yourMessage,
			'lc': langCode // Utilisez "fr" pour le français
		})
	);

	if (res.status > 200)
		throw new Error(res.data.success);

	return res.data.message;
}
