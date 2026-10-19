<?php
// api.php
require_once 'controllers/AuthController.php';
require_once 'controllers/UserController.php';
require_once 'controllers/QRCodeController.php';
require_once 'controllers/ThemeController.php';
require_once 'controllers/UploadController.php';
require_once 'config/session.php';
require_once 'helpers/response.php';

// No CORS headers: the app is served same-origin (Vite dev server proxies /php-backend and /api)

// CSRF protection: state-changing requests must carry X-Requested-With (cannot be set cross-site without CORS preflight)
if (in_array($_SERVER['REQUEST_METHOD'], ['POST', 'PUT', 'PATCH', 'DELETE'], true)
    && ($_SERVER['HTTP_X_REQUESTED_WITH'] ?? '') !== 'XMLHttpRequest') {
    sendErrorResponse('Missing X-Requested-With header', 403);
}

// Parse the request
$requestUri = $_SERVER['REQUEST_URI'];
$method = $_SERVER['REQUEST_METHOD'];

// Check if path is provided as a query parameter (for direct access to php-backend/api.php)
$path = '';
if (isset($_GET['path'])) {
    $path = $_GET['path'];
} else {
    // Remove query parameters from URI
    $path = parse_url($requestUri, PHP_URL_PATH);
    // Remove the base path (assuming it's /api/)
    $basePath = '/api'; // Adjust this if your API is hosted elsewhere
    $path = str_replace($basePath, '', $path);
}

// Define routes
$routes = [
    // Auth routes
    'POST:/auth/login' => function() {
        $controller = new AuthController();
        $controller->login();
    },
    'POST:/auth/logout' => function() {
        $controller = new AuthController();
        $controller->logout();
    },
    'GET:/auth/me' => function() {
        $controller = new AuthController();
        $controller->me();
    },
    
    // User routes
    'GET:/users' => function() {
        $controller = new UserController();
        $controller->index();
    },
    'GET:/users/{id}' => function($id) {
        $controller = new UserController();
        $controller->show($id);
    },
    'POST:/users' => function() {
        $controller = new UserController();
        $controller->store();
    },
    'PUT:/users/{id}' => function($id) {
        $controller = new UserController();
        $controller->update($id);
    },
    'PATCH:/users/{id}' => function($id) {
        $controller = new UserController();
        $controller->update($id);
    },
    'PUT:/users/me' => function() {
        $controller = new UserController();
        $controller->updateMe();
    },
    'PATCH:/users/me' => function() {
        $controller = new UserController();
        $controller->updateMe();
    },
    'PUT:/users/me/password' => function() {
        $controller = new UserController();
        $controller->updatePassword();
    },
    'PATCH:/users/me/password' => function() {
        $controller = new UserController();
        $controller->updatePassword();
    },
    'DELETE:/users/{id}' => function($id) {
        $controller = new UserController();
        $controller->destroy($id);
    },
    
    // QR Code routes
    'GET:/qrcodes' => function() {
        $controller = new QRCodeController();
        $controller->index();
    },
    'GET:/qrcodes/{id}' => function($id) {
        $controller = new QRCodeController();
        $controller->show($id);
    },
    'POST:/qrcodes' => function() {
        $controller = new QRCodeController();
        $controller->store();
    },
    'PUT:/qrcodes/{id}' => function($id) {
        $controller = new QRCodeController();
        $controller->update($id);
    },
    'PATCH:/qrcodes/{id}' => function($id) {
        $controller = new QRCodeController();
        $controller->update($id);
    },
    'DELETE:/qrcodes/{id}' => function($id) {
        $controller = new QRCodeController();
        $controller->destroy($id);
    },
    'GET:/qrcodes/public/{uniqueId}' => function($uniqueId) {
        $controller = new QRCodeController();
        $controller->publicView($uniqueId);
    },
    'GET:/qrcodes/{uniqueId}/vcard' => function($uniqueId) {
        $controller = new QRCodeController();
        $controller->downloadVCard($uniqueId);
    },
    'POST:/qrcodes/{uniqueId}/increment' => function($uniqueId) {
        // This endpoint increments scan count without requiring auth
        $qrCodeService = new QRCodeService();

        $result = $qrCodeService->incrementScansByUniqueId($uniqueId);

        if ($result) {
            sendJsonResponse(['success' => true, 'message' => 'Scan count incremented']);
        } else {
            sendErrorResponse('Failed to increment scan count', 500);
        }
    },
    
    // Upload routes
    'POST:/upload/image' => function() {
        $controller = new UploadController();
        $controller->uploadImage();
    },
    'POST:/upload/base64' => function() {
        $controller = new UploadController();
        $controller->uploadBase64();
    },
    'DELETE:/upload/image' => function() {
        $controller = new UploadController();
        $controller->deleteImage();
    },

    // Theme routes
    'GET:/themes' => function() {
        $controller = new ThemeController();
        $controller->index();
    },
    'POST:/themes' => function() {
        $controller = new ThemeController();
        $controller->store();
    },
    'PUT:/themes/{id}' => function($id) {
        $controller = new ThemeController();
        $controller->update($id);
    },
    'PATCH:/themes/{id}' => function($id) {
        $controller = new ThemeController();
        $controller->update($id);
    },
    'DELETE:/themes/{id}' => function($id) {
        $controller = new ThemeController();
        $controller->destroy($id);
    },
];

// Find matching route
$routeFound = false;
foreach ($routes as $route => $handler) {
    list($routeMethod, $routePattern) = explode(':', $route, 2);
    
    if ($method !== $routeMethod) {
        continue;
    }
    
    // Convert route pattern to regex, capturing parameters
    $regexPattern = preg_quote($routePattern, '/');
    $regexPattern = str_replace('\{id\}', '(\d+)', $regexPattern);
    $regexPattern = str_replace('\{uniqueId\}', '([a-zA-Z0-9_-]+)', $regexPattern);
    
    if (preg_match('#^' . $regexPattern . '$#', $path, $matches)) {
        array_shift($matches); // Remove full match
        
        // Call the handler with captured parameters
        call_user_func_array($handler, $matches);
        $routeFound = true;
        break;
    }
}

// If no route matched
if (!$routeFound) {
    sendErrorResponse('Route not found: ' . $method . ' ' . $path, 404);
}
?>