const fs = require('fs');
const path = './bank.json';

module.exports = {
  config: {
    name: "bank",
    aliases: ["banque"],
    version: "1.1",
    author: "Ꮠ ᎯᏞᎠᏋᎡᎥᏣ-シ︎︎",
    countDown: 5,
    role: 0,
    shortDescription: "Bank system with penalties for late repayments",
    longDescription: "Request loans, repay debts, and face penalties for late repayments.",
    category: "economy",
    guide: "{pn} loan <amount> / {pn} repay <amount>",
  },

  onStart: async function ({ args, message, event, sendReaction }) {
    let bankData = {};
    if (fs.existsSync(path)) {
      const data = fs.readFileSync(path);
      bankData = JSON.parse(data);
    }

    const userID = event.senderID;
    const action = args[0]?.toLowerCase();
    const amount = parseInt(args[1]);

    if (!bankData[userID]) {
      bankData[userID] = { loan: null, money: 1000 };
    }

    const userData = bankData[userID];

    if (action === "loan") {
      const maxLoanAmount = Math.floor(userData.money * 0.50); // 50% of the balance
      if (!amount || amount <= 0) return message.reply("❌ | Please specify a valid loan amount.");

      if (amount > maxLoanAmount) {
        return message.reply(
          `❌ | You can borrow up to **${maxLoanAmount}**.`
        );
      }

      if (amount > userData.money) {
        return message.reply("💸 | You don't have enough spina to request this loan.");
      }

      const loanData = {
        amount: amount,
        interestRate: 0.40, // 40% interest
        timestamp: Date.now(),
        repaid: 0,
      };

      userData.loan = loanData;
      userData.money -= amount;
      fs.writeFileSync(path, JSON.stringify(bankData, null, 2));

      message.reply({
        body: `💰 *Loan Approved!* 💰\n\n` +
          `You have successfully borrowed **${amount}** spina with a 40% interest rate.\n` +
          `💵 Total repayment amount: **${(amount * 1.40).toFixed(2)}** spina.\n` +
          `⏳ Repayment deadline: 24 hours.\n` +
          `⚠️ Late repayments will incur a 10% penalty per day.`,
        sticker: "💸",
      });
    } else if (action === "repay") {
      const loanData = userData.loan;
      if (!loanData || loanData.amount <= 0) {
        return message.reply("❌ | You don't have an active loan to repay.");
      }

      if (!amount || amount <= 0) {
        return message.reply("❌ | Please specify a valid repayment amount.");
      }

      const totalRepayment = parseFloat((loanData.amount * (1 + loanData.interestRate)).toFixed(2));
      const currentTime = Date.now();
      const timeElapsed = currentTime - loanData.timestamp;
      const loanDueDate = 86400000; // 24 hours
      let remainingAmount = totalRepayment - loanData.repaid;

      if (timeElapsed > loanDueDate) {
        const daysLate = Math.floor((timeElapsed - loanDueDate) / 86400000);
        const penalty = parseFloat((loanData.amount * 0.10 * daysLate).toFixed(2)); // 10% penalty per day
        loanData.amount += penalty;
        remainingAmount += penalty;
        message.reply({
          body: `⚠️ *Penalty Applied!* ⚠️\n\n` +
            `You missed the repayment deadline.\n` +
            `Penalty added: **${penalty.toFixed(2)}** spina.\n` +
            `New total repayment amount: **${remainingAmount.toFixed(2)}** spina.`,
          sticker: "⚠️",
        });
      }

      if (amount > remainingAmount) {
        return message.reply(
          `❌ | You can only repay up to **${remainingAmount.toFixed(2)}** spina at the moment.`
        );
      }

      if (amount > userData.money) {
        return message.reply("💸 | You don't have enough spina to make this repayment.");
      }

      loanData.repaid += amount;
      userData.money -= amount;

      if (loanData.repaid >= totalRepayment) {
        delete userData.loan;
        fs.writeFileSync(path, JSON.stringify(bankData, null, 2));
        return message.reply({
          body: `🎉 *Loan Fully Repaid!* 🎉\n\n` +
            `You have successfully repaid your loan.\n` +
            `💵 Your new balance: **${userData.money.toFixed(2)}** spina.\n` +
            `Thank you for your timely repayment!`,
          sticker: "🎉",
        });
      }

      fs.writeFileSync(path, JSON.stringify(bankData, null, 2));
      message.reply({
        body: `💰 *Repayment Successful!* 💰\n\n` +
          `You have repaid **${amount.toFixed(2)}** spina.\n` +
          `💸 Remaining loan balance: **${(remainingAmount - amount).toFixed(2)}** spina.`,
        sticker: "✅",
      });
    } else {
      return message.reply(
        "❌ | Invalid action. Use `loan <amount>` to request a loan or `repay <amount>` to repay your loan."
      );
    }
  },
};
