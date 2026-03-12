<?php
// controllers/QRCodeController.php
require_once '../services/QRCodeService.php';
require_once '../config/session.php';
require_once '../helpers/response.php';

class QRCodeController {
    private $qrCodeService;

    public function __construct() {
        $this->qrCodeService = new QRCodeService();
    }

    public function index() {
        if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
            sendErrorResponse('Method not allowed', 405);
        }

        requireAuth();
        
        $userId = getCurrentUserId();
        $qrcodes = $this->qrCodeService->getUserQRCodes($userId);

        sendJsonResponse($qrcodes);
    }

    public function show($id) {
        if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
            sendErrorResponse('Method not allowed', 405);
        }

        requireAuth();
        
        $userId = getCurrentUserId();
        $qrCode = $this->qrCodeService->getQRCodeById($id, $userId);

        if (!$qrCode) {
            sendErrorResponse('QR Code not found', 404);
        }

        sendJsonResponse($qrCode);
    }

    public function store() {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            sendErrorResponse('Method not allowed', 405);
        }

        requireAuth();
        
        $input = json_decode(file_get_contents('php://input'), true);

        $requiredFields = ['name', 'surname', 'title', 'email', 'social_network', 'theme_id', 'status', 'phones'];
        validateInput($input, $requiredFields);

        $input['user_id'] = getCurrentUserId();

        $qrCode = $this->qrCodeService->createQRCode($input);

        sendJsonResponse($qrCode, 201);
    }

    public function update($id) {
        if ($_SERVER['REQUEST_METHOD'] !== 'PUT' && $_SERVER['REQUEST_METHOD'] !== 'PATCH') {
            sendErrorResponse('Method not allowed', 405);
        }

        requireAuth();
        
        $input = json_decode(file_get_contents('php://input'), true);

        $userId = getCurrentUserId();
        $result = $this->qrCodeService->updateQRCode($id, $userId, $input);

        if (!$result) {
            sendErrorResponse('Failed to update QR Code', 500);
        }

        sendJsonResponse(['success' => true, 'message' => 'QR Code updated successfully']);
    }

    public function destroy($id) {
        if ($_SERVER['REQUEST_METHOD'] !== 'DELETE') {
            sendErrorResponse('Method not allowed', 405);
        }

        requireAuth();
        
        $userId = getCurrentUserId();
        $result = $this->qrCodeService->deleteQRCode($id, $userId);

        if (!$result) {
            sendErrorResponse('Failed to delete QR Code', 500);
        }

        sendJsonResponse(['success' => true, 'message' => 'QR Code deleted successfully']);
    }

    public function publicView($uniqueId) {
        if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
            sendErrorResponse('Method not allowed', 405);
        }

        $result = $this->qrCodeService->getQRCodeByUniqueId($uniqueId);

        if (!$result) {
            sendErrorResponse('QR Code not found', 404);
        }

        // Increment scan count
        $this->qrCodeService->incrementScans($uniqueId);

        sendJsonResponse($result);
    }
}
?>