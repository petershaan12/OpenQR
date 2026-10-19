<?php
// config/session.php
if (session_status() === PHP_SESSION_NONE) {
    $isHttps = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off')
        || (($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? '') === 'https');
    ini_set('session.use_strict_mode', '1');
    session_set_cookie_params([
        'lifetime' => 0,
        'path' => '/',
        'httponly' => true,
        'secure' => $isHttps,
        'samesite' => 'Lax',
    ]);
    session_start();
}

function isLoggedIn() {
    return isset($_SESSION['user_id']) && !empty($_SESSION['user_id']);
}

function getCurrentUserId() {
    return $_SESSION['user_id'] ?? null;
}

function login($userId) {
    $_SESSION['user_id'] = $userId;
    $_SESSION['login_time'] = time();
}

function logout() {
    unset($_SESSION['user_id']);
    unset($_SESSION['login_time']);
    session_destroy();
    session_start();
}

function requireAuth() {
    if (!isLoggedIn()) {
        http_response_code(401);
        header('Content-Type: application/json');
        echo json_encode(['error' => 'Unauthorized']);
        exit;
    }
}

function isAdmin() {
    if (!isLoggedIn()) {
        return false;
    }
    require_once __DIR__ . '/database.php';
    $db = (new Database())->getConnection();
    $stmt = $db->prepare("SELECT role FROM users WHERE id = ?");
    $stmt->execute([getCurrentUserId()]);
    $user = $stmt->fetch();
    return $user && $user['role'] === 'admin';
}

function requireAdmin() {
    requireAuth();
    if (!isAdmin()) {
        http_response_code(403);
        header('Content-Type: application/json');
        echo json_encode(['error' => 'Forbidden']);
        exit;
    }
}
?>