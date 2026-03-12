<?php
// controllers/UserController.php
require_once '../services/UserService.php';
require_once '../config/session.php';
require_once '../helpers/response.php';

class UserController {
    private $userService;

    public function __construct() {
        $this->userService = new UserService();
    }

    public function index() {
        if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
            sendErrorResponse('Method not allowed', 405);
        }

        requireAuth();
        
        $users = $this->userService->getAll();

        sendJsonResponse($users);
    }

    public function show($id) {
        if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
            sendErrorResponse('Method not allowed', 405);
        }

        requireAuth();
        
        $user = $this->userService->findById($id);

        if (!$user) {
            sendErrorResponse('User not found', 404);
        }

        // Remove password from response for security
        unset($user['password']);
        
        sendJsonResponse($user);
    }

    public function store() {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            sendErrorResponse('Method not allowed', 405);
        }

        requireAuth();
        
        $input = json_decode(file_get_contents('php://input'), true);

        $requiredFields = ['name', 'email', 'password'];
        validateInput($input, $requiredFields);

        // Check if email already exists
        $existingUser = $this->userService->findByEmail($input['email']);
        if ($existingUser) {
            sendErrorResponse('Email already exists', 400);
        }

        $this->userService->create($input);

        sendJsonResponse(['success' => true, 'message' => 'User created successfully']);
    }

    public function update($id) {
        if ($_SERVER['REQUEST_METHOD'] !== 'PUT' && $_SERVER['REQUEST_METHOD'] !== 'PATCH') {
            sendErrorResponse('Method not allowed', 405);
        }

        requireAuth();
        
        $input = json_decode(file_get_contents('php://input'), true);

        $this->userService->update($id, $input);

        sendJsonResponse(['success' => true, 'message' => 'User updated successfully']);
    }

    public function updateMe() {
        if ($_SERVER['REQUEST_METHOD'] !== 'PUT' && $_SERVER['REQUEST_METHOD'] !== 'PATCH') {
            sendErrorResponse('Method not allowed', 405);
        }

        requireAuth();
        
        $userId = getCurrentUserId();
        $input = json_decode(file_get_contents('php://input'), true);

        $this->userService->updateCurrentUser($userId, $input);

        sendJsonResponse(['success' => true, 'message' => 'Profile updated successfully']);
    }

    public function updatePassword() {
        if ($_SERVER['REQUEST_METHOD'] !== 'PUT' && $_SERVER['REQUEST_METHOD'] !== 'PATCH') {
            sendErrorResponse('Method not allowed', 405);
        }

        requireAuth();
        
        $userId = getCurrentUserId();
        $input = json_decode(file_get_contents('php://input'), true);

        if (!isset($input['password']) || empty($input['password'])) {
            sendErrorResponse('Password is required', 400);
        }

        // Update the password
        $updateData = ['password' => $input['password']];
        $this->userService->updateCurrentUser($userId, $updateData);

        sendJsonResponse(['success' => true, 'message' => 'Password updated successfully']);
    }

    public function destroy($id) {
        if ($_SERVER['REQUEST_METHOD'] !== 'DELETE') {
            sendErrorResponse('Method not allowed', 405);
        }

        requireAuth();
        
        $this->userService->delete($id);

        sendJsonResponse(['success' => true, 'message' => 'User deleted successfully']);
    }
}
?>