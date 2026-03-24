// ============================================================
//  CONFIG
// ============================================================

const CFG = {
  saveUrl:    './save.php',
  dataUrl:    '../data/analyses/',
  indexUrl:   '../data/analyses/index.json',
  metaUrl:    '../data/content.json',
  sessionKey: 'chess_admin_token',
};

const TAGS = [
  'Дебют','Миттельшпиль','Эндшпиль',
  'Тактика','Стратегия','Ошибки','Атака','Защита'
];

const COLORS = ['#C8A96E','#f87171','#4ade80','#60a5fa','#ffffff'];

// ============================================================
//  STATE
// ============================================================

let state = {
  token:        null,
  analyses:     [],
  current:      null,
  blocks:       [],
  selectedTags: [],
  blockCounter: 0,
  dragSrc:      null,
};

const boardState = {};
const _drawStarts = {};

// ============================================================
//  INIT
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
  const token = sessionStorage.getItem(CFG.sessionKey);
  if (token) {
    state.token = token;
    initApp();
  }
  document.getElementById('pwd-input')
    .addEventListener('keydown', e => { if (e.key === 'Enter') doLogin(); });
});

async function initApp() {
  document.getElementById('screen-auth').style.display = 'none';
  document.getElementById('app').style.display = 'flex';
  renderTags();
  await loadAnalysesList();
  await loadMeta();
  showScreen('list');
}

// ============================================================
//  AUTH
// ============================================================

async function doLogin() {
  const pwd = document.getElementById('pwd-input').value;
  const err = document.getElementById('auth-err');
  err.textContent = '';
  try {
    const res = await api('auth', { password: pwd });
    if (res.ok) {
      state.token = res.token;
      sessionStorage.setItem(CFG.sessionKey, res.token);
      initApp();
    } else {
      err.textContent = 'Неверный пароль';
      document.getElementById('pwd-input').value = '';
    }
  } catch {
    err.textContent = 'Нет связи с сервером';
  }
}

function doLogout() {
  sessionStorage.removeItem(CFG.sessionKey);
  state.token = null;
  document.getElementById('app').style.display = 'none';
  document.getElementById('screen-auth').style.display = 'flex';
  document.getElementById('pwd-input').value = '';
}

// ============================================================
//  SCREENS
// ============================================================

function showScreen(name) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(`screen-${name}`).classList.add('active');
  document.querySelectorAll('.sidebar__btn').forEach(b => b.classList.remove('active'));
  const btn = document.getElementById(`nav-${name}`);
  if (btn) btn.classList.add('active');
  if (name === 'list') renderAnalysesList();
}

// ============================================================
//  ANALYSES LIST
// ============================================================

async function loadAnalysesList() {
  try {
    const res = await fetch(CFG.indexUrl + '?t=' + Date.now());
    if (!res.ok) { state.analyses = []; return; }
    state.analyses = await res.json();
  } catch {
    state.analyses = [];
  }
}

function renderAnalysesList() {
  const grid = document.getElementById('analyses-grid');

  if (!state.analyses.length) {
    grid.innerHTML = `
      <div class="empty" style="grid-column:1/-1">
        <h3>Разборов пока нет</h3>
        <p>Создай первый разбор</p>
        <button class="btn btn--primary" onclick="newAnalysis()">+ Создать</button>
      </div>`;
  } else {
    grid.innerHTML = state.analyses.map(a => `
      <div class="analysis-card" onclick="editAnalysis('${a.id}')">
        <div class="analysis-card__title">${esc(a.title)}</div>
        <div class="analysis-card__meta">${formatDate(a.date)} · ${a.blocks||0} блоков</div>
        <div class="analysis-card__tags">
          ${(a.tags||[]).map(t =>
            `<span class="tag selected" style="font-size:0.65rem">${esc(t)}</span>`
          ).join('')}
        </div>
        <div class="analysis-card__actions">
          <button class="btn btn--outline btn--sm"
            onclick="event.stopPropagation();editAnalysis('${a.id}')">
            Редактировать
          </button>
          <button class="btn btn--danger btn--sm"
            onclick="event.stopPropagation();deleteAnalysisById('${a.id}')">
            Удалить
          </button>
        </div>
      </div>
    `).join('');
  }

  const sideList = document.getElementById('sidebar-analyses');
  sideList.innerHTML = state.analyses.length
    ? state.analyses.map(a => `
        <div class="analysis-item ${state.current?.id===a.id?'active':''}"
          onclick="editAnalysis('${a.id}')">
          <span class="analysis-item__title">${esc(a.title)}</span>
          <button class="analysis-item__del"
            onclick="event.stopPropagation();deleteAnalysisById('${a.id}')">✕</button>
        </div>
      `).join('')
    : '<div style="padding:0.75rem 1rem;font-size:0.75rem;color:var(--text-muted)">Пусто</div>';
}

// ============================================================
//  NEW ANALYSIS
// ============================================================

function newAnalysis() {
  state.current      = null;
  state.blocks       = [];
  state.selectedTags = [];
  state.blockCounter = 0;

  document.getElementById('f-title').value   = '';
  document.getElementById('f-excerpt').value = '';
  document.getElementById('editor-title').textContent = 'Новый разбор';
  document.getElementById('btn-delete').style.display = 'none';

  renderTags();
  renderBlocks();

  addBlock('text');
  addBlock('position');
  addBlock('text');

  showScreen('editor');
  document.getElementById('nav-editor').classList.add('active');
}

// ============================================================
//  EDIT ANALYSIS
// ============================================================

async function editAnalysis(id) {
  try {
    const res = await fetch(`${CFG.dataUrl}${id}.json?t=` + Date.now());
    if (!res.ok) throw new Error();
    const data = await res.json();

    state.current      = data;
    state.blocks       = data.blocks || [];
    state.selectedTags = data.tags   || [];
    state.blockCounter = state.blocks.length;

    document.getElementById('f-title').value   = data.title   || '';
    document.getElementById('f-excerpt').value = data.excerpt || '';
    document.getElementById('editor-title').textContent = data.title || 'Разбор';
    document.getElementById('btn-delete').style.display = 'block';

    renderTags();
    renderBlocks();

    setTimeout(() => {
      state.blocks.forEach(block => {
        if (block.type === 'position') {
          initBoard(block.id, {
            position:    block.boardPosition    || {},
            annotations: block.boardAnnotations || [],
            orientation: block.boardOrientation || 'white',
            fen:         block.fen              || '',
          });
        }
      });
    }, 200);

    showScreen('editor');
    document.getElementById('nav-editor').classList.add('active');
    renderAnalysesList();
  } catch {
    showStatus('Не удалось загрузить разбор', 'err');
  }
}

// ============================================================
//  TAGS
// ============================================================

function renderTags() {
  const wrap = document.getElementById('tags-wrap');
  if (!wrap) return;
  wrap.innerHTML = TAGS.map(tag => `
    <span class="tag ${state.selectedTags.includes(tag)?'selected':''}"
      onclick="toggleTag('${tag}')">${esc(tag)}</span>
  `).join('');
}

function toggleTag(tag) {
  state.selectedTags = state.selectedTags.includes(tag)
    ? state.selectedTags.filter(t => t !== tag)
    : [...state.selectedTags, tag];
  renderTags();
}

// ============================================================
//  BLOCKS RENDER
// ============================================================

function renderBlocks() {
  const list = document.getElementById('blocks-list');
  list.innerHTML = '';
  state.blocks.forEach(block => list.appendChild(createBlockEl(block)));
  initDragDrop();
}

function createBlockEl(block) {
  const el = document.createElement('div');
  el.className = `block block--${block.type}`;
  el.dataset.id = block.id;
  el.draggable = true;

  const labels = { text:'📝 Текст', position:'♟ Позиция', conclusion:'💡 Вывод' };

  el.innerHTML = `
    <div class="block__header">
      <span class="block__drag">⠿</span>
      <span class="block__type">${labels[block.type]}</span>
      <button class="block__del" onclick="removeBlock('${block.id}')">✕</button>
    </div>
    <div class="block__body" id="body-${block.id}">
      ${renderBlockBody(block)}
    </div>
  `;
  return el;
}

function renderBlockBody(block) {

  if (block.type === 'text') {
    return `
      <textarea
        style="width:100%;background:var(--bg-alt);border:1px solid var(--border);
               border-radius:4px;padding:0.65rem 0.875rem;color:var(--text);
               font-size:0.875rem;outline:none;resize:vertical;min-height:100px;
               font-family:inherit;line-height:1.6;"
        placeholder="Напиши текст анализа..."
        oninput="updateBlockData('${block.id}','text',this.value)"
      >${esc(block.text||'')}</textarea>`;
  }

  if (block.type === 'conclusion') {
    return `
      <textarea
        style="width:100%;background:var(--bg-alt);border:1px solid rgba(74,222,128,0.3);
               border-radius:4px;padding:0.65rem 0.875rem;color:var(--text);
               font-size:0.875rem;outline:none;resize:vertical;min-height:80px;
               font-family:inherit;line-height:1.6;"
        placeholder="Итог и рекомендации..."
        oninput="updateBlockData('${block.id}','text',this.value)"
      >${esc(block.text||'')}</textarea>`;
  }

  if (block.type === 'position') {
    const bid = block.id;
    const colorBtns = COLORS.map(c => `
      <div class="color-btn ${c==='#C8A96E'?'active':''}"
        style="background:${c}"
        id="color-${bid}-${c.replace('#','')}"
        onclick="setBoardColor('${bid}','${c}')"></div>
    `).join('');
  
    const markerDefs = COLORS.map(c => `
      <marker id="m-${c.replace('#','')}-${bid}"
        markerWidth="5" markerHeight="5" refX="4" refY="2.5" orient="auto">
        <path d="M0,0 L0,5 L5,2.5 z" fill="${c}"/>
      </marker>
    `).join('');

    return `
      <div class="position-wrap">
        <div class="board-outer">

          <!-- РЕЖИМЫ -->
          <div class="mode-tabs">
            <div class="mode-tab active" id="mtab-fen-${bid}"
              onclick="setBoardMode('${bid}','fen')">📋 FEN</div>
            <div class="mode-tab" id="mtab-edit-${bid}"
              onclick="setBoardMode('${bid}','edit')">✋ Расстановка</div>
            <div class="mode-tab" id="mtab-draw-${bid}"
              onclick="setBoardMode('${bid}','draw')">✏️ Рисование</div>
          </div>

          <!-- ПАНЕЛЬ FEN -->
          <div id="panel-fen-${bid}" class="tool-group" style="margin-bottom:0.5rem">
            <div class="tool-group__label">Вставь FEN из Lichess / Chess.com</div>
            <input type="text" class="fen-input" id="fen-input-${bid}"
              placeholder="rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
              value="${esc(block.fen||'')}"
            />
            <div style="display:flex;gap:0.4rem;margin-top:0.5rem;flex-wrap:wrap">
              <button class="tool-btn" onclick="boardSetStart('${bid}')">♟ Старт</button>
              <button class="tool-btn" onclick="boardClear('${bid}')">🗑 Очистить</button>
              <button class="tool-btn" onclick="boardFlip('${bid}')">🔄 Перевернуть</button>
            </div>
          </div>

          <!-- ПАНЕЛЬ РАССТАНОВКИ -->
          <div id="panel-edit-${bid}" class="tool-group"
            style="display:none;margin-bottom:0.5rem">

            <div class="tool-group__label">Выбери фигуру → кликни на клетку</div>

            <div style="font-size:0.65rem;color:var(--text-muted);margin-bottom:0.3rem;
                        text-transform:uppercase;letter-spacing:0.06em">Белые</div>
            <div class="pieces-panel" style="margin-bottom:0.6rem">
              <div class="piece-btn active" id="pb-wK-${bid}"
                onclick="selectPiece('${bid}','wK')" title="Король">♔</div>
              <div class="piece-btn" id="pb-wQ-${bid}"
                onclick="selectPiece('${bid}','wQ')" title="Ферзь">♕</div>
              <div class="piece-btn" id="pb-wR-${bid}"
                onclick="selectPiece('${bid}','wR')" title="Ладья">♖</div>
              <div class="piece-btn" id="pb-wB-${bid}"
                onclick="selectPiece('${bid}','wB')" title="Слон">♗</div>
              <div class="piece-btn" id="pb-wN-${bid}"
                onclick="selectPiece('${bid}','wN')" title="Конь">♘</div>
              <div class="piece-btn" id="pb-wP-${bid}"
                onclick="selectPiece('${bid}','wP')" title="Пешка">♙</div>
            </div>

            <div style="font-size:0.65rem;color:var(--text-muted);margin-bottom:0.3rem;
                        text-transform:uppercase;letter-spacing:0.06em">Чёрные</div>
            <div class="pieces-panel" style="margin-bottom:0.6rem">
              <div class="piece-btn" id="pb-bK-${bid}"
                onclick="selectPiece('${bid}','bK')" title="Король">♚</div>
              <div class="piece-btn" id="pb-bQ-${bid}"
                onclick="selectPiece('${bid}','bQ')" title="Ферзь">♛</div>
              <div class="piece-btn" id="pb-bR-${bid}"
                onclick="selectPiece('${bid}','bR')" title="Ладья">♜</div>
              <div class="piece-btn" id="pb-bB-${bid}"
                onclick="selectPiece('${bid}','bB')" title="Слон">♝</div>
              <div class="piece-btn" id="pb-bN-${bid}"
                onclick="selectPiece('${bid}','bN')" title="Конь">♞</div>
              <div class="piece-btn" id="pb-bP-${bid}"
                onclick="selectPiece('${bid}','bP')" title="Пешка">♟</div>
            </div>

            <div class="piece-btn erase-btn" id="pb-clear-${bid}"
              onclick="selectPiece('${bid}','clear')">
              ✕ Стереть фигуру
            </div>
          </div>

          <!-- ПАНЕЛЬ РИСОВАНИЯ -->
          <div id="panel-draw-${bid}" class="tool-group"
            style="display:none;margin-bottom:0.5rem">
            <div class="tool-group__label">Инструмент</div>
            <div class="tool-btns" style="margin-bottom:0.6rem">
              <button class="tool-btn active" id="dtool-arrow-${bid}"
                onclick="setBoardTool('${bid}','arrow')">→ Стрелка</button>
              <button class="tool-btn" id="dtool-highlight-${bid}"
                onclick="setBoardTool('${bid}','highlight')">■ Клетка</button>
              <button class="tool-btn" id="dtool-circle-${bid}"
                onclick="setBoardTool('${bid}','circle')">○ Круг</button>
            </div>
            <div class="tool-group__label">Цвет</div>
            <div class="color-btns" style="margin-bottom:0.6rem">${colorBtns}</div>
            <div class="tool-btns">
              <button class="tool-btn"
                onclick="boardUndoAnnotation('${bid}')">↩ Отмена</button>
              <button class="tool-btn"
                onclick="boardClearAnnotations('${bid}')">🗑 Очистить</button>
            </div>
          </div>

          <!-- ДОСКА + SVG -->
          <div class="board-container" id="board-container-${bid}"
            style="position:relative;user-select:none">
            <div id="board-${bid}" style="width:100%"></div>
            <svg class="arrows-svg" id="board-svg-${bid}"
              viewBox="0 0 480 480"
              xmlns="http://www.w3.org/2000/svg"
              style="position:absolute;top:0;left:0;width:100%;height:100%;
                     pointer-events:none;z-index:10">
              <defs>${markerDefs}</defs>
              <g id="svg-highlights-${bid}"></g>
              <g id="svg-arrows-${bid}"></g>
              <g id="svg-circles-${bid}"></g>
            </svg>
          </div>

        </div>

        <!-- ПРАВАЯ ПАНЕЛЬ -->
        <div class="canvas-tools">
          <div class="tool-group">
            <div class="tool-group__label">Подпись хода</div>
            <input type="text"
              style="width:100%;background:var(--bg);border:1px solid var(--border);
                     border-radius:4px;padding:0.5rem 0.7rem;color:var(--text);
                     font-size:0.82rem;outline:none;font-family:inherit;"
              placeholder="Например: 20.Фxh7+"
              value="${esc(block.caption||'')}"
              oninput="updateBlockData('${block.id}','caption',this.value)"
            />
          </div>

          <div class="tool-group">
            <div style="display:flex;align-items:center;gap:0.5rem">
              <input type="checkbox" id="key-${bid}"
                ${block.isKey?'checked':''}
                onchange="updateBlockData('${bid}','isKey',this.checked)"
                style="accent-color:var(--accent);width:14px;height:14px"
              />
              <label for="key-${bid}"
                style="font-size:0.78rem;color:var(--text-sec);cursor:pointer">
                ⭐ Ключевой момент
              </label>
            </div>
          </div>

          <div class="tool-group">
            <div class="tool-group__label">Текущий FEN
              <span style="font-size:0.6rem;color:var(--text-muted)">
                (нажми чтобы скопировать)
              </span>
            </div>
            <div id="fen-display-${bid}"
              onclick="copyFEN('${bid}')"
              style="font-size:0.65rem;color:var(--text-muted);word-break:break-all;
                     line-height:1.5;font-family:monospace;cursor:pointer;
                     padding:0.4rem;background:var(--bg);border-radius:2px">—</div>
          </div>
        </div>
      </div>
    `;
  }

  return '';
}

// ============================================================
//  BLOCKS MANAGEMENT
// ============================================================

function addBlock(type) {
  const id = `b_${Date.now()}_${state.blockCounter++}`;
  const block = {
    id, type,
    text: '', caption: '',
    isKey: false,
    fen: '',
    boardPosition:    {},
    boardAnnotations: [],
    boardOrientation: 'white',
  };

  state.blocks.push(block);

  const list = document.getElementById('blocks-list');
  const el   = createBlockEl(block);
  list.appendChild(el);
  initDragDrop();

  if (type === 'position') {
    setTimeout(() => initBoard(id, {
      position: {}, annotations: [], orientation: 'white', fen: '',
    }), 150);
  }

  el.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function removeBlock(id) {
  if (!confirm('Удалить блок?')) return;
  state.blocks = state.blocks.filter(b => b.id !== id);
  document.querySelector(`.block[data-id="${id}"]`)?.remove();
  if (boardState[id]) {
    try { boardState[id].board?.destroy(); } catch {}
    delete boardState[id];
  }
}

function updateBlockData(id, key, value) {
  const block = state.blocks.find(b => b.id === id);
  if (block) block[key] = value;
}

// ============================================================
//  DRAG & DROP BLOCKS
// ============================================================

function initDragDrop() {
  document.querySelectorAll('.block').forEach(block => {
    block.addEventListener('dragstart', e => {
      state.dragSrc = block;
      e.dataTransfer.effectAllowed = 'move';
      setTimeout(() => block.style.opacity = '0.4', 0);
    });
    block.addEventListener('dragend', () => {
      block.style.opacity = '1';
      block.style.borderColor = '';
      const ids = [...document.querySelectorAll('.block')].map(el => el.dataset.id);
      state.blocks.sort((a,b) => ids.indexOf(a.id) - ids.indexOf(b.id));
    });
    block.addEventListener('dragover',  e => e.preventDefault());
    block.addEventListener('dragenter', () => {
      if (block !== state.dragSrc) block.style.borderColor = 'var(--accent)';
    });
    block.addEventListener('dragleave', () => block.style.borderColor = '');
    block.addEventListener('drop', e => {
      e.preventDefault();
      block.style.borderColor = '';
      if (!state.dragSrc || block === state.dragSrc) return;
      const list = document.getElementById('blocks-list');
      const all  = [...list.querySelectorAll('.block')];
      if (all.indexOf(state.dragSrc) < all.indexOf(block)) block.after(state.dragSrc);
      else block.before(state.dragSrc);
    });
  });
}

// ============================================================
//  BOARD — INIT
// ============================================================

function initBoard(blockId, savedData) {
  const el = document.getElementById(`board-${blockId}`);
  if (!el) {
    setTimeout(() => initBoard(blockId, savedData), 100);
    return;
  }

  // Уничтожаем старую доску
  if (boardState[blockId]?.board) {
    try { boardState[blockId].board.destroy(); } catch {}
  }

  el.innerHTML = '';

  const pos         = savedData.position    || {};
  const annotations = savedData.annotations || [];
  const orientation = savedData.orientation || 'white';
  const fen         = savedData.fen         || '';

  boardState[blockId] = {
    board:         null,
    position:      pos,
    annotations:   [...annotations],
    mode:          'fen',
    tool:          'arrow',
    color:         '#C8A96E',
    selectedPiece: 'wK',
    orientation,
  };

  let startPos = 'start';
  if (fen) {
    startPos = fen.split(' ')[0];
  } else if (Object.keys(pos).length > 0) {
    startPos = pos;
  }

  boardState[blockId].board = Chessboard(`board-${blockId}`, {
    position:    startPos,
    orientation,
    pieceTheme:  '/img/chesspieces/wikipedia/{piece}.png',
    draggable:   false,
  });

  boardState[blockId].position = boardState[blockId].board.position();

  // Запрещаем drag картинок
  disableBoardDrag(blockId);

  if (fen) {
    const inp = document.getElementById(`fen-input-${blockId}`);
    if (inp) inp.value = fen;
  }

  // FEN input listener
  const fenInp = document.getElementById(`fen-input-${blockId}`);
  if (fenInp) {
    fenInp.addEventListener('input', () => applyFEN(blockId, fenInp.value));
  }

  updateFENDisplay(blockId);
  initBoardEvents(blockId);

  if (annotations.length > 0) {
    setTimeout(() => redrawBoardAnnotations(blockId), 200);
  }

  syncBoard(blockId);
}

// ============================================================
//  DISABLE BOARD IMAGE DRAG
// ============================================================

function disableBoardDrag(blockId) {
  setTimeout(() => {
    const boardEl = document.getElementById(`board-${blockId}`);
    if (!boardEl) return;
    boardEl.querySelectorAll('img').forEach(img => {
      img.draggable = false;
      img.style.userSelect = 'none';
      img.style.pointerEvents = 'none';
      img.addEventListener('dragstart', e => e.preventDefault());
    });
    boardEl.style.userSelect = 'none';
  }, 200);
}

// ============================================================
//  BOARD — EVENTS
// ============================================================

function initBoardEvents(blockId) {
  const svg = document.getElementById(`board-svg-${blockId}`);
  const container = document.getElementById(`board-container-${blockId}`);
  if (!svg || !container) return;

  // СОХРАНЯЕМ ссылку на доску ДО того, как она исчезнет из документа
  const boardEl = document.getElementById(`board-${blockId}`);

  // Удаляем старые обработчики через клонирование SVG
  const newSvg = svg.cloneNode(true);
  svg.parentNode.replaceChild(newSvg, svg);

  // SVG события для рисования
  newSvg.addEventListener('mousedown', e => {
    const bs = boardState[blockId];
    if (!bs || bs.mode !== 'draw') return;
    e.preventDefault();

    const sq = getSquareFromPoint(e.clientX, e.clientY, blockId);
    if (!sq) return;

    if (bs.tool === 'highlight') {
      toggleHighlight(blockId, sq);
    } else {
      _drawStarts[blockId] = sq;
    }
  });

  newSvg.addEventListener('mouseup', e => {
    const bs     = boardState[blockId];
    const fromSq = _drawStarts[blockId];
    if (!bs || bs.mode !== 'draw' || !fromSq) return;

    _drawStarts[blockId] = null;
    const sq = getSquareFromPoint(e.clientX, e.clientY, blockId);
    if (!sq) return;

    if (bs.tool === 'arrow' && sq !== fromSq) {
      bs.annotations.push({ type:'arrow', from:fromSq, to:sq, color:bs.color });
      redrawBoardAnnotations(blockId);
      syncBoard(blockId);
    } else if (bs.tool === 'circle') {
      bs.annotations.push({ type:'circle', square:fromSq, color:bs.color });
      redrawBoardAnnotations(blockId);
      syncBoard(blockId);
    }
  });

  // Клики для расстановки — на контейнере
  const newContainer = container.cloneNode(false);
  container.parentNode.replaceChild(newContainer, container);
  
  // Добавляем уже сохраненный boardEl обратно
  if (boardEl) newContainer.appendChild(boardEl);
  newContainer.appendChild(newSvg);

  newContainer.addEventListener('click', e => {
    const bs = boardState[blockId];
    if (!bs || bs.mode !== 'edit') return;
    const sq = getSquareFromPoint(e.clientX, e.clientY, blockId);
    if (!sq) return;
    placeOrRemovePiece(blockId, sq);
  });
}

// ============================================================
//  GET SQUARE FROM COORDINATES
// ============================================================

function getSquareFromPoint(clientX, clientY, blockId) {
  const boardEl = document.getElementById(`board-${blockId}`);
  if (!boardEl) return null;

  // Используем внутренний table доски для точного rect
  const inner = boardEl.querySelector('table') ||
                boardEl.querySelector('.board-b72b1') ||
                boardEl;
  const rect  = inner.getBoundingClientRect();

  const x = clientX - rect.left;
  const y = clientY - rect.top;

  if (x < 0 || y < 0 || x > rect.width || y > rect.height) return null;

  const bs      = boardState[blockId];
  const flipped = bs?.orientation === 'black';

  let col = Math.max(0, Math.min(7, Math.floor(x / (rect.width  / 8))));
  let row = Math.max(0, Math.min(7, Math.floor(y / (rect.height / 8))));

  if (flipped) { col = 7-col; row = 7-row; }

  const files = ['a','b','c','d','e','f','g','h'];
  const ranks = ['8','7','6','5','4','3','2','1'];

  return files[col] + ranks[row];
}

// ============================================================
//  BOARD — EDIT MODE
// ============================================================

function placeOrRemovePiece(blockId, square) {
  const bs = boardState[blockId];
  if (!bs?.board) return;

  const pos = { ...bs.board.position() };

  if (bs.selectedPiece === 'clear') {
    delete pos[square];
  } else {
    pos[square] = bs.selectedPiece;
  }

  bs.board.position(pos, false);
  bs.position = { ...pos };
  updateFENDisplay(blockId);
  syncBoard(blockId);

  // Запрещаем drag снова после обновления
  disableBoardDrag(blockId);
}

// ============================================================
//  BOARD — DRAW MODE
// ============================================================

function toggleHighlight(blockId, square) {
  const bs = boardState[blockId];
  if (!bs) return;

  const idx = bs.annotations.findIndex(
    a => a.type === 'highlight' && a.square === square
  );

  if (idx !== -1) bs.annotations.splice(idx, 1);
  else bs.annotations.push({ type:'highlight', square, color:bs.color });

  redrawBoardAnnotations(blockId);
  syncBoard(blockId);
}

// ============================================================
//  BOARD — SVG ANNOTATIONS
// ============================================================

function sqToXY(square, blockId) {
  const bs      = boardState[blockId];
  const flipped = bs?.orientation === 'black';
  const files   = ['a','b','c','d','e','f','g','h'];
  const col     = files.indexOf(square[0]);
  const row     = 8 - parseInt(square[1]);
  const c       = flipped ? 7-col : col;
  const r       = flipped ? 7-row : row;
  const cell    = 60;

  return {
    x:    c * cell + cell / 2,
    y:    r * cell + cell / 2,
    cx:   c * cell,
    cy:   r * cell,
    cell,
  };
}

function redrawBoardAnnotations(blockId) {
  const bs = boardState[blockId];
  if (!bs) return;

  const gH = document.getElementById(`svg-highlights-${blockId}`);
  const gA = document.getElementById(`svg-arrows-${blockId}`);
  const gC = document.getElementById(`svg-circles-${blockId}`);
  if (!gH || !gA || !gC) return;

  gH.innerHTML = '';
  gA.innerHTML = '';
  gC.innerHTML = '';

  bs.annotations.forEach(ann => {

    if (ann.type === 'highlight') {
      const p    = sqToXY(ann.square, blockId);
      const rect = mkSVGEl('rect');
      rect.setAttribute('x',       p.cx);
      rect.setAttribute('y',       p.cy);
      rect.setAttribute('width',   p.cell);
      rect.setAttribute('height',  p.cell);
      rect.setAttribute('fill',    ann.color || '#C8A96E');
      rect.setAttribute('opacity', '0.65');
      gH.appendChild(rect);
    }

    if (ann.type === 'arrow') {
      const from  = sqToXY(ann.from, blockId);
      const to    = sqToXY(ann.to,   blockId);
      const color = ann.color || '#C8A96E';
      const mid   = color.replace('#','');

      const dx  = to.x - from.x;
      const dy  = to.y - from.y;
      const len = Math.hypot(dx, dy);
      if (len < 1) return;

      const line = mkSVGEl('line');
      line.setAttribute('x1', from.x);
      line.setAttribute('y1', from.y);
      line.setAttribute('x2', to.x - (dx/len) * 20);
      line.setAttribute('y2', to.y - (dy/len) * 20);
      line.setAttribute('stroke',         color);
      line.setAttribute('stroke-width',   '7');
      line.setAttribute('stroke-linecap', 'round');
      line.setAttribute('opacity',        '0.9');
      line.setAttribute('marker-end',     `url(#m-${mid}-${blockId})`);
      gA.appendChild(line);
    }

    if (ann.type === 'circle') {
      const p      = sqToXY(ann.square, blockId);
      const circle = mkSVGEl('circle');
      circle.setAttribute('cx',           p.x);
      circle.setAttribute('cy',           p.y);
      circle.setAttribute('r',            p.cell/2 - 4);
      circle.setAttribute('fill',         'none');
      circle.setAttribute('stroke',       ann.color || '#C8A96E');
      circle.setAttribute('stroke-width', '8');
      circle.setAttribute('opacity',      '0.9');
      gC.appendChild(circle);
    }
  });
}

function mkSVGEl(tag) {
  return document.createElementNS('http://www.w3.org/2000/svg', tag);
}

// ============================================================
//  BOARD — MODE / TOOL / COLOR
// ============================================================

function setBoardMode(blockId, mode) {
  const bs = boardState[blockId];
  if (!bs) return;

  bs.mode = mode;

  // Табы
  ['fen','edit','draw'].forEach(m => {
    document.getElementById(`mtab-${m}-${blockId}`)
      ?.classList.toggle('active', m === mode);
    const panel = document.getElementById(`panel-${m}-${blockId}`);
    if (panel) panel.style.display = m === mode ? 'block' : 'none';
  });

  // SVG pointer-events
  const svg = document.getElementById(`board-svg-${blockId}`);
  if (svg) svg.style.pointerEvents = mode === 'draw' ? 'all' : 'none';

 // Пересоздаём доску
  const pos = bs.board ? { ...bs.board.position() } : { ...bs.position };

  if (bs.board) {
    try { bs.board.destroy(); } catch {}
    bs.board = null;
  }

  const boardEl = document.getElementById(`board-${blockId}`);
  
  // Создаем Chessboard ТОЛЬКО если контейнер реально существует
  if (boardEl) {
    boardEl.innerHTML = '';
    
    // Передаем напрямую DOM-ноду, это защищает от багов селектора jQuery внутри chessboard.js
    bs.board = Chessboard(boardEl, {
      position:     Object.keys(pos).length > 0 ? pos : 'start',
      orientation:  bs.orientation,
      pieceTheme:   '/img/chesspieces/wikipedia/{piece}.png',
      draggable:    mode === 'edit',
      dropOffBoard: 'trash',
      onDrop: (src, tgt) => {
        if (tgt === 'offboard') {
          setTimeout(() => {
            if (bs.board) bs.position = { ...bs.board.position() };
            updateFENDisplay(blockId);
            syncBoard(blockId);
          }, 50);
        }
      },
      onSnapEnd: () => {
        if (bs.board) bs.position = { ...bs.board.position() };
        updateFENDisplay(blockId);
        syncBoard(blockId);
        disableBoardDrag(blockId);
      },
    });

    if (bs.board) {
      bs.position = { ...bs.board.position() };
    }
  }

  disableBoardDrag(blockId);

  setTimeout(() => {
    redrawBoardAnnotations(blockId);
    initBoardEvents(blockId);
  }, 150);
}

function setBoardTool(blockId, tool) {
  const bs = boardState[blockId];
  if (!bs) return;
  bs.tool = tool;
  ['arrow','highlight','circle'].forEach(t => {
    document.getElementById(`dtool-${t}-${blockId}`)
      ?.classList.toggle('active', t === tool);
  });
}

function setBoardColor(blockId, color) {
  const bs = boardState[blockId];
  if (!bs) return;
  bs.color = color;
  document.querySelectorAll(`[id^="color-${blockId}-"]`)
    .forEach(b => b.classList.remove('active'));
  document.getElementById(`color-${blockId}-${color.replace('#','')}`)
    ?.classList.add('active');
}

function selectPiece(blockId, piece) {
  const bs = boardState[blockId];
  if (!bs) return;
  bs.selectedPiece = piece;
  document.querySelectorAll(`[id^="pb-"][id$="-${blockId}"]`)
    .forEach(el => el.classList.remove('active'));
  document.getElementById(`pb-${piece}-${blockId}`)
    ?.classList.add('active');
}

// ============================================================
//  BOARD — FEN
// ============================================================

function applyFEN(blockId, fen) {
  const bs  = boardState[blockId];
  const inp = document.getElementById(`fen-input-${blockId}`);
  if (!bs?.board || !fen.trim()) return;

  const part = fen.trim().split(' ')[0];
  if (!part.includes('/')) {
    inp?.classList.add('fen-error');
    return;
  }

  try {
    bs.board.position(part, false);
    bs.position = { ...bs.board.position() };
    updateBlockData(blockId, 'fen', fen.trim());
    updateFENDisplay(blockId);
    syncBoard(blockId);
    disableBoardDrag(blockId);
    inp?.classList.remove('fen-error');
    inp?.classList.add('fen-ok');
    setTimeout(() => inp?.classList.remove('fen-ok'), 800);
  } catch {
    inp?.classList.add('fen-error');
  }
}

function boardSetStart(blockId) {
  const bs  = boardState[blockId];
  const inp = document.getElementById(`fen-input-${blockId}`);
  if (!bs?.board) return;
  bs.board.start(false);
  bs.position = { ...bs.board.position() };
  const fenStr = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
  if (inp) inp.value = fenStr;
  updateBlockData(blockId, 'fen', fenStr);
  updateFENDisplay(blockId);
  syncBoard(blockId);
  disableBoardDrag(blockId);
}

function boardClear(blockId) {
  const bs  = boardState[blockId];
  const inp = document.getElementById(`fen-input-${blockId}`);
  if (!bs?.board) return;
  bs.board.clear(false);
  bs.position = {};
  if (inp) inp.value = '';
  updateBlockData(blockId, 'fen', '');
  updateFENDisplay(blockId);
  syncBoard(blockId);
}

function boardFlip(blockId) {
  const bs = boardState[blockId];
  if (!bs?.board) return;
  bs.board.flip();
  bs.orientation = bs.orientation === 'white' ? 'black' : 'white';
  setTimeout(() => redrawBoardAnnotations(blockId), 100);
  syncBoard(blockId);
}

function updateFENDisplay(blockId) {
  const bs = boardState[blockId];
  if (!bs?.board) return;
  const fen = posToFEN(bs.board.position());
  const el  = document.getElementById(`fen-display-${blockId}`);
  if (el) el.textContent = fen || '—';
}

function copyFEN(blockId) {
  const el = document.getElementById(`fen-display-${blockId}`);
  if (!el || el.textContent === '—') return;
  navigator.clipboard.writeText(el.textContent)
    .then(() => showStatus('FEN скопирован', 'ok'));
}

function posToFEN(pos) {
  const files = ['a','b','c','d','e','f','g','h'];
  const ranks = ['8','7','6','5','4','3','2','1'];
  const map   = {
    wK:'K',wQ:'Q',wR:'R',wB:'B',wN:'N',wP:'P',
    bK:'k',bQ:'q',bR:'r',bB:'b',bN:'n',bP:'p',
  };
  return ranks.map(rank => {
    let empty = 0, row = '';
    files.forEach(file => {
      const p = pos[file+rank];
      if (p) { if (empty) { row+=empty; empty=0; } row+=map[p]||'?'; }
      else   { empty++; }
    });
    if (empty) row += empty;
    return row;
  }).join('/');
}

// ============================================================
//  BOARD — ANNOTATIONS UNDO/CLEAR
// ============================================================

function boardUndoAnnotation(blockId) {
  const bs = boardState[blockId];
  if (!bs || !bs.annotations.length) return;
  bs.annotations.pop();
  redrawBoardAnnotations(blockId);
  syncBoard(blockId);
}

function boardClearAnnotations(blockId) {
  if (!confirm('Очистить все аннотации?')) return;
  const bs = boardState[blockId];
  if (!bs) return;
  bs.annotations = [];
  redrawBoardAnnotations(blockId);
  syncBoard(blockId);
}

// ============================================================
//  BOARD — SYNC
// ============================================================

function syncBoard(blockId) {
  const bs = boardState[blockId];
  if (!bs) return;
  updateBlockData(blockId, 'boardPosition',    bs.position);
  updateBlockData(blockId, 'boardAnnotations', bs.annotations);
  updateBlockData(blockId, 'boardOrientation', bs.orientation);
}

// ============================================================
//  SAVE ANALYSIS
// ============================================================

async function saveAnalysis() {
  const title = document.getElementById('f-title').value.trim();
  if (!title) {
    showStatus('Введи название разбора', 'err');
    document.getElementById('f-title').focus();
    return;
  }

  state.blocks.forEach(block => {
    if (block.type === 'position') syncBoard(block.id);
  });

  const id  = state.current?.id || generateId();
  const now = new Date().toISOString();

  const analysis = {
    id, title,
    excerpt:  document.getElementById('f-excerpt').value.trim(),
    tags:     state.selectedTags,
    blocks:   state.blocks,
    date:     state.current?.date || now,
    updated:  now,
  };

  console.log('JSON размер:', Math.round(JSON.stringify(analysis).length/1024) + 'кб');

  try {
    const res = await api('save_analysis', { analysis });
    if (res.ok) {
      state.current = analysis;
      document.getElementById('editor-title').textContent = title;
      document.getElementById('btn-delete').style.display = 'block';
      await loadAnalysesList();
      renderAnalysesList();
      showStatus('✓ Разбор сохранён', 'ok');
    } else {
      showStatus('Ошибка: ' + (res.error||''), 'err');
    }
  } catch (e) {
    console.error(e);
    showStatus('Нет связи с сервером', 'err');
  }
}

// ============================================================
//  DELETE
// ============================================================

async function deleteAnalysis() {
  if (!state.current) return;
  if (!confirm(`Удалить "${state.current.title}"?`)) return;
  await deleteAnalysisById(state.current.id);
  showScreen('list');
}

async function deleteAnalysisById(id) {
  if (!confirm('Удалить разбор?')) return;
  try {
    const res = await api('delete_analysis', { id });
    if (res.ok) {
      if (state.current?.id === id) state.current = null;
      await loadAnalysesList();
      renderAnalysesList();
      showStatus('Разбор удалён', 'ok');
      if (document.getElementById('screen-editor').classList.contains('active')) {
        showScreen('list');
      }
    } else {
      showStatus('Ошибка удаления', 'err');
    }
  } catch {
    showStatus('Нет связи с сервером', 'err');
  }
}

// ============================================================
//  META / SETTINGS
// ============================================================

async function loadMeta() {
  try {
    const res = await fetch(CFG.metaUrl + '?t=' + Date.now());
    if (!res.ok) return;
    const data = await res.json();
    const set = (id, val) => {
      const el = document.getElementById(id);
      if (el && val) el.value = val;
    };
    set('meta-telegram', data.telegram);
    set('meta-email',    data.email);
    set('meta-subtitle', data.subtitle);
    set('meta-name',     data.name);
    set('meta-about',    data.about);
    if (data.excelTable) {
      const el = document.getElementById('excel-input');
      if (el) el.innerHTML = data.excelTable;
    }
  } catch {}
}

async function saveMeta() {
  const payload = {
    telegram: document.getElementById('meta-telegram').value.trim(),
    email:    document.getElementById('meta-email').value.trim(),
    subtitle: document.getElementById('meta-subtitle').value.trim(),
    name:     document.getElementById('meta-name').value.trim(),
    about:    document.getElementById('meta-about').value.trim(),
  };
  try {
    const res = await api('save_meta', { data: payload });
    if (res.ok) showStatus('✓ Настройки сохранены', 'ok');
    else        showStatus('Ошибка', 'err');
  } catch { showStatus('Нет связи', 'err'); }
}

// ============================================================
//  EXCEL TABLE
// ============================================================

function sanitizeTableHTML(html) {
  const parser  = new DOMParser();
  const doc     = parser.parseFromString(html, 'text/html');
  const ALLOWED = ['TABLE','THEAD','TBODY','TFOOT','TR','TH','TD','CAPTION'];

  function clean(node) {
    if (node.nodeType === Node.TEXT_NODE) return node.cloneNode();
    if (node.nodeType !== Node.ELEMENT_NODE) return null;
    if (!ALLOWED.includes(node.tagName)) {
      const f = document.createDocumentFragment();
      node.childNodes.forEach(c => { const n=clean(c); if(n) f.appendChild(n); });
      return f;
    }
    const el = document.createElement(node.tagName);
    if (['TD','TH'].includes(node.tagName)) {
      ['colspan','rowspan'].forEach(a => {
        if (node.getAttribute(a)) el.setAttribute(a, node.getAttribute(a));
      });
    }
    node.childNodes.forEach(c => { const n=clean(c); if(n) el.appendChild(n); });
    return el;
  }

  const table = doc.querySelector('table');
  if (!table) return '';
  const wrap = document.createElement('div');
  wrap.appendChild(clean(table));
  return wrap.innerHTML;
}

async function saveExcelTable() {
  const raw   = document.getElementById('excel-input').innerHTML;
  const clean = sanitizeTableHTML(raw);
  if (!clean) { showStatus('Нет таблицы', 'err'); return; }
  try {
    const res = await api('save_meta', { data: { excelTable: clean } });
    if (res.ok) showStatus('✓ Таблица сохранена', 'ok');
    else        showStatus('Ошибка', 'err');
  } catch { showStatus('Нет связи', 'err'); }
}

async function deleteExcelTable() {
  if (!confirm('Удалить таблицу?')) return;
  document.getElementById('excel-input').innerHTML = '';
  try {
    await api('save_meta', { data: { excelTable: '' } });
    showStatus('Таблица удалена', 'ok');
  } catch {}
}

function clearTable() {
  document.getElementById('excel-input').innerHTML = '';
  document.getElementById('clean-preview').style.display = 'none';
}

let _previewVisible = false;
function togglePreview() {
  const clean   = sanitizeTableHTML(document.getElementById('excel-input').innerHTML);
  const preview = document.getElementById('clean-preview');
  _previewVisible = !_previewVisible;
  preview.style.display = _previewVisible ? 'block' : 'none';
  if (_previewVisible) preview.textContent = clean || '(пусто)';
}

// ============================================================
//  API
// ============================================================

async function api(action, payload = {}) {
  const res = await fetch(CFG.saveUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, token: state.token, ...payload }),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

// ============================================================
//  HELPERS
// ============================================================

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2,6);
}

function esc(str) {
  return String(str??'')
    .replace(/&/g,'&amp;').replace(/</g,'&lt;')
    .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function formatDate(str) {
  if (!str) return '';
  try {
    return new Date(str).toLocaleDateString('ru-RU',{
      day:'numeric', month:'long', year:'numeric'
    });
  } catch { return str; }
}

let _statusTimer;
function showStatus(msg, type = 'ok') {
  const bar = document.getElementById('status-bar');
  bar.textContent = msg;
  bar.className   = `status-bar show ${type}`;
  clearTimeout(_statusTimer);
  _statusTimer = setTimeout(() => bar.classList.remove('show'), 3500);
}