<?php
// ============================================================
//  ЛИМИТЫ
// ============================================================
ini_set('memory_limit',       '256M');
ini_set('post_max_size',      '50M');
ini_set('upload_max_filesize','50M');
ini_set('max_execution_time', '60');

// ============================================================
//  КОНФИГ
// ============================================================
define('ADMIN_PASSWORD', 'chess2024');
define('TOKEN_FILE',   __DIR__ . '/../data/.token');
define('ANALYSES_DIR', __DIR__ . '/../data/analyses/');
define('INDEX_FILE',   ANALYSES_DIR . 'index.json');
define('CONTENT_FILE', __DIR__ . '/../data/content.json');

// ============================================================
//  ЗАГОЛОВКИ
// ============================================================
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    die(json_encode(['ok' => false, 'error' => 'method_not_allowed']));
}

// ============================================================
//  ЧИТАЕМ ТЕЛО
// ============================================================
$rawInput = file_get_contents('php://input');

if (empty($rawInput)) {
    die(json_encode(['ok' => false, 'error' => 'empty_body']));
}

$body = json_decode($rawInput, true);

if (json_last_error() !== JSON_ERROR_NONE) {
    die(json_encode([
        'ok'    => false,
        'error' => 'bad_json',
        'msg'   => json_last_error_msg(),
        'size'  => strlen($rawInput),
    ]));
}

$action = $body['action'] ?? '';

// ============================================================
//  АВТОРИЗАЦИЯ
// ============================================================
if ($action === 'auth') {
    $pwd = $body['password'] ?? '';
    if (!hash_equals(ADMIN_PASSWORD, $pwd)) {
        sleep(1);
        die(json_encode(['ok' => false, 'error' => 'wrong_password']));
    }
    $token   = bin2hex(random_bytes(32));
    $expires = time() + 3600 * 8;
    ensureDir(dirname(TOKEN_FILE));
    file_put_contents(TOKEN_FILE, json_encode(compact('token', 'expires')));
    die(json_encode(['ok' => true, 'token' => $token]));
}

// ── Всё ниже требует токен ──
$token = $body['token'] ?? '';
if (!validateToken($token)) {
    die(json_encode(['ok' => false, 'error' => 'auth']));
}

// ============================================================
//  СОХРАНЕНИЕ РАЗБОРА
// ============================================================
if ($action === 'save_analysis') {
    $analysis = $body['analysis'] ?? null;

    if (!$analysis || empty($analysis['id']) || empty($analysis['title'])) {
        die(json_encode(['ok' => false, 'error' => 'invalid_data']));
    }

    $id = preg_replace('/[^a-zA-Z0-9_\-]/', '', $analysis['id']);
    if (!$id) die(json_encode(['ok' => false, 'error' => 'bad_id']));

    ensureDir(ANALYSES_DIR);

    // Сохраняем с большим лимитом памяти (base64 картинки большие)
    $json = json_encode(
        $analysis,
        JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT
    );

    if ($json === false) {
        die(json_encode([
            'ok'    => false,
            'error' => 'json_encode_failed',
            'msg'   => json_last_error_msg(),
        ]));
    }

    $path   = ANALYSES_DIR . $id . '.json';
    $written = file_put_contents($path, $json);

    if ($written === false) {
        die(json_encode(['ok' => false, 'error' => 'write_failed']));
    }

    // Обновляем индекс (без base64 картинок — только мета)
    updateIndex($id, [
        'id'      => $id,
        'title'   => $analysis['title'],
        'excerpt' => $analysis['excerpt'] ?? '',
        'tags'    => $analysis['tags']    ?? [],
        'date'    => $analysis['date']    ?? date('c'),
        'updated' => $analysis['updated'] ?? date('c'),
        'blocks'  => count($analysis['blocks'] ?? []),
    ]);

    die(json_encode([
        'ok'      => true,
        'id'      => $id,
        'written' => $written,
    ]));
}

// ============================================================
//  УДАЛЕНИЕ РАЗБОРА
// ============================================================
if ($action === 'delete_analysis') {
    $id = preg_replace('/[^a-zA-Z0-9_\-]/', '', $body['id'] ?? '');
    if (!$id) die(json_encode(['ok' => false, 'error' => 'bad_id']));

    $path = ANALYSES_DIR . $id . '.json';
    if (file_exists($path)) unlink($path);

    removeFromIndex($id);
    die(json_encode(['ok' => true]));
}

// ============================================================
//  СОХРАНЕНИЕ НАСТРОЕК / EXCEL
// ============================================================
if ($action === 'save_meta') {
    $newData = $body['data'] ?? [];
    if (!is_array($newData)) {
        die(json_encode(['ok' => false, 'error' => 'invalid_data']));
    }

    if (isset($newData['excelTable'])) {
        $newData['excelTable'] = sanitizeTable($newData['excelTable']);
    }

    $current = [];
    if (file_exists(CONTENT_FILE)) {
        $current = json_decode(file_get_contents(CONTENT_FILE), true) ?? [];
    }

    $merged = array_merge($current, $newData);
    ensureDir(dirname(CONTENT_FILE));

    if (file_put_contents(
        CONTENT_FILE,
        json_encode($merged, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT)
    ) === false) {
        die(json_encode(['ok' => false, 'error' => 'write_failed']));
    }

    die(json_encode(['ok' => true]));
}

die(json_encode(['ok' => false, 'error' => 'unknown_action']));

// ============================================================
//  ФУНКЦИИ
// ============================================================

function validateToken(string $t): bool {
    if (!file_exists(TOKEN_FILE)) return false;
    $d = json_decode(file_get_contents(TOKEN_FILE), true);
    if (!$d || time() > ($d['expires'] ?? 0)) return false;
    return hash_equals($d['token'], $t);
}

function ensureDir(string $dir): void {
    if (!is_dir($dir)) mkdir($dir, 0755, true);
}

function loadIndex(): array {
    if (!file_exists(INDEX_FILE)) return [];
    return json_decode(file_get_contents(INDEX_FILE), true) ?? [];
}

function saveIndex(array $index): void {
    usort($index, fn($a, $b) => strcmp(
        $b['date'] ?? '',
        $a['date'] ?? ''
    ));
    file_put_contents(
        INDEX_FILE,
        json_encode(
            array_values($index),
            JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT
        )
    );
}

function updateIndex(string $id, array $meta): void {
    $index = array_filter(loadIndex(), fn($i) => $i['id'] !== $id);
    $index[] = $meta;
    saveIndex(array_values($index));
}

function removeFromIndex(string $id): void {
    $index = array_filter(loadIndex(), fn($i) => $i['id'] !== $id);
    saveIndex(array_values($index));
}

function sanitizeTable(string $html): string {
    if (empty($html)) return '';
    $allowed = '<table><thead><tbody><tfoot><tr><th><td><caption>';
    $clean   = strip_tags($html, $allowed);
    $clean   = preg_replace_callback(
        '/<(td|th)([^>]*)>/i',
        function ($m) {
            $tag  = strtolower($m[1]);
            $attr = $m[2];
            $keep = '';
            if (preg_match('/colspan=["\']?(\d+)["\']?/i', $attr, $c))
                $keep .= ' colspan="' . intval($c[1]) . '"';
            if (preg_match('/rowspan=["\']?(\d+)["\']?/i', $attr, $r))
                $keep .= ' rowspan="' . intval($r[1]) . '"';
            return "<{$tag}{$keep}>";
        },
        $clean
    );
    $clean = preg_replace(
        '/<(table|tr|thead|tbody|tfoot|caption)([^>]*)>/i',
        '<$1>',
        $clean
    );
    return $clean;
}