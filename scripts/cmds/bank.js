const fs = require('fs');
const path = './bank.json'; // Chemin vers ton fichier JSON

module.exports = {
  config: {
    name: "bank",
    aliases: ["banque"],
    version: "1.0",
    author: "Ꮠ ᎯᏞᎠᏋᎡᎥᏣ-シ︎︎",
    countDown: 5,
    role: 0,
    shortDescription: "Bank system for loans and repayments",
    longDescription: "Command to request loans and repay debts from the bank.",
    category: "economy",
    guide: "{pn} loan <amount> / {pn} repay <amount>",
  },

  onStart: async function ({ args, message, event }) {
    // Charger les données du fichier bank.json
    let bankData = {};
    if (fs.existsSync(path)) {
      const data = fs.readFileSync(path);
      bankData = JSON.parse(data);
    }

    const userID = event.senderID;
    const action = args[0]?.toLowerCase();
    const amount = parseInt(args[1]);

    // Si l'utilisateur n'a pas encore de prêt dans le fichier, on l'initialise
    if (!bankData[userID]) {
      bankData[userID] = { loan: null, money: 1000 }; // Solde initial (exemple)
    }

    const userData = bankData[userID];

    if (action === "loan") {
      const maxLoanAmount = Math.floor(userData.money * 0.40); // 40% de la balance

      if (!amount || amount <= 0) {
        return message.reply("❌ | Please specify a valid loan amount.");
      }

      if (amount > maxLoanAmount) {
        return message.reply(
          `❌ | You can only borrow up to **${maxLoanAmount}** spina, based on your current balance.`
        );
      }

      if (amount > userData.money) {
        return message.reply("💸 | You don't have enough spina to take this loan.");
      }

      const loanData = {
        amount: amount,
        interestRate: 0.15,
        timestamp: Date.now(),
        repaid: 0,
      };

      userData.loan = loanData;
      userData.money -= amount; // Déduire l'argent du joueur
      fs.writeFileSync(path, JSON.stringify(bankData, null, 2)); // Sauvegarder les données

      message.reply(
        `💰 *Loan Approved!* 💰\n\n` +
        `You have successfully borrowed **${amount}** spina, with a 15% interest rate. 💸\n` +
        `Your loan repayment is due within 2 days. The total amount to repay is **${(amount * 1.15).toFixed(2)}** spina. 🕑`
      );
    } else if (action === "repay") {
      const loanData = userData.loan;

      if (!loanData || loanData.amount <= 0) {
        return message.reply("❌ | You don't have any active loan to repay.");
      }

      if (!amount || amount <= 0) {
        return message.reply("❌ | Please specify a valid repayment amount.");
      }

      const totalRepayment = loanData.amount * (1 + loanData.interestRate);
      const remainingAmount = totalRepayment - loanData.repaid;

      if (amount > remainingAmount) {
        return message.reply(
          `❌ | You can only repay up to **${remainingAmount}** spina at the moment.`
        );
      }

      if (amount > userData.money) {
        return message.reply("💸 | You don't have enough spina to make this repayment.");
      }

      loanData.repaid += amount;
      userData.money -= amount; // Déduire le remboursement du solde du joueur
      fs.writeFileSync(path, JSON.stringify(bankData, null, 2)); // Sauvegarder les données

      const currentTime = Date.now();
      const timeElapsed = currentTime - loanData.timestamp;
      const loanDueDate = 86400000 * 2;

      if (timeElapsed > loanDueDate) {
        const penalty = loanData.amount * 0.10;
        loanData.amount += penalty;
        message.reply(
          `⚠️ *Penalty Applied!* ⚠️\n\n` +
          `You have missed the repayment deadline, and a penalty of **${penalty}** spina has been added to your loan. Your new loan amount is **${loanData.amount}** spina.`
        );
      }

      if (loanData.repaid >= totalRepayment) {
        delete userData.loan;
        fs.writeFileSync(path, JSON.stringify(bankData, null, 2)); // Sauvegarder les données
        return message.reply(
          `🎉 *Loan Fully Repaid!* 🎉\n\n` +
          `You have successfully repaid your loan of **${loanData.amount}** spina (including interest)! 💸\n` +
          `Your new balance is **${userData.money}** spina. Thank you for your timely repayment! 🌟`
        );
      }

      message.reply(
        `💰 *Repayment Successful!* 💰\n\n` +
        `You have successfully repaid **${amount}** spina. 🏦\n` +
        `Your remaining loan balance is **${remainingAmount - amount}** spina (including interest). 💸`
      );
    } else {
      return message.reply(
        "❌ | Invalid action. Use `loan <amount>` to request a loan or `repay <amount>` to repay your loan."
      );
    }
  },
};
