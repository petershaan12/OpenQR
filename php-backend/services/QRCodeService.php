<?php
// services/QRCodeService.php
require_once '../config/database.php';

class QRCodeService {
    private $db;

    public function __construct() {
        $database = new Database();
        $this->db = $database->getConnection();
    }

    public function getUserQRCodes($userId) {
        $stmt = $this->db->prepare("
            SELECT q.*,
            (SELECT phone FROM qrcode_phones WHERE qrcode_id = q.id LIMIT 1) as main_phone
            FROM qrcodes q
            WHERE q.user_id = ?
            ORDER BY q.created_at DESC
        ");
        $stmt->execute([$userId]);
        return $stmt->fetchAll();
    }

    public function createQRCode($data) {
        // Generate unique ID
        $uniqueId = $this->generateUniqueId($data['name'], $data['surname']);
        
        // Ensure uniqueness
        $attempts = 0;
        while ($this->isUniqueIdExists($uniqueId) && $attempts < 10) {
            $uniqueId = $this->generateUniqueId($data['name'], $data['surname']);
            $attempts++;
        }
        
        if ($this->isUniqueIdExists($uniqueId)) {
            throw new Exception("Could not generate unique ID after 10 attempts");
        }

        // Insert QR Code
        $stmt = $this->db->prepare("
            INSERT INTO qrcodes 
            (user_id, name, surname, title, email, profile_image, social_network, theme_id, status, unique_id) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");
        
        $result = $stmt->execute([
            $data['user_id'],
            $data['name'],
            $data['surname'],
            $data['title'],
            $data['email'],
            $data['profile_image'],
            $data['social_network'],
            $data['theme_id'],
            $data['status'],
            $uniqueId
        ]);

        $qrId = $this->db->lastInsertId();

        // Insert Phones
        if (isset($data['phones']) && is_array($data['phones'])) {
            foreach ($data['phones'] as $phone) {
                if (!empty(trim($phone))) {
                    $phoneStmt = $this->db->prepare("
                        INSERT INTO qrcode_phones (qrcode_id, phone) 
                        VALUES (?, ?)
                    ");
                    $phoneStmt->execute([$qrId, trim($phone)]);
                }
            }
        }

        // Return the created QR code
        return $this->getQRCodeById($qrId, $data['user_id']);
    }

    public function getQRCodeById($id, $userId) {
        $stmt = $this->db->prepare("
            SELECT * FROM qrcodes 
            WHERE id = ? AND user_id = ?
        ");
        $stmt->execute([$id, $userId]);
        $qrCode = $stmt->fetch();

        if (!$qrCode) {
            return null;
        }

        // Get associated phones
        $phoneStmt = $this->db->prepare("
            SELECT id, phone 
            FROM qrcode_phones 
            WHERE qrcode_id = ?
        ");
        $phoneStmt->execute([$id]);
        $qrCode['phones'] = $phoneStmt->fetchAll();

        return $qrCode;
    }

    public function getQRCodeByUniqueId($uniqueId) {
        $stmt = $this->db->prepare("
            SELECT q.*, t.primary_color, t.legal_info, t.welcome_screen_time, t.welcome_image, t.welcome_video, t.enable_welcome
            FROM qrcodes q
            LEFT JOIN themes t ON q.theme_id = t.id
            WHERE q.unique_id = ?
        ");
        $stmt->execute([$uniqueId]);
        $qrCode = $stmt->fetch();

        if (!$qrCode) {
            return null;
        }

        // Get associated phones
        $phoneStmt = $this->db->prepare("
            SELECT phone as value 
            FROM qrcode_phones 
            WHERE qrcode_id = ?
        ");
        $phoneStmt->execute([$qrCode['id']]);
        $phones = $phoneStmt->fetchAll();

        return [
            'qr' => $qrCode,
            'phones' => $phones
        ];
    }

    public function incrementScans($uniqueId) {
        $stmt = $this->db->prepare("
            UPDATE qrcodes 
            SET scans = scans + 1 
            WHERE unique_id = ?
        ");
        return $stmt->execute([$uniqueId]);
    }
    
    public function incrementScansByUniqueId($uniqueId) {
        return $this->incrementScans($uniqueId);
    }

    public function updateQRCode($qrId, $userId, $data) {
        $fields = [];
        $values = [];
        
        if (isset($data['name'])) {
            $fields[] = "name = ?";
            $values[] = $data['name'];
        }
        if (isset($data['surname'])) {
            $fields[] = "surname = ?";
            $values[] = $data['surname'];
        }
        if (isset($data['title'])) {
            $fields[] = "title = ?";
            $values[] = $data['title'];
        }
        if (isset($data['email'])) {
            $fields[] = "email = ?";
            $values[] = $data['email'];
        }
        if (isset($data['profile_image'])) {
            $fields[] = "profile_image = ?";
            $values[] = $data['profile_image'];
        }
        if (isset($data['social_network'])) {
            $fields[] = "social_network = ?";
            $values[] = $data['social_network'];
        }
        if (isset($data['theme_id'])) {
            $fields[] = "theme_id = ?";
            $values[] = $data['theme_id'];
        }
        if (isset($data['status'])) {
            $fields[] = "status = ?";
            $values[] = $data['status'];
        }

        if (empty($fields)) {
            // Still need to update phones even if no other fields changed
            if (isset($data['phones']) && is_array($data['phones'])) {
                $this->updatePhones($qrId, $data['phones']);
            }
            return true;
        }

        $values[] = $qrId;
        $values[] = $userId;

        $sql = "UPDATE qrcodes SET " . implode(', ', $fields) . " WHERE id = ? AND user_id = ?";
        $stmt = $this->db->prepare($sql);
        $result = $stmt->execute($values);

        // Update phones if provided
        if (isset($data['phones']) && is_array($data['phones'])) {
            $this->updatePhones($qrId, $data['phones']);
        }

        return $result;
    }

    public function deleteQRCode($qrId, $userId) {
        $stmt = $this->db->prepare("
            DELETE FROM qrcodes 
            WHERE id = ? AND user_id = ?
        ");
        return $stmt->execute([$qrId, $userId]);
    }

    private function updatePhones($qrId, $phones) {
        // Delete existing phones
        $deleteStmt = $this->db->prepare("
            DELETE FROM qrcode_phones 
            WHERE qrcode_id = ?
        ");
        $deleteStmt->execute([$qrId]);

        // Insert new phones
        foreach ($phones as $phone) {
            if (!empty(trim($phone))) {
                $insertStmt = $this->db->prepare("
                    INSERT INTO qrcode_phones (qrcode_id, phone) 
                    VALUES (?, ?)
                ");
                $insertStmt->execute([$qrId, trim($phone)]);
            }
        }
    }

    private function generateUniqueId($name, $surname) {
        $base = preg_replace('/[^A-Za-z0-9]/', '', strtolower($name . $surname));
        $suffix = substr(str_shuffle('abcdefghijklmnopqrstuvwxyz0123456789'), 0, 6);
        return $base . $suffix;
    }

    private function isUniqueIdExists($uniqueId) {
        $stmt = $this->db->prepare("
            SELECT COUNT(*) as count 
            FROM qrcodes 
            WHERE unique_id = ?
        ");
        $stmt->execute([$uniqueId]);
        $result = $stmt->fetch();
        return $result['count'] > 0;
    }
}
?>