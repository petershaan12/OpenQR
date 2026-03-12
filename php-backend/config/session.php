<?php
// config/session.php
session_start();

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
?>