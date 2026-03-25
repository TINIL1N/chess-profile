export const runtime = 'nodejs';

export default async function handler(req, res) {
  // Разрешаем CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method Not Allowed' });
  }

  // Получаем токен и ID из переменных окружения
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!botToken || !chatId) {
    console.error('Telegram bot credentials are not set in environment variables.');
    return res.status(500).json({ ok: false, error: 'server_configuration_error' });
  }

  try {
    const data = req.body;

    // Форматируем красивое сообщение
    const message = [
      `🔔 *Новая заявка на разбор!*`,
      `--------------------------------------`,
      `👤 *Имя:* ${data.name || 'Не указано'}`,
      `📞 *Контакт:* ${data.contact || 'Не указан'}`,
      `🔗 *Ссылка на партию:*`,
      `${data.gameLink || 'Не указана'}`,
      `--------------------------------------`,
      `💬 *Комментарий:*`,
      `${data.comment || 'Пусто'}`,
    ].join('\n');

    // URL для отправки в Telegram API
    const url = `https://api.telegram.org/bot${botToken}/sendMessage`;

    // Отправляем запрос
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'Markdown', // Для красивого форматирования
      }),
    });

    const result = await response.json();

    if (!result.ok) {
      throw new Error(result.description || 'Telegram API error');
    }

    // Если всё успешно
    return res.status(200).json({ ok: true });

  } catch (error) {
    console.error('Error sending message:', error.message);
    return res.status(500).json({ ok: false, error: 'internal_server_error' });
  }
}
