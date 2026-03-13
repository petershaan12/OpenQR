<?php
// helpers/response.php
function sendJsonResponse($data, $statusCode = 200) {
    http_response_code($statusCode);
    header('Content-Type: application/json');
    echo json_encode($data);
    exit;
}

function sendErrorResponse($message, $statusCode = 400) {
    http_response_code($statusCode);
    header('Content-Type: application/json');
    echo json_encode(['error' => $message]);
    exit;
}

function validateInput($data, $requiredFields) {
    foreach ($requiredFields as $field) {
        if (!isset($data[$field])) {
            sendErrorResponse("Field '{$field}' is required", 400);
        }
        // Only trim strings, not arrays
        if (is_string($data[$field]) && empty(trim($data[$field]))) {
            sendErrorResponse("Field '{$field}' is required", 400);
        }
        // Check empty arrays
        if (is_array($data[$field]) && empty($data[$field])) {
            sendErrorResponse("Field '{$field}' is required", 400);
        }
    }
}
?>