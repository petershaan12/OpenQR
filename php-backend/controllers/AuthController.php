<?php
// controllers/AuthController.php
require_once '../services/UserService.php';
require_once '../config/session.php';
require_once '../helpers/response.php';

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

        $user = $this->userService->findByEmail($email);

        if (!$user || !password_verify($password, $user['password'])) {
            sendErrorResponse('Invalid email or password', 401);
        }

        login($user['id']);

        sendJsonResponse([
            'success' => true,
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
        
        sendJsonResponse($user);
    }
}
?>