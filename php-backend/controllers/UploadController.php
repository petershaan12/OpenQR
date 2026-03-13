<?php
// controllers/UploadController.php
require_once dirname(__DIR__) . '/config/session.php';
require_once dirname(__DIR__) . '/helpers/response.php';

class UploadController {
    private $uploadDir;
    private $allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    private $maxSize = 10 * 1024 * 1024; // 10MB

    public function __construct() {
        $this->uploadDir = dirname(__DIR__) . '/uploads/';

        // Create uploads directory if not exists
        if (!is_dir($this->uploadDir)) {
            mkdir($this->uploadDir, 0755, true);
        }
    }

    public function uploadImage() {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            sendErrorResponse('Method not allowed', 405);
        }

        requireAuth();

        // Check if file was uploaded
        if (!isset($_FILES['image']) || $_FILES['image']['error'] !== UPLOAD_ERR_OK) {
            $errorMsg = isset($_FILES['image']) ? $this->getUploadErrorMessage($_FILES['image']['error']) : 'No file uploaded';
            sendErrorResponse($errorMsg, 400);
        }

        $file = $_FILES['image'];

        // Validate file type
        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        $mimeType = finfo_file($finfo, $file['tmp_name']);
        finfo_close($finfo);

        if (!in_array($mimeType, $this->allowedTypes)) {
            sendErrorResponse('Invalid file type. Allowed: JPG, PNG, GIF, WEBP', 400);
        }

        // Validate file size
        if ($file['size'] > $this->maxSize) {
            sendErrorResponse('File too large. Max size: 10MB', 400);
        }

        // Generate unique filename
        $extension = $this->getExtension($mimeType);
        $filename = uniqid('img_') . '_' . time() . '.' . $extension;
        $filepath = $this->uploadDir . $filename;

        // Move uploaded file
        if (!move_uploaded_file($file['tmp_name'], $filepath)) {
            sendErrorResponse('Failed to save file', 500);
        }

        // Generate URL
        $baseUrl = $this->getBaseUrl();
        $imageUrl = $baseUrl . '/php-backend/uploads/' . $filename;

        sendJsonResponse([
            'success' => true,
            'url' => $imageUrl,
            'filename' => $filename
        ]);
    }

    public function uploadBase64() {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            sendErrorResponse('Method not allowed', 405);
        }

        requireAuth();

        $input = json_decode(file_get_contents('php://input'), true);

        if (!isset($input['image']) || empty($input['image'])) {
            sendErrorResponse('No image data provided', 400);
        }

        $imageData = $input['image'];

        // Parse base64 data
        if (preg_match('/^data:image\/(\w+);base64,/', $imageData, $matches)) {
            $extension = $matches[1];
            $imageData = substr($imageData, strpos($imageData, ',') + 1);
        } else {
            sendErrorResponse('Invalid base64 image format', 400);
        }

        // Decode base64
        $decodedImage = base64_decode($imageData);
        if ($decodedImage === false) {
            sendErrorResponse('Failed to decode base64 image', 400);
        }

        // Validate size (5MB max)
        if (strlen($decodedImage) > $this->maxSize) {
            sendErrorResponse('Image too large. Max size: 10MB', 400);
        }

        // Generate unique filename
        $filename = uniqid('img_') . '_' . time() . '.' . $extension;
        $filepath = $this->uploadDir . $filename;

        // Save file
        if (file_put_contents($filepath, $decodedImage) === false) {
            sendErrorResponse('Failed to save image', 500);
        }

        // Generate URL
        $baseUrl = $this->getBaseUrl();
        $imageUrl = $baseUrl . '/php-backend/uploads/' . $filename;

        sendJsonResponse([
            'success' => true,
            'url' => $imageUrl,
            'filename' => $filename
        ]);
    }

    public function deleteImage() {
        if ($_SERVER['REQUEST_METHOD'] !== 'DELETE') {
            sendErrorResponse('Method not allowed', 405);
        }

        requireAuth();

        $input = json_decode(file_get_contents('php://input'), true);

        if (!isset($input['filename'])) {
            sendErrorResponse('Filename required', 400);
        }

        $filename = basename($input['filename']); // Prevent directory traversal
        $filepath = $this->uploadDir . $filename;

        if (file_exists($filepath)) {
            unlink($filepath);
        }

        sendJsonResponse(['success' => true, 'message' => 'Image deleted']);
    }

    private function getExtension($mimeType) {
        $map = [
            'image/jpeg' => 'jpg',
            'image/png' => 'png',
            'image/gif' => 'gif',
            'image/webp' => 'webp'
        ];
        return $map[$mimeType] ?? 'jpg';
    }

    private function getBaseUrl() {
        $protocol = isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? 'https' : 'http';
        $host = $_SERVER['HTTP_HOST'];
        return $protocol . '://' . $host;
    }

    private function getUploadErrorMessage($errorCode) {
        $errors = [
            UPLOAD_ERR_INI_SIZE => 'File exceeds upload_max_filesize',
            UPLOAD_ERR_FORM_SIZE => 'File exceeds MAX_FILE_SIZE',
            UPLOAD_ERR_PARTIAL => 'File was only partially uploaded',
            UPLOAD_ERR_NO_FILE => 'No file was uploaded',
            UPLOAD_ERR_NO_TMP_DIR => 'Missing temp folder',
            UPLOAD_ERR_CANT_WRITE => 'Failed to write file to disk',
            UPLOAD_ERR_EXTENSION => 'Upload stopped by extension',
        ];
        return $errors[$errorCode] ?? 'Unknown upload error';
    }
}
?>
