// ============================================================
//  ДАННЫЕ САЙТА — дефолтные значения
//  (перезаписываются данными из админки)
// ============================================================

const DATA = {

  hero: {
    badge: 'Шахматный аналитик',
    stats: [
      { value: '200+',     label: 'партий разобрано' },
      { value: '500–2000', label: 'рейтинг клиентов' },
      { value: '5 лет',   label: 'практики анализа'  },
    ],
  },

  approach: {
    paragraphs: [
      'Тренеры учат дебютам, эндшпилям, теории. Я делаю другое — смотрю конкретно на вашу партию и объясняю, что пошло не так и почему.',
      'Движок даёт цифры. Я даю понимание. Разница в том, что после моего разбора вы знаете, как думать в следующий раз.',
      'Каждый разбор — это разговор о вашей логике, вашем мышлении и конкретных моментах, где оно ломается.',
    ],
    principles: [
      {
        num: '01',
        title: 'Живой анализ',
        desc: 'Смотрю партию глазами игрока, а не движка',
      },
      {
        num: '02',
        title: 'Понятный язык',
        desc: 'Объясняю просто — без нотации и умных слов',
      },
      {
        num: '03',
        title: 'Конкретные выводы',
        desc: 'Каждый разбор заканчивается рекомендацией',
      },
    ],
  },

  // Заглушки — показываются пока нет реальных разборов из админки
  analyses: [
    {
      id: 1,
      title: 'Как я проиграл выигранную позицию',
      excerpt: 'Разбираю типичную ошибку — когда материальное преимущество кажется достаточным, но времени на реализацию не хватает.',
      tags: ['Эндшпиль', 'Ошибки'],
      date: '2024-03-15',
      img: null,
    },
    {
      id: 2,
      title: 'Жертва ферзя — правильно ли?',
      excerpt: 'Позиция, где интуиция говорит "жертвуй", а расчёт — "не надо". Разбираемся как считать такие позиции.',
      tags: ['Тактика', 'Миттельшпиль'],
      date: '2024-02-28',
      img: null,
    },
    {
      id: 3,
      title: 'Французская защита: где ошибаются все',
      excerpt: 'Три позиции из реальных партий моих клиентов. Одна и та же структура — три разных исхода.',
      tags: ['Дебют', 'Стратегия'],
      date: '2024-02-10',
      img: null,
    },
  ],

  benefits: [
    {
      icon: 'eye',
      title: 'Понимание ошибок',
      desc: 'Не список плохих ходов, а объяснение почему ваша логика привела к ошибке',
    },
    {
      icon: 'brain',
      title: 'Анализ мышления',
      desc: 'Выявляю паттерны, которые мешают принимать правильные решения',
    },
    {
      icon: 'message-circle',
      title: 'Понятный язык',
      desc: 'Никакой алгебраической нотации — только живые объяснения',
    },
    {
      icon: 'target',
      title: 'Конкретные рекомендации',
      desc: 'После каждого разбора — чёткие советы что практиковать дальше',
    },
    {
      icon: 'trending-up',
      title: 'Рост рейтинга',
      desc: 'Понимание своих ошибок — самый быстрый путь к прогрессу',
    },
    {
      icon: 'zap',
      title: 'Быстрый результат',
      desc: 'Разбор готов в течение 48 часов в удобном формате',
    },
  ],

  pricing: [
    {
      name: 'Базовый',
      price: '1 500 ₽',
      desc: 'Одна партия, ключевые ошибки',
      features: [
        'Анализ 1 партии',
        'Выделение 3–5 ошибок',
        'Текстовый разбор',
        'Рекомендации',
      ],
      highlighted: false,
      cta: 'Выбрать',
    },
    {
      name: 'Полный',
      price: '2 500 ₽',
      desc: 'Глубокий разбор + анализ мышления',
      features: [
        'Анализ 1 партии полностью',
        'Разбор каждого ключевого момента',
        'Анализ типичных ошибок',
        'Рекомендации по дебюту',
        'Ответы на вопросы',
      ],
      highlighted: true,
      cta: 'Выбрать',
    },
    {
      name: 'Пакет × 3',
      price: '6 000 ₽',
      desc: 'Три партии со скидкой',
      features: [
        'Анализ 3 партий',
        'Сравнение ошибок между партиями',
        'Общие выводы о стиле игры',
        'Приоритетный ответ',
      ],
      highlighted: false,
      cta: 'Выбрать',
    },
  ],

  about: {
    name: 'Александр Петров',
    text: [
      'Играю в шахматы 15 лет, рейтинг FIDE 1950. Последние 5 лет помогаю любителям разобраться в своих партиях.',
      'Не работаю тренером — я аналитик. Моя задача не учить вас теории, а помочь понять как именно вы думаете за доской и где это мышление ломается.',
      'Специализируюсь на игроках 500–2000 рейтинга. Именно в этом диапазоне большинство ошибок — не тактические, а логические.',
    ],
  },

  orderList: [
    'Разбор готов за 48 часов',
    'Объяснение на русском языке',
    'Без движковых терминов',
    'Конкретные рекомендации',
  ],

};

// ============================================================
//  РЕНДЕР — HERO STATS
// ============================================================

function renderHeroStats() {
  const el = document.getElementById('hero-stats');
  if (!el) return;
  el.innerHTML = DATA.hero.stats.map(s => `
    <div class="hero__stat">
      <div class="hero__stat-value">${s.value}</div>
      <div class="hero__stat-label">${s.label}</div>
    </div>
  `).join('');
}

// ============================================================
//  РЕНДЕР — ПОДХОД
// ============================================================

function renderApproach() {
  const body = document.getElementById('approach-body');
  if (body) {
    body.innerHTML = DATA.approach.paragraphs
      .map(p => `<p>${p}</p>`)
      .join('');
  }

  const principles = document.getElementById('approach-principles');
  if (principles) {
    principles.innerHTML = DATA.approach.principles.map(p => `
      <div class="principle">
        <span class="principle__num">${p.num}</span>
        <div>
          <div class="principle__title">${p.title}</div>
          <div class="principle__desc">${p.desc}</div>
        </div>
      </div>
    `).join('');
  }
}

// ============================================================
//  РЕНДЕР — РАЗБОРЫ
//  Сначала пробуем загрузить из админки,
//  если нет — показываем заглушки из DATA
// ============================================================

async function loadAndRenderAnalyses() {
  const el = document.getElementById('analysis-cards');
  if (!el) return;

  try {
    const res = await fetch('/api/backend?action=get_index');

    if (res.ok) {
      const analyses = await res.json();

      if (analyses && analyses.length > 0) {
        // Берём последние 3
        const recent = analyses.slice(0, 3);

        el.innerHTML = recent.map(a => `
          <article class="card" style="cursor:pointer"
            onclick="window.location.href='./analysis.html?id=${escHtml(a.id)}'">
            <div class="card__img">
              ${a.coverImage
                ? `<img src="${escHtml(a.coverImage)}" alt="${escHtml(a.title)}" loading="lazy">`
                : `<span class="card__placeholder">♟</span>`
              }
              <div class="card__overlay">
                <span>Смотреть разбор →</span>
              </div>
            </div>
            <div class="card__body">
              <div class="card__tags">
                ${(a.tags || []).map(t =>
                  `<span class="badge badge--sm">${escHtml(t)}</span>`
                ).join('')}
              </div>
              <h3 class="card__title">${escHtml(a.title)}</h3>
              <p class="card__text">${escHtml(a.excerpt || '')}</p>
              <div class="card__footer">
                <span class="card__date">${formatDate(a.date)}</span>
                <span class="card__link accent">Читать →</span>
              </div>
            </div>
          </article>
        `).join('');

        setTimeout(initAnimations, 100);
        return;
      }
    }
  } catch {
    // Файла нет — показываем заглушки
  }

  // Фолбэк — хардкодные заглушки
  renderAnalysesFallback();
}

function renderAnalysesFallback() {
  const el = document.getElementById('analysis-cards');
  if (!el) return;

  el.innerHTML = DATA.analyses.map(a => `
    <article class="card">
      <div class="card__img">
        ${a.img
          ? `<img src="${a.img}" alt="${a.title}" loading="lazy">`
          : `<span class="card__placeholder">♟</span>`
        }
        <div class="card__overlay">
          <span>Смотреть разбор →</span>
        </div>
      </div>
      <div class="card__body">
        <div class="card__tags">
          ${a.tags.map(t =>
            `<span class="badge badge--sm">${t}</span>`
          ).join('')}
        </div>
        <h3 class="card__title">${a.title}</h3>
        <p class="card__text">${a.excerpt}</p>
        <div class="card__footer">
          <span class="card__date">${formatDate(a.date)}</span>
          <span class="card__link accent">Читать →</span>
        </div>
      </div>
    </article>
  `).join('');
}

// ============================================================
//  РЕНДЕР — BENEFITS
// ============================================================

function renderBenefits() {
  const el = document.getElementById('benefits-grid');
  if (!el) return;

  el.innerHTML = DATA.benefits.map(b => `
    <div class="benefit">
      <div class="benefit__icon">
        <i data-lucide="${b.icon}"></i>
      </div>
      <h3 class="benefit__title">${b.title}</h3>
      <p class="benefit__desc">${b.desc}</p>
    </div>
  `).join('');
}

// ============================================================
//  РЕНДЕР — ПРАЙС
// ============================================================

function renderPricing() {
  const el = document.getElementById('pricing-grid');
  if (!el) return;

  el.innerHTML = DATA.pricing.map(p => `
    <div class="price-card ${p.highlighted ? 'price-card--highlight' : ''}">
      ${p.highlighted
        ? '<div class="price-card__badge">Популярное</div>'
        : ''
      }
      <div class="price-card__name">${p.name}</div>
      <div class="price-card__price">${p.price}</div>
      <div class="price-card__desc">${p.desc}</div>
      <ul class="price-card__features">
        ${p.features.map(f => `
          <li>
            <i data-lucide="check"></i>
            ${f}
          </li>
        `).join('')}
      </ul>
      <a href="#order" class="btn ${p.highlighted ? '' : 'btn--outline'} btn--full">
        ${p.cta}
      </a>
    </div>
  `).join('');
}

// ============================================================
//  РЕНДЕР — О СЕБЕ
// ============================================================

function renderAbout() {
  const nameEl = document.getElementById('about-name');
  const textEl = document.getElementById('about-text');

  if (nameEl) nameEl.textContent = DATA.about.name;
  if (textEl) {
    textEl.innerHTML = DATA.about.text
      .map(p => `<p>${p}</p>`)
      .join('');
  }
}

// ============================================================
//  РЕНДЕР — СПИСОК В ФОРМЕ
// ============================================================

function renderOrderList() {
  const el = document.getElementById('order-list');
  if (!el) return;

  el.innerHTML = DATA.orderList.map(item => `
    <li>
      <i data-lucide="check-circle"></i>
      ${item}
    </li>
  `).join('');
}

// ============================================================
//  РЕНДЕР — FOOTER
// ============================================================

function renderFooter() {
  const el = document.getElementById('footer-copy');
  if (el) el.textContent = `© ${new Date().getFullYear()} Все права защищены`;
}

// ============================================================
//  ЗАГРУЗКА ДАННЫХ ИЗ CMS (content.json)
//  Перезаписывает дефолтные данные из DATA
// ============================================================

async function loadCMSData() {
  try {
    // Меняем источник данных на наш API
    const res = await fetch('/api/backend?action=get_meta');
    if (!res.ok) return;
    const cms = await res.json();

    // ── Имя автора ──
    if (cms.name) {
      DATA.about.name = cms.name;
      const nameEl = document.getElementById('about-name');
      if (nameEl) nameEl.textContent = cms.name;
    }

    // ── О себе ──
    if (cms.about) {
      const paragraphs = cms.about
        .split('\n')
        .map(p => p.trim())
        .filter(p => p.length > 0);

      if (paragraphs.length > 0) {
        DATA.about.text = paragraphs;
        const textEl = document.getElementById('about-text');
        if (textEl) {
          textEl.innerHTML = paragraphs
            .map(p => `<p>${p}</p>`)
            .join('');
        }
      }
    }

    // ── Подзаголовок hero ──
    if (cms.subtitle) {
      const subEl = document.getElementById('hero-sub');
      if (subEl) subEl.textContent = cms.subtitle;
    }

    // ── Telegram в подсказке формы ──
    if (cms.telegram) {
      const hint = document.getElementById('contact-hint');
      if (hint) {
        hint.textContent = `Или напиши напрямую: ${cms.telegram}`;
      }
    }

    // ── Excel таблица цен ──
    if (cms.excelTable) {
      const tableEl = document.getElementById('excel-table-block');
      if (tableEl) {
        tableEl.innerHTML = cms.excelTable;
        tableEl.classList.add('has-content');
      }
    }

  } catch {
    // Нет файла или ошибка — оставляем дефолтные данные
  }
}

// ============================================================
//  ФОРМА ЗАКАЗА
// ============================================================

function initForm() {
  const form      = document.getElementById('order-form');
  const success   = document.getElementById('form-success');
  const resetBtn  = document.getElementById('reset-form');
  const submitBtn = document.getElementById('submit-btn');

  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearErrors();

    const data = {
      name:     form.name.value.trim(),
      contact:  form.contact.value.trim(),
      gameLink: form.gameLink.value.trim(),
      comment:  form.comment.value.trim(),
    };

    // ── Валидация ──
    let hasErrors = false;

    if (data.name.length < 2) {
      showFieldError('err-name', 'Введите имя');
      hasErrors = true;
    }

    if (data.contact.length < 3) {
      showFieldError('err-contact', 'Введите Telegram или email');
      hasErrors = true;
    }

    if (!isValidUrl(data.gameLink)) {
      showFieldError('err-gameLink', 'Введите корректную ссылку на партию');
      hasErrors = true;
    } else if (
      !data.gameLink.includes('chess.com') &&
      !data.gameLink.includes('lichess.org')
    ) {
      showFieldError(
        'err-gameLink',
        'Ссылка должна быть с chess.com или lichess.org'
      );
      hasErrors = true;
    }

    if (hasErrors) return;

    // ── Отправка ──
    submitBtn.disabled = true;
    submitBtn.innerHTML = `
      <svg style="width:16px;height:16px;animation:spin 1s linear infinite;
                  vertical-align:middle;margin-right:6px"
           viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10"
          stroke="currentColor" stroke-width="3"
          stroke-dasharray="30 70" stroke-linecap="round"/>
      </svg>
      Отправляю...
    `;

    try {
      const res = await fetch('/api/send-form', { // <-- МЕНЯЕМ АДРЕС ЗДЕСЬ
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(data),
});
      let result;
      try {
        result = await res.json();
      } catch {
        throw new Error('bad_response');
      }

      if (!res.ok || !result.ok) {
        throw new Error(result.error || 'server_error');
      }

      // ── Успех ──
      form.classList.add('hidden');
      success.classList.remove('hidden');
      lucide.createIcons();

    } catch (err) {
      console.error('Form error:', err.message);
      showFieldError(
        'err-global',
        'Что-то пошло не так. Напиши напрямую в Telegram.'
      );
      submitBtn.disabled = false;
      submitBtn.textContent = 'Отправить заявку';
    }
  });

  // Сброс формы
  resetBtn?.addEventListener('click', () => {
    form.reset();
    form.classList.remove('hidden');
    success.classList.add('hidden');
    submitBtn.disabled = false;
    submitBtn.textContent = 'Отправить заявку';
    clearErrors();
  });
}

// ── Хелперы формы ──

function showFieldError(id, msg) {
  const el = document.getElementById(id);
  if (el) el.textContent = msg;
}

function clearErrors() {
  ['err-name', 'err-contact', 'err-gameLink', 'err-global']
    .forEach(id => {
      const el = document.getElementById(id);
      if (el) el.textContent = '';
    });
}

function isValidUrl(str) {
  try { new URL(str); return true; }
  catch { return false; }
}

// ============================================================
//  HEADER — скролл и бургер
// ============================================================

function initHeader() {
  const header = document.getElementById('header');
  const burger = document.getElementById('burger');
  const nav    = document.getElementById('nav');

  // Скролл
  window.addEventListener('scroll', () => {
    header.classList.toggle('header--scrolled', window.scrollY > 20);
  }, { passive: true });

  // Бургер
  burger?.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('nav--open');
    burger.innerHTML = isOpen
      ? '<i data-lucide="x"></i>'
      : '<i data-lucide="menu"></i>';
    lucide.createIcons();
  });

  // Закрываем меню при клике на ссылку
  nav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      nav.classList.remove('nav--open');
      burger.innerHTML = '<i data-lucide="menu"></i>';
      lucide.createIcons();
    });
  });
}

// ============================================================
//  АНИМАЦИИ — Intersection Observer
// ============================================================

function initAnimations() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1 }
  );

  document.querySelectorAll(
    '.card, .benefit, .price-card, .principle, .hero__stat'
  ).forEach(el => {
    el.classList.add('animate');
    observer.observe(el);
  });
}

// ============================================================
//  ХЕЛПЕРЫ
// ============================================================

function formatDate(dateStr) {
  if (!dateStr) return '';
  try {
    return new Date(dateStr).toLocaleDateString('ru-RU', {
      day: 'numeric', month: 'long', year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

function escHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ============================================================
//  ИНИЦИАЛИЗАЦИЯ
// ============================================================

document.addEventListener('DOMContentLoaded', async () => {

  // 1. Рендерим дефолтные данные сразу
  renderHeroStats();
  renderApproach();
  renderBenefits();
  renderPricing();
  renderAbout();
  renderOrderList();
  renderFooter();

  // 2. Загружаем данные из CMS и перезаписываем
  await loadCMSData();

  // 3. Загружаем разборы из админки
  await loadAndRenderAnalyses();

  // 4. Инициализируем функциональность
  initForm();
  initHeader();

  // 5. Иконки Lucide (после рендера всего контента)
  lucide.createIcons();

  // 6. Анимации
  setTimeout(initAnimations, 150);
});
