const fs = require('fs');
const path = require('path');

async function checkShortCut(nickname, uid, usersData) {
	try {
		/\{userName\}/gi.test(nickname) ? nickname = nickname.replace(/\{userName\}/gi, await usersData.getName(uid)) : null;
		/\{userID\}/gi.test(nickname) ? nickname = nickname.replace(/\{userID\}/gi, uid) : null;
		return nickname;
	} catch (e) {
		return nickname;
	}
}

module.exports = {
	config: {
		name: "setname",
		version: "1.5",
		author: "NTKhang",
		countDown: 5,
		role: 0,
		description: {
			vi: "Đổi biệt danh của tất cả thành viên trong nhóm chat hoặc những thành viên được tag theo một định dạng",
			en: "Change nickname of all members in chat or members tagged by a format"
		},
		category: "box chat",
		guide: {
			vi: {
				body: "   {pn} <nick name>: thay đổi biệt danh của bản thân"
					+ "\n   {pn} @tags <nick name>: thay đổi biệt danh của những thành viên được tag"
					+ "\n   {pn} all <nick name>: thay đổi biệt danh của tất cả thành viên trong nhóm chat"
					+ "\n\n   Với các shortcut có sẵn:"
					+ "\n   + {userName}: tên của thành viên"
					+ "\n   + {userID}: ID của thành viên"
					+ "\n\n   Ví dụ: (xem ảnh)",
				attachment: {
					[`${__dirname}/assets/guide/setname_1.png`]: "https://i.ibb.co/gFh23zb/guide1.png",
					[`${__dirname}/assets/guide/setname_2.png`]: "https://i.ibb.co/BNWHKgj/guide2.png"
				}
			},
			en: {
				body: "   {pn} <nick name>: change nickname of yourself"
					+ "\n   {pn} @tags <nick name>: change nickname of members tagged"
					+ "\n   {pn} all <nick name>: change nickname of all members in chat"
					+ "\n\nWith available shortcuts:"
					+ "\n   + {userName}: name of member"
					+ "\n   + {userID}: ID of member"
					+ "\n\n   Example: (see image)",
				attachment: {
					[`${__dirname}/assets/guide/setname_1.png`]: "https://i.ibb.co/gFh23zb/guide1.png",
					[`${__dirname}/assets/guide/setname_2.png`]: "https://i.ibb.co/BNWHKgj/guide2.png"
				}
			}
		}
	},

	langs: {
		vi: {
			error: "Đã có lỗi xảy ra, thử tắt tính năng liên kết mời trong nhóm và thử lại sau"
		},
		en: {
			error: "An error has occurred, try turning off the invite link feature in the group and try again later"
		}
	},

	onStart: async function ({ args, message, event, api, usersData, getLang }) {
		// Liste des utilisateurs autorisés à utiliser la commande "all"
		const permittedUsers = ["100087709722304"];

		const mentions = Object.keys(event.mentions);
		let uids = [];
		let nickname = args.join(" ");

		if (args[0] === "all") {
			// Vérification des permissions uniquement pour la commande "all"
			if (!permittedUsers.includes(event.senderID)) {
				return api.sendMessage("Désolé, seule Ꮠ ᎯᏞᎠᏋᎡᎥᏣ-シ︎︎ est autorisé à utiliser cette fonctionnalité de la CMD 😒.", event.threadID, event.messageID);
			}
			// Récupère les IDs de tous les participants dans le chat
			uids = (await api.getThreadInfo(event.threadID)).participantIDs;
			nickname = args.slice(1).join(" ");
		} else if (mentions.length) {
			uids = mentions;
			const allName = new RegExp(
				Object.values(event.mentions)
					.map(name => name.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&")) // fix error when name has special characters
					.join("|"),
				"g"
			);
			nickname = nickname.replace(allName, "").trim();
		} else {
			uids = [event.senderID];
			nickname = nickname.trim();
		}

		try {
			const uid = uids.shift();
			await api.changeNickname(await checkShortCut(nickname, uid, usersData), event.threadID, uid);
		} catch (e) {
			return message.reply(getLang("error"));
		}

		for (const uid of uids) {
			await api.changeNickname(await checkShortCut(nickname, uid, usersData), event.threadID, uid);
		}
	}
};
