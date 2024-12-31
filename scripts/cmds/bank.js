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

  onStart: async function ({ args, message, usersData, event }) {
    const userData = await usersData.get(event.senderID);
    const action = args[0]?.toLowerCase();
    const amount = parseInt(args[1]);

    if (action === "loan") {
      // Calculer le montant maximal qu'un joueur peut prêter (40% de leur solde actuel)
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

      // Appliquer un taux d'intérêt de 15% sur le prêt
      const loanData = {
        amount: amount,
        interestRate: 0.15,
        timestamp: Date.now(),
        repaid: 0,
      };

      // Enregistrer les données du prêt dans l'utilisateur
      userData.loan = loanData;
      userData.money -= amount; // Déduire l'argent du joueur
      await usersData.set(event.senderID, userData);

      message.reply(
        `💰 *Loan Approved!* 💰\n\n` +
        `You have successfully borrowed **${amount}** spina, with a 15% interest rate. 💸\n` +
        `Your loan repayment is due within 2 days. The total amount to repay is **${(amount * 1.15).toFixed(2)}** spina. 🕑`
      );
    } else if (action === "repay") {
      // Vérifier si l'utilisateur a un prêt à rembourser
      const loanData = userData.loan;

      if (!loanData || loanData.amount <= 0) {
        return message.reply("❌ | You don't have any active loan to repay.");
      }

      if (!amount || amount <= 0) {
        return message.reply("❌ | Please specify a valid repayment amount.");
      }

      const totalRepayment = loanData.amount * (1 + loanData.interestRate); // Montant total à rembourser avec intérêts
      const remainingAmount = totalRepayment - loanData.repaid; // Montant restant à rembourser

      if (amount > remainingAmount) {
        return message.reply(
          `❌ | You can only repay up to **${remainingAmount}** spina at the moment.`
        );
      }

      if (amount > userData.money) {
        return message.reply("💸 | You don't have enough spina to make this repayment.");
      }

      // Mettre à jour les informations du prêt
      loanData.repaid += amount;
      userData.money -= amount; // Déduire le remboursement du solde du joueur
      await usersData.set(event.senderID, userData);

      const currentTime = Date.now();
      const timeElapsed = currentTime - loanData.timestamp; // Calculer le temps écoulé depuis la demande de prêt
      const loanDueDate = 86400000 * 2; // 2 jours en millisecondes

      if (timeElapsed > loanDueDate) {
        // Si le délai est dépassé, appliquer une pénalité
        const penalty = loanData.amount * 0.10; // 10% de pénalité
        loanData.amount += penalty;
        message.reply(
          `⚠️ *Penalty Applied!* ⚠️\n\n` +
          `You have missed the repayment deadline, and a penalty of **${penalty}** spina has been added to your loan. Your new loan amount is **${loanData.amount}** spina.`
        );
      }

      // Si le joueur a remboursé la totalité du prêt
      if (loanData.repaid >= totalRepayment) {
        delete userData.loan; // Supprimer les données du prêt
        await usersData.set(event.senderID, userData);
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
