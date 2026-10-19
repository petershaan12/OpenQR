<?php
// controllers/AuthController.php
require_once dirname(__DIR__) . '/services/UserService.php';
require_once dirname(__DIR__) . '/config/session.php';
require_once dirname(__DIR__) . '/helpers/response.php';

class AuthController {
    private $userService;

    public function __construct() {
        $this->userService = new UserService();
    }

    public function login() {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            sendErrorResponse('Method not allowed', 405);
        }

        $input = json_decode(file_get_contents('php://input'), true);

        $email = $input['email'] ?? null;
        $password = $input['password'] ?? null;

        if (!$email || !$password) {
            sendErrorResponse('Email and password are required', 400);
        }

        // ponytail: file-based counter in the temp dir is per-server; move to DB/Redis if running multiple app servers
        $limitFile = sys_get_temp_dir() . '/openqrcard_login_' . sha1(($_SERVER['REMOTE_ADDR'] ?? '') . '|' . strtolower($email));
        $attempts = is_file($limitFile) ? json_decode((string) @file_get_contents($limitFile), true) : null;
        if (!is_array($attempts) || time() - ($attempts['first'] ?? 0) > 900) {
            $attempts = ['count' => 0, 'first' => time()];
        }
        if ($attempts['count'] >= 5) {
            sendErrorResponse('Too many failed attempts. Try again in 15 minutes.', 429);
        }

        $user = $this->userService->findByEmail($email);

        if (!$user || !password_verify($password, $user['password'])) {
            $attempts['count']++;
            file_put_contents($limitFile, json_encode($attempts), LOCK_EX);
            sendErrorResponse('Invalid email or password', 401);
        }

        @unlink($limitFile);

        session_regenerate_id(true);
        login($user['id']);

        $mustChange = $password === 'password';
        if ($mustChange) {
            $_SESSION['must_change_password'] = true;
        } else {
            unset($_SESSION['must_change_password']);
        }

        sendJsonResponse([
            'success' => true,
            'must_change_password' => $mustChange,
            'user' => [
                'id' => $user['id'],
                'name' => $user['name'],
                'email' => $user['email'],
                'role' => $user['role'],
                'avatar' => $user['avatar'],
                'created_at' => $user['created_at']
            ]
        ]);
    }

    public function logout() {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            sendErrorResponse('Method not allowed', 405);
        }

        logout();

        sendJsonResponse(['success' => true]);
    }

    public function me() {
        if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
            sendErrorResponse('Method not allowed', 405);
        }

        requireAuth();
        
        $userId = getCurrentUserId();
        $user = $this->userService->findById($userId);

        if (!$user) {
            sendErrorResponse('User not found', 404);
        }

        // Remove password from response for security
        unset($user['password']);
        $user['must_change_password'] = !empty($_SESSION['must_change_password']);
        
        sendJsonResponse($user);
    }
}
?>