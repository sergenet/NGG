<?php
/**
 * NewGifts & Gadgets control room API.
 *
 * Replaces the Node/Passenger service, which could not be redeployed: the host
 * still binds /control-room to an older app directory outside the web root.
 * Credentials come from the LiteSpeed SetEnv block in .htaccess, never from a
 * file inside the web root.
 */

declare(strict_types=1);

const BASE = '/control-room';
const SITE_ORIGIN = 'https://newgiftsandgadgets.com';
const SESSION_NAME = 'ngg_cr';
const MIN_PASSWORD = 10;
const SESSION_TTL = 43200;          // 12 hours
const LOGIN_WINDOW = 900;           // 15 minutes
const LOGIN_LIMIT = 10;

header('X-Content-Type-Options: nosniff');
header('Referrer-Policy: same-origin');
header('X-Frame-Options: DENY');
header('Cache-Control: no-store');

/* ------------------------------------------------------------------ config -- */

function envv(string $key): string
{
    $value = getenv($key);
    if ($value === false) {
        $value = $_SERVER[$key] ?? '';
    }
    return trim((string) $value);
}

/* --------------------------------------------------------------- database -- */

function db(): mysqli
{
    static $conn = null;
    if ($conn instanceof mysqli) {
        return $conn;
    }
    mysqli_report(MYSQLI_REPORT_OFF);
    $conn = new mysqli(envv('DB_HOST'), envv('DB_USER'), envv('DB_PASSWORD'), envv('DB_NAME'));
    if ($conn->connect_errno) {
        throw new RuntimeException('Database connection failed.');
    }
    $conn->set_charset('utf8mb4');
    return $conn;
}

function ensureSchema(): void
{
    static $done = false;
    if ($done) {
        return;
    }
    $c = db();
    // Dashboard-owned tables. The analytics tables are created by the site's
    // event collector; these two are new.
    $c->query('CREATE TABLE IF NOT EXISTS admin_credentials (
        id TINYINT UNSIGNED NOT NULL PRIMARY KEY,
        pw_hash VARCHAR(255) NOT NULL,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4');
    $c->query('CREATE TABLE IF NOT EXISTS admin_login_attempts (
        ip_hash CHAR(64) NOT NULL,
        attempted_at DATETIME NOT NULL,
        KEY window_idx (ip_hash, attempted_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4');
    $done = true;
}

/* --------------------------------------------------------------- sessions -- */

function startSession(): void
{
    if (session_status() === PHP_SESSION_ACTIVE) {
        return;
    }
    session_name(SESSION_NAME);
    session_set_cookie_params([
        'lifetime' => 0,
        'path' => BASE,
        'httponly' => true,
        'secure' => true,
        'samesite' => 'Strict',
    ]);
    session_start();
}

function storedHash(): ?string
{
    ensureSchema();
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

/**
 * Sessions are tied to the current credential. Rotating the password changes
 * the fingerprint, which invalidates every existing session.
 */
function fingerprint(): string
{
    $hash = storedHash();
    return $hash === null ? 'bootstrap' : substr(hash('sha256', $hash), 0, 24);
}

function isAuthed(): bool
{
    startSession();
    if (($_SESSION['admin'] ?? '') !== fingerprint()) {
        return false;
    }
    if ((int) ($_SESSION['issued'] ?? 0) + SESSION_TTL < time()) {
        $_SESSION = [];
        return false;
    }
    return true;
}

function requireSession(): void
{
    if (!isAuthed()) {
        json(['error' => 'Authentication required.'], 401);
    }
}

function verifyPassword(string $candidate): bool
{
    if ($candidate === '') {
        return false;
    }
    $hash = storedHash();
    if ($hash !== null) {
        return password_verify($candidate, $hash);
    }
    $bootstrap = envv('ADMIN_DASHBOARD_PASSWORD');
    return $bootstrap !== '' && hash_equals($bootstrap, $candidate);
}

function storePassword(string $password): void
{
    ensureSchema();
    $hash = password_hash($password, PASSWORD_DEFAULT);
    $stmt = db()->prepare('INSERT INTO admin_credentials (id, pw_hash, updated_at) VALUES (1, ?, NOW())
        ON DUPLICATE KEY UPDATE pw_hash = VALUES(pw_hash), updated_at = NOW()');
    $stmt->bind_param('s', $hash);
    $stmt->execute();
    $stmt->close();
}

/* ------------------------------------------------------------------ limit -- */

function ipHash(): string
{
    return hash('sha256', ($_SERVER['REMOTE_ADDR'] ?? 'unknown') . '|' . envv('ANALYTICS_HASH_SECRET'));
}

function attemptsExceeded(): bool
{
    ensureSchema();
    $stmt = db()->prepare('SELECT COUNT(*) AS n FROM admin_login_attempts WHERE ip_hash = ? AND attempted_at > (NOW() - INTERVAL ' . LOGIN_WINDOW . ' SECOND)');
    $hash = ipHash();
    $stmt->bind_param('s', $hash);
    $stmt->execute();
    $row = $stmt->get_result()->fetch_assoc();
    $stmt->close();
    return (int) ($row['n'] ?? 0) >= LOGIN_LIMIT;
}

function recordFailedAttempt(): void
{
    ensureSchema();
    $stmt = db()->prepare('INSERT INTO admin_login_attempts (ip_hash, attempted_at) VALUES (?, NOW())');
    $hash = ipHash();
    $stmt->bind_param('s', $hash);
    $stmt->execute();
    $stmt->close();
}

function clearAttempts(): void
{
    $stmt = db()->prepare('DELETE FROM admin_login_attempts WHERE ip_hash = ?');
    $hash = ipHash();
    $stmt->bind_param('s', $hash);
    $stmt->execute();
    $stmt->close();
}

/* ------------------------------------------------------------------ input -- */

function jsonBody(): array
{
    $raw = file_get_contents('php://input');
    $data = json_decode((string) $raw, true);
    return is_array($data) ? $data : [];
}

function sameOrigin(): bool
{
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
    if ($origin === '') {
        return true; // non-browser client; it has no session cookie to abuse
    }
    return $origin === SITE_ORIGIN;
}

function json($payload, int $status = 200): void
{
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($payload, JSON_UNESCAPED_SLASHES);
    exit;
}

function fail(string $message, int $status = 400): void
{
    json(['error' => $message], $status);
}

/* ------------------------------------------------------------- emailoctopus -- */

function httpGetJson(string $url, string $bearer): array
{
    if (function_exists('curl_init')) {
        $ch = curl_init($url);
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT => 10,
            CURLOPT_HTTPHEADER => ['Authorization: Bearer ' . $bearer, 'Accept: application/json'],
        ]);
        $body = curl_exec($ch);
        $status = (int) curl_getinfo($ch, CURLINFO_RESPONSE_CODE);
        curl_close($ch);
    } else {
        $context = stream_context_create([
            'http' => [
                'method' => 'GET',
                'timeout' => 10,
                'header' => "Authorization: Bearer $bearer\r\nAccept: application/json\r\n",
                'ignore_errors' => true,
            ],
        ]);
        $body = @file_get_contents($url, false, $context);
        $status = 0;
        if (isset($http_response_header[0]) && preg_match('/\s(\d{3})\s/', $http_response_header[0], $m)) {
            $status = (int) $m[1];
        }
    }
    if ($body === false || $status < 200 || $status >= 300) {
        throw new RuntimeException('EmailOctopus HTTP ' . $status);
    }
    $data = json_decode((string) $body, true);
    if (!is_array($data)) {
        throw new RuntimeException('EmailOctopus returned unreadable JSON.');
    }
    return $data;
}

function countMap($raw): array
{
    if (!is_array($raw)) {
        return [];
    }
    if (isset($raw[0]) && is_array($raw[0]) && array_key_exists('subscribed', $raw[0])) {
        return countMap($raw[0]);
    }
    if (isset($raw[0])) {
        $out = [];
        foreach ($raw as $item) {
            if (!is_array($item)) {
                continue;
            }
            $key = strtolower((string) ($item['status'] ?? $item['type'] ?? $item['name'] ?? ''));
            $out[$key] = (int) ($item['count'] ?? $item['total'] ?? $item['value'] ?? 0);
        }
        return $out;
    }
    $out = [];
    foreach ($raw as $key => $value) {
        $number = is_array($value) ? (int) ($value['count'] ?? $value['total'] ?? $value['value'] ?? 0) : (int) $value;
        $out[strtolower((string) $key)] = $number;
    }
    return $out;
}

function refreshEmailOctopus(): array
{
    $key = envv('EMAILOCTOPUS_API_KEY');
    $listId = envv('EMAILOCTOPUS_LIST_ID');
    if ($key === '' || $listId === '') {
        return ['configured' => false];
    }
    try {
        $list = httpGetJson('https://api.emailoctopus.com/lists/' . rawurlencode($listId), $key);
        $counts = countMap($list['counts'] ?? []);
        if (!array_key_exists('subscribed', $counts)) {
            throw new RuntimeException('EmailOctopus response did not include a subscribed count');
        }
        $stmt = db()->prepare('INSERT INTO provider_snapshots (provider, captured_at, metric_key, metric_value) VALUES (?, NOW(), ?, ?)');
        foreach (['subscribed', 'pending', 'unsubscribed'] as $metric) {
            if (array_key_exists($metric, $counts)) {
                $value = (float) $counts[$metric];
                $provider = 'emailoctopus';
                $stmt->bind_param('ssd', $provider, $metric, $value);
                $stmt->execute();
            }
        }
        $stmt->close();
        return ['configured' => true, 'fresh' => true];
    } catch (Throwable $e) {
        return ['configured' => true, 'error' => $e->getMessage()];
    }
}

/* ------------------------------------------------------------------ events -- */

function trackEvent(): void
{
    if (!sameOrigin()) {
        http_response_code(403);
        exit;
    }
    $body = jsonBody();
    $type = (string) ($body['type'] ?? '');
    $allowed = ['page_view', 'retailer_click', 'checklist_download', 'newsletter_attempt'];
    if (!in_array($type, $allowed, true)) {
        http_response_code(400);
        exit;
    }
    if (($_SERVER['HTTP_SEC_GPC'] ?? '') === '1' || ($_SERVER['HTTP_DNT'] ?? '') === '1') {
        http_response_code(204);
        exit;
    }

    $page = (string) ($body['path'] ?? '/');
    $page = explode('?', $page)[0];
    $page = substr($page, 0, 180);
    if (!preg_match('#^/[a-zA-Z0-9_./-]*$#', $page)) {
        $page = '/unknown';
    }

    $referrer = (string) ($body['referrer'] ?? '');
    $parts = parse_url($referrer);
    $host = isset($parts['host']) ? strtolower(preg_replace('/^www\./', '', $parts['host'])) : '';
    $source = 'direct';
    if ($host !== '') {
        foreach (['google.com' => 'google', 'bing.com' => 'bing', 'pinterest.com' => 'pinterest', 'facebook.com' => 'facebook', 'instagram.com' => 'instagram', 'newgiftsandgadgets.com' => 'internal'] as $needle => $label) {
            if (substr($host, -strlen($needle)) === $needle) {
                $source = $label;
                break;
            }
        }
        if ($source === 'direct') {
            $source = 'other-referral';
        }
    }

    $visitor = hash_hmac('sha256', gmdate('Y-m-d') . '|' . ($_SERVER['REMOTE_ADDR'] ?? '') . '|' . substr((string) ($_SERVER['HTTP_USER_AGENT'] ?? ''), 0, 160), envv('ANALYTICS_HASH_SECRET'));
    $c = db();
    $c->begin_transaction();
    try {
        $stmt = $c->prepare("INSERT INTO site_metrics_daily (metric_date, metric_key, metric_count) VALUES (CURRENT_DATE, ?, 1) ON DUPLICATE KEY UPDATE metric_count = metric_count + 1");
        $stmt->bind_param('s', $type);
        $stmt->execute();
        $stmt->close();

        if ($type === 'page_view') {
            $stmt = $c->prepare('INSERT IGNORE INTO site_visitors_daily (visitor_hash, visit_date) VALUES (?, CURRENT_DATE)');
            $stmt->bind_param('s', $visitor);
            $stmt->execute();
            $isNew = $stmt->affected_rows > 0;
            $stmt->close();

            if ($isNew) {
                $stmt = $c->prepare("INSERT INTO site_metrics_daily (metric_date, metric_key, metric_count) VALUES (CURRENT_DATE, 'unique_visitors', 1) ON DUPLICATE KEY UPDATE metric_count = metric_count + 1");
                $stmt->execute();
                $stmt->close();
            }

            $stmt = $c->prepare('INSERT INTO traffic_dimensions_daily (metric_date, dimension_type, dimension_value, metric_count) VALUES (CURRENT_DATE, ?, ?, 1) ON DUPLICATE KEY UPDATE metric_count = metric_count + 1');
            $dimension = 'landing_page';
            $stmt->bind_param('ss', $dimension, $page);
            $stmt->execute();
            if ($source !== 'internal') {
                $dimension = 'source';
                $stmt->bind_param('ss', $dimension, $source);
                $stmt->execute();
            }
            $stmt->close();
        }
        $c->commit();
    } catch (Throwable $e) {
        $c->rollback();
        http_response_code(503);
        exit;
    }
    http_response_code(204);
    exit;
}

/* ---------------------------------------------------------------- dispatch -- */

$action = (string) ($_GET['action'] ?? '');
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

try {
    switch ($action) {
        case 'event':
            if ($method !== 'POST') {
                http_response_code(405);
                exit;
            }
            trackEvent();
            break;

        case 'session':
            ensureSchema();
            json([
                'authenticated' => isAuthed(),
                'passwordSet' => storedHash() !== null,
                'minLength' => MIN_PASSWORD,
            ]);
            break;

        case 'login':
            if ($method !== 'POST') {
                fail('Method not allowed.', 405);
            }
            if (!sameOrigin()) {
                fail('Cross-origin request rejected.', 403);
            }
            if (attemptsExceeded()) {
                fail('Too many attempts. Wait 15 minutes and try again.', 429);
            }
            $password = (string) (jsonBody()['password'] ?? '');
            if ($password === '') {
                fail('Enter your password.');
            }
            if (!verifyPassword($password)) {
                recordFailedAttempt();
                fail('That password is not correct.', 401);
            }
            clearAttempts();
            startSession();
            session_regenerate_id(true);
            $_SESSION['admin'] = fingerprint();
            $_SESSION['issued'] = time();
            http_response_code(204);
            exit;

        case 'logout':
            if ($method !== 'POST') {
                fail('Method not allowed.', 405);
            }
            if (!sameOrigin()) {
                fail('Cross-origin request rejected.', 403);
            }
            startSession();
            $_SESSION = [];
            if (ini_get('session.use_cookies')) {
                $params = session_get_cookie_params();
                setcookie(session_name(), '', [
                    'expires' => time() - 42000,
                    'path' => $params['path'],
                    'secure' => true,
                    'httponly' => true,
                    'samesite' => 'Strict',
                ]);
            }
            session_destroy();
            http_response_code(204);
            exit;

        case 'password':
            if ($method !== 'POST') {
                fail('Method not allowed.', 405);
            }
            if (!sameOrigin()) {
                fail('Cross-origin request rejected.', 403);
            }
            requireSession();
            $body = jsonBody();
            $next = (string) ($body['newPassword'] ?? '');
            if (strlen($next) < MIN_PASSWORD) {
                fail('Use at least ' . MIN_PASSWORD . ' characters.');
            }
            $bootstrap = envv('ADMIN_DASHBOARD_PASSWORD');
            if ($bootstrap !== '' && hash_equals($bootstrap, $next)) {
                fail('Choose a password different from the original one.');
            }
            try {
                storePassword($next);
            } catch (Throwable $e) {
                fail('Could not save the password.', 500);
            }
            // The fingerprint changed, so re-issue rather than sign the user out.
            startSession();
            session_regenerate_id(true);
            $_SESSION['admin'] = fingerprint();
            $_SESSION['issued'] = time();
            http_response_code(204);
            exit;

        case 'summary':
            requireSession();
            $days = (int) ($_GET['days'] ?? 30);
            $days = max(1, min(90, $days));
            $from = gmdate('Y-m-d', strtotime('-' . ($days - 1) . ' days UTC'));
            $provider = refreshEmailOctopus();
            $c = db();

            $stmt = $c->prepare("SELECT DATE_FORMAT(metric_date, '%Y-%m-%d') AS metric_date, metric_key, metric_count FROM site_metrics_daily WHERE metric_date >= ? ORDER BY metric_date");
            $stmt->bind_param('s', $from);
            $stmt->execute();
            $metrics = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
            $stmt->close();

            $stmt = $c->prepare('SELECT dimension_type, dimension_value, SUM(metric_count) AS metric_count FROM traffic_dimensions_daily WHERE metric_date >= ? GROUP BY dimension_type, dimension_value ORDER BY metric_count DESC');
            $stmt->bind_param('s', $from);
            $stmt->execute();
            $dims = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
            $stmt->close();

            $snapshots = $c->query("SELECT p.provider, DATE_FORMAT(p.captured_at, '%Y-%m-%dT%H:%i:%sZ') AS captured_at, p.metric_key, p.metric_value
                FROM provider_snapshots p
                WHERE p.captured_at = (SELECT MAX(s.captured_at) FROM provider_snapshots s WHERE s.provider = p.provider)")
                ->fetch_all(MYSQLI_ASSOC);

            json([
                'generatedAt' => gmdate('c'),
                'days' => $days,
                'metrics' => $metrics,
                'dims' => $dims,
                'snapshots' => $snapshots,
                'providers' => ['emailoctopus' => $provider],
            ]);
            break;

        default:
            fail('Unknown action.', 404);
    }
} catch (Throwable $e) {
    fail('Dashboard backend unavailable.', 503);
}
