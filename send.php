<?php
// ============================================================
//  КОНФИГ — вставь свои данные
// ============================================================

define('BOT_TOKEN', '8721604385:AAHfxfSSparfYUP6ozYTq4CFJ14nQ_O85jA'); // ← токен от @BotFather
define('CHAT_ID',   '976813253');                     // ← твой Chat ID

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
//  ЧИТАЕМ ДАННЫЕ
// ============================================================

$body = json_decode(file_get_contents('php://input'), true);

if (!$body) {
    die(json_encode(['ok' => false, 'error' => 'bad_json']));
}

// Чистим от тегов
$name     = strip_tags(trim($body['name']     ?? ''));
$contact  = strip_tags(trim($body['contact']  ?? ''));
$gameLink = strip_tags(trim($body['gameLink'] ?? ''));
$comment  = strip_tags(trim($body['comment']  ?? ''));

// ============================================================
//  ВАЛИДАЦИЯ
// ============================================================

$errors = [];

if (mb_strlen($name) < 2) {
    $errors[] = 'Слишком короткое имя';
}

if (mb_strlen($contact) < 3) {
    $errors[] = 'Не указан контакт';
}

if (empty($gameLink) || !filter_var($gameLink, FILTER_VALIDATE_URL)) {
    $errors[] = 'Некорректная ссылка на партию';
}

if (
    !empty($gameLink) &&
    !str_contains($gameLink, 'chess.com') &&
    !str_contains($gameLink, 'lichess.org')
) {
    $errors[] = 'Ссылка не с chess.com или lichess.org';
}

// Простая защита от спама — проверяем длину
if (mb_strlen($comment) > 2000) {
    $errors[] = 'Комментарий слишком длинный';
}

if (!empty($errors)) {
    die(json_encode(['ok' => false, 'error' => implode(', ', $errors)]));
}

// ============================================================
//  ФОРМИРУЕМ СООБЩЕНИЕ
// ============================================================

$time = date('d.m.Y в H:i', time() + 3 * 3600); // МСК UTC+3

$msg  = "♟ *Новая заявка на разбор партии*\n";
$msg .= "━━━━━━━━━━━━━━━━━━━━\n\n";
$msg .= "👤 *Имя:* " . escMd($name) . "\n";
$msg .= "📱 *Контакт:* " . escMd($contact) . "\n";
$msg .= "🔗 *Ссылка на партию:*\n" . $gameLink . "\n";

if (!empty($comment)) {
    $msg .= "\n💬 *Комментарий:*\n" . escMd($comment) . "\n";
}

$msg .= "\n━━━━━━━━━━━━━━━━━━━━\n";
$msg .= "🕐 " . $time . " МСК";

// ============================================================
//  ОТПРАВКА В TELEGRAM
// ============================================================

$payload = [
    'chat_id'                  => CHAT_ID,
    'text'                     => $msg,
    'parse_mode'               => 'Markdown',
    'disable_web_page_preview' => true,
];

$apiUrl = 'https://api.telegram.org/bot' . BOT_TOKEN . '/sendMessage';

// Используем file_get_contents если нет curl
if (function_exists('curl_init')) {
    $result = sendViaCurl($apiUrl, $payload);
} else {
    $result = sendViaFileGetContents($apiUrl, $payload);
}

$response = json_decode($result, true);

if (!$response || !$response['ok']) {
    error_log('Telegram error: ' . $result);
    die(json_encode([
        'ok'    => false,
        'error' => 'telegram_send_failed',
    ]));
}

die(json_encode(['ok' => true]));

// ============================================================
//  ФУНКЦИИ
// ============================================================

function sendViaCurl(string $url, array $data): string {
    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_POST           => true,
        CURLOPT_POSTFIELDS     => json_encode($data),
        CURLOPT_HTTPHEADER     => ['Content-Type: application/json'],
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT        => 15,
        CURLOPT_SSL_VERIFYPEER => true,
    ]);
    $result = curl_exec($ch);
    $err    = curl_error($ch);
    curl_close($ch);

    if ($err) {
        error_log('CURL error: ' . $err);
        return json_encode(['ok' => false]);
    }

    return $result;
}

function sendViaFileGetContents(string $url, array $data): string {
    $context = stream_context_create([
        'http' => [
            'method'  => 'POST',
            'header'  => 'Content-Type: application/json',
            'content' => json_encode($data),
            'timeout' => 15,
        ],
    ]);

    $result = @file_get_contents($url, false, $context);
    return $result ?: json_encode(['ok' => false]);
}

/**
 * Экранируем спецсимволы для Markdown в Telegram
 */
function escMd(string $str): string {
    return str_replace(
        ['_', '*', '[', ']', '`'],
        ['\_', '\*', '\[', '\]', '\`'],
        $str
    );
}