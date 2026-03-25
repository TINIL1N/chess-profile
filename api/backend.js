import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  // Разрешаем запросы с любого домена (CORS)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { method, query, body } = req;
  // Действие может прийти или в теле POST-запроса, или в параметрах GET-запроса
  const action = method === 'POST' ? body?.action : query?.action;

  // ==========================================
  //  ЧТЕНИЕ ДАННЫХ (GET запросы)
  // ==========================================
  if (method === 'GET') {
    // Получить список всех разборов
    if (action === 'get_index') {
      const index = await kv.get('analyses_index') || [];
      return res.status(200).json(index);
    }
    // Получить настройки сайта (meta)
    if (action === 'get_meta') {
      const meta = await kv.get('site_meta') || {};
      return res.status(200).json(meta);
    }
    // Получить один конкретный разбор по ID
    if (action === 'get_analysis' && query.id) {
      const data = await kv.get(`analysis:${query.id}`);
      if (!data) return res.status(404).json({ ok: false, error: 'not_found' });
      return res.status(200).json(data);
    }
    return res.status(400).json({ ok: false, error: 'unknown_get_action' });
  }

  // ==========================================
  //  ЗАПИСЬ ДАННЫХ (POST запросы из админки)
  // ==========================================
  if (method === 'POST') {
    const ADMIN_PASS = process.env.ADMIN_PASSWORD || 'chess2024'; // Пароль можно вынести в переменные окружения Vercel

    // Авторизация
    if (action === 'auth') {
      if (body.password === ADMIN_PASS) {
        const token = Buffer.from(`${Math.random()}`).toString('base64');
        await kv.set('session_token', token, { ex: 86400 }); // Токен живет 24 часа
        return res.status(200).json({ ok: true, token });
      }
      return res.status(401).json({ ok: false, error: 'wrong_password' });
    }

    // --- Все действия ниже требуют токен ---
    const sentToken = body.token;
    const storedToken = await kv.get('session_token');
    if (!sentToken || sentToken !== storedToken) {
      return res.status(401).json({ ok: false, error: 'auth_failed' });
    }

    // Сохранение настроек сайта
    if (action === 'save_meta') {
      const currentMeta = await kv.get('site_meta') || {};
      const newMeta = { ...currentMeta, ...body.data };
      await kv.set('site_meta', newMeta);
      return res.status(200).json({ ok: true });
    }

    // Сохранение разбора
    if (action === 'save_analysis') {
      const analysis = body.analysis;
      if (!analysis || !analysis.id) {
        return res.status(400).json({ ok: false, error: 'invalid_data' });
      }
      // 1. Сохраняем сам разбор
      await kv.set(`analysis:${analysis.id}`, analysis);

      // 2. Обновляем общий список (индекс)
      let index = await kv.get('analyses_index') || [];
      index = index.filter(item => item.id !== analysis.id); // Удаляем старую версию, если была
      index.push({
        id: analysis.id,
        title: analysis.title,
        excerpt: analysis.excerpt || '',
        tags: analysis.tags || [],
        date: analysis.date,
        updated: analysis.updated,
        blocks: analysis.blocks?.length || 0,
      });
      // Сортируем, чтобы самые свежие были вверху
      index.sort((a, b) => new Date(b.date) - new Date(a.date));
      await kv.set('analyses_index', index);

      return res.status(200).json({ ok: true, id: analysis.id });
    }

    // Удаление разбора
    if (action === 'delete_analysis') {
      const { id } = body;
      if (!id) return res.status(400).json({ ok: false, error: 'no_id_provided' });
      
      // 1. Удаляем сам разбор
      await kv.del(`analysis:${id}`);
      
      // 2. Обновляем индекс
      let index = await kv.get('analyses_index') || [];
      index = index.filter(item => item.id !== id);
      await kv.set('analyses_index', index);
      
      return res.status(200).json({ ok: true });
    }

    return res.status(400).json({ ok: false, error: 'unknown_post_action' });
  }

  // Если метод не GET и не POST
  return res.status(405).json({ ok: false, error: 'method_not_allowed' });
}
