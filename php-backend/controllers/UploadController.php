<?php
// controllers/UploadController.php
require_once dirname(__DIR__) . '/config/session.php';
require_once dirname(__DIR__) . '/helpers/response.php';

class UploadController {
    private $uploadDir;
    private $allowedImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    private $allowedVideoTypes = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo'];
    private $maxImageSize = 10 * 1024 * 1024; // 10MB
    private $maxVideoSize = 50 * 1024 * 1024; // 50MB

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

        $isImage = in_array($mimeType, $this->allowedImageTypes);
        $isVideo = in_array($mimeType, $this->allowedVideoTypes);

        if (!$isImage && !$isVideo) {
            sendErrorResponse('Invalid file type. Allowed: JPG, PNG, GIF, WEBP, MP4, WEBM, MOV, AVI', 400);
        }

        // Validate file size based on type
        $maxSize = $isVideo ? $this->maxVideoSize : $this->maxImageSize;
        if ($file['size'] > $maxSize) {
            $maxMB = $maxSize / (1024 * 1024);
            sendErrorResponse("File too large. Max size: {$maxMB}MB", 400);
        }

        // Generate unique filename
        $extension = $this->getExtension($mimeType);
        $prefix = $isVideo ? 'vid_' : 'img_';
        $filename = uniqid($prefix) . '_' . time() . '.' . $extension;
        $filepath = $this->uploadDir . $filename;

        // Move uploaded file
        if (!move_uploaded_file($file['tmp_name'], $filepath)) {
            sendErrorResponse('Failed to save file', 500);
        }

        // Generate URL
        $baseUrl = $this->getBaseUrl();
        $fileUrl = $baseUrl . '/php-backend/uploads/' . $filename;

        sendJsonResponse([
            'success' => true,
            'url' => $fileUrl,
            'filename' => $filename,
            'type' => $isVideo ? 'video' : 'image'
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

        $mediaData = $input['image'];
        $isVideo = false;

        // Parse base64 data (image or video)
        if (preg_match('/^data:image\/(\w+);base64,/', $mediaData, $matches)) {
            $extension = $matches[1];
            $mediaData = substr($mediaData, strpos($mediaData, ',') + 1);
        } elseif (preg_match('/^data:video\/(\w+);base64,/', $mediaData, $matches)) {
            $extension = $matches[1];
            $mediaData = substr($mediaData, strpos($mediaData, ',') + 1);
            $isVideo = true;
            // Map video extensions
            if ($extension === 'quicktime') $extension = 'mov';
            if ($extension === 'x-msvideo') $extension = 'avi';
        } else {
            sendErrorResponse('Invalid base64 format. Allowed: images (JPG, PNG, GIF, WEBP) and videos (MP4, WEBM, MOV)', 400);
        }

        // Decode base64
        $decodedMedia = base64_decode($mediaData);
        if ($decodedMedia === false) {
            sendErrorResponse('Failed to decode base64 data', 400);
        }

        // Validate size based on type
        $maxSize = $isVideo ? $this->maxVideoSize : $this->maxImageSize;
        if (strlen($decodedMedia) > $maxSize) {
            $maxMB = $maxSize / (1024 * 1024);
            sendErrorResponse("File too large. Max size: {$maxMB}MB", 400);
        }

        // Generate unique filename
        $prefix = $isVideo ? 'vid_' : 'img_';
        $filename = uniqid($prefix) . '_' . time() . '.' . $extension;
        $filepath = $this->uploadDir . $filename;

        // Save file
        if (file_put_contents($filepath, $decodedMedia) === false) {
            sendErrorResponse('Failed to save file', 500);
        }

        // Generate URL
        $baseUrl = $this->getBaseUrl();
        $fileUrl = $baseUrl . '/php-backend/uploads/' . $filename;

        sendJsonResponse([
            'success' => true,
            'url' => $fileUrl,
            'filename' => $filename,
            'type' => $isVideo ? 'video' : 'image'
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
            'image/webp' => 'webp',
            'video/mp4' => 'mp4',
            'video/webm' => 'webm',
            'video/quicktime' => 'mov',
            'video/x-msvideo' => 'avi'
        ];
        return $map[$mimeType] ?? 'bin';
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
