import { Telegraf } from 'telegraf';
import fs from 'fs';
import dayjs from 'dayjs';
import { BOT_API_TOKEN, CHAT_ID, HELLOW_MESSAGE, LOGS_FILE, ACCEPT_BUTTON_TITLE, LINK_BUTTON_TITLE, LINK_MESSAGE_TEXT } from './consts';

/**
 * Функция собирает сообщение для логов.
 */
const logMessage = (action, user) => {
  return `
${dayjs().format('YYYY-MM-DD HH:mm:ss')} / ${action} / ${user.first_name} ${user.last_name} (id: ${user.id}, username: ${user.username})`;
};

/**
 * Параметры для преобразования HTML в сообщении.
 * Плюс кнопки получения доступа.
 */
const startActionButtonsOptions = {
  parse_mode: 'HTML',
  disable_web_page_preview: true,
  reply_markup: {
    inline_keyboard: [[{ text: ACCEPT_BUTTON_TITLE, callback_data: 'handleAccept' }]],
  },
};

/**
 * Параметры для преобразования HTML в сообщении.
 * Плюс кнопки перехода в приватную группу.
 */
const linkActionButtonsOptions = (chatLink) => {
  return {
    parse_mode: 'HTML',
    disable_web_page_preview: true,
    reply_markup: {
      inline_keyboard: [[{ text: LINK_BUTTON_TITLE, url: chatLink }]],
    },
  };
};

const bot = new Telegraf(BOT_API_TOKEN);

/**
 * /start
 * Записывает пользователя в лог,
 * отправляет приветственное сообщение
 * и кнопку получения доступа.
 */
bot.start((ctx) => {
  const user = ctx.message.from;
  fs.appendFileSync(LOGS_FILE, logMessage('start', user));

  return ctx.reply(HELLOW_MESSAGE, startActionButtonsOptions);
});

/**
 * Записывает пользователя в лог,
 * формирует ссылку на группу,
 * отправляет в ответ кнопку для перехода в группу.
 */
bot.action('handleAccept', async (ctx) => {
  const user = ctx.update.callback_query.from;
  fs.appendFileSync(LOGS_FILE, logMessage('accept', user));

  const chatLink = await bot.telegram.getChat(CHAT_ID);
  return ctx.reply(LINK_MESSAGE_TEXT, linkActionButtonsOptions(chatLink.invite_link));
});

bot.launch();
