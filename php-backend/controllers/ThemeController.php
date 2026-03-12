<?php
// controllers/ThemeController.php
require_once '../services/ThemeService.php';
require_once '../config/session.php';
require_once '../helpers/response.php';

class ThemeController {
    private $themeService;

    public function __construct() {
        $this->themeService = new ThemeService();
    }

    public function index() {
        if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
            sendErrorResponse('Method not allowed', 405);
        }

        requireAuth();
        
        $userId = getCurrentUserId();
        $themes = $this->themeService->getUserThemes($userId);

        sendJsonResponse($themes);
    }

    public function store() {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            sendErrorResponse('Method not allowed', 405);
        }

        requireAuth();
        
        $input = json_decode(file_get_contents('php://input'), true);

        $requiredFields = ['name', 'primary_color', 'legal_info'];
        validateInput($input, $requiredFields);

        $input['user_id'] = getCurrentUserId();

        $this->themeService->createTheme($input);

        sendJsonResponse(['success' => true, 'message' => 'Theme created successfully'], 201);
    }

    public function update($id) {
        if ($_SERVER['REQUEST_METHOD'] !== 'PUT' && $_SERVER['REQUEST_METHOD'] !== 'PATCH') {
            sendErrorResponse('Method not allowed', 405);
        }

        requireAuth();
        
        $input = json_decode(file_get_contents('php://input'), true);

        $requiredFields = ['name', 'primary_color', 'legal_info'];
        validateInput($input, $requiredFields);

        $userId = getCurrentUserId();
        $this->themeService->updateTheme($id, $userId, $input);

        sendJsonResponse(['success' => true, 'message' => 'Theme updated successfully']);
    }

    public function destroy($id) {
        if ($_SERVER['REQUEST_METHOD'] !== 'DELETE') {
            sendErrorResponse('Method not allowed', 405);
        }

        requireAuth();
        
        $userId = getCurrentUserId();
        $this->themeService->deleteTheme($id, $userId);

        sendJsonResponse(['success' => true, 'message' => 'Theme deleted successfully']);
    }
}
?>