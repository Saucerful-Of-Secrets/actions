import TelegramBot from 'node-telegram-bot-api';
import * as dotenv from 'dotenv';
dotenv.config();

const apiKeyTg = process.env.TG_BOT_MyTestBoooot;
const sUrl = process.env.LOCAL_URL_HTTPS;
const bot = new TelegramBot(apiKeyTg, { polling: true });

bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;

  try {
    const response = await fetch(`${sUrl}api/actions/donate`);
    const data = await response.json();

    if (data.links && data.links.actions) {
      const actions = data.links.actions;

      let message = 'Actions:\n';
      const buttons = actions.map((action) => ({
        text: action.label,
        url: `${sUrl}?href=${encodeURIComponent(action.href)}`,
      }));

      bot.sendMessage(chatId, message, {
        reply_markup: {
          inline_keyboard: [buttons],
        },
      });
    } else {
      bot.sendMessage(chatId, 'No actions.');
    }
  } catch (error) {
    console.error('Error fetching actions:', error);
    bot.sendMessage(chatId, 'Error fetching actions.');
  }
});
