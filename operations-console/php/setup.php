<?php
/**
 * One-time password setup.
 *
 * Open only while no replacement password exists AND the caller presents the
 * single-use token from .setup-token. As soon as a password is stored the page
 * closes itself, so nothing has to be cleaned up on the server.
 */

declare(strict_types=1);

const MIN_PASSWORD = 10;
const TOKEN_FILE = __DIR__ . '/.setup-token';

header('X-Content-Type-Options: nosniff');
header('Referrer-Policy: no-referrer');
header('X-Frame-Options: DENY');
header('Cache-Control: no-store');

function envv(string $key): string
{
    $value = getenv($key);
    if ($value === false) {
        $value = $_SERVER[$key] ?? '';
    }
    return trim((string) $value);
}

function db(): mysqli
{
    mysqli_report(MYSQLI_REPORT_OFF);
    $conn = new mysqli(envv('DB_HOST'), envv('DB_USER'), envv('DB_PASSWORD'), envv('DB_NAME'));
    if ($conn->connect_errno) {
        throw new RuntimeException('Database connection failed.');
    }
    $conn->set_charset('utf8mb4');
    return $conn;
}

function storedHash(): ?string
{
    db()->query('CREATE TABLE IF NOT EXISTS admin_credentials (
        id TINYINT UNSIGNED NOT NULL PRIMARY KEY,
        pw_hash VARCHAR(255) NOT NULL,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4');
    $result = db()->query('SELECT pw_hash FROM admin_credentials WHERE id = 1');
    if ($result instanceof mysqli_result) {
        $row = $result->fetch_assoc();
        $result->free();
        if ($row && is_string($row['pw_hash']) && $row['pw_hash'] !== '') {
            return $row['pw_hash'];
        }
    }
    return null;
}

function expectedToken(): string
{
    if (!is_readable(TOKEN_FILE)) {
        return '';
    }
    return trim((string) file_get_contents(TOKEN_FILE));
}

function storePassword(string $password): void
{
    $hash = password_hash($password, PASSWORD_DEFAULT);
    $stmt = db()->prepare('INSERT INTO admin_credentials (id, pw_hash, updated_at) VALUES (1, ?, NOW())
        ON DUPLICATE KEY UPDATE pw_hash = VALUES(pw_hash), updated_at = NOW()');
    $stmt->bind_param('s', $hash);
    $stmt->execute();
    $stmt->close();
}

function render(string $title, string $body, int $status = 200): void
{
    http_response_code($status);
    header('Content-Type: text/html; charset=utf-8');
    echo '<!doctype html><html lang="en"><head><meta charset="utf-8">'
        . '<meta name="viewport" content="width=device-width,initial-scale=1">'
        . '<meta name="robots" content="noindex,nofollow,noarchive">'
        . '<title>' . htmlspecialchars($title, ENT_QUOTES) . '</title>'
        . '<link rel="stylesheet" href="/control-room/assets/style.css">'
        . '<link rel="stylesheet" href="/control-room/assets/account.css"></head>'
        . '<body class="auth-page"><main class="auth-shell">'
        . '<p class="eyebrow">NEWGIFTSANDGADGETS.COM</p><h1>Control room</h1>'
        . $body . '</main></body></html>';
    exit;
}

$token = (string) ($_GET['t'] ?? $_POST['t'] ?? '');
$expected = expectedToken();
$message = '';
$status = 200;

if (storedHash() !== null) {
    render('Setup closed', '<p class="auth-lede">A password is already set for this dashboard.</p>'
        . '<p><a href="/control-room/login.html">Go to sign in</a></p>', 403);
}

if ($expected === '' || $token === '' || !hash_equals($expected, $token)) {
    render('Setup unavailable', '<p class="auth-lede">This setup link is no longer valid.</p>', 403);
}

if (($_SERVER['REQUEST_METHOD'] ?? 'GET') === 'POST') {
    $password = (string) ($_POST['password'] ?? '');
    $confirm = (string) ($_POST['confirm'] ?? '');
    $bootstrap = envv('ADMIN_DASHBOARD_PASSWORD');

    if (strlen($password) < MIN_PASSWORD) {
        $message = 'Use at least ' . MIN_PASSWORD . ' characters.';
    } elseif ($password !== $confirm) {
        $message = 'The two passwords do not match.';
    } elseif ($bootstrap !== '' && hash_equals($bootstrap, $password)) {
        $message = 'Choose a password different from the original one.';
    } else {
        try {
            storePassword($password);
            render('Password saved', '<p class="auth-lede">Your new password is saved. This setup page is now closed.</p>'
                . '<p><a href="/control-room/login.html">Sign in</a></p>');
        } catch (Throwable $e) {
            $status = 500;
            $message = 'Could not save the password. Try again.';
        }
    }
}

$form = '<form class="auth-card" method="post" action="/control-room/setup.php">'
    . '<input type="hidden" name="t" value="' . htmlspecialchars($token, ENT_QUOTES) . '">'
    . '<label for="password">New password</label>'
    . '<input id="password" name="password" type="password" autocomplete="new-password" minlength="' . MIN_PASSWORD . '" required autofocus>'
    . '<label for="confirm">Repeat it</label>'
    . '<input id="confirm" name="confirm" type="password" autocomplete="new-password" minlength="' . MIN_PASSWORD . '" required>'
    . '<button type="submit">Save password</button>'
    . '<p class="auth-message">' . htmlspecialchars($message, ENT_QUOTES) . '</p>'
    . '</form>'
    . '<p class="auth-note">Choose something you will remember. It is stored as a hash and cannot be read back.</p>';

render('Set a password', '<p class="auth-lede">Choose a new password for the dashboard.</p>' . $form, $status);
