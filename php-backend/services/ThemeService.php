<?php
// services/ThemeService.php
require_once '../config/database.php';

class ThemeService {
    private $db;

    public function __construct() {
        $database = new Database();
        $this->db = $database->getConnection();
    }

    public function getUserThemes($userId) {
        $stmt = $this->db->prepare("
            SELECT * FROM themes 
            WHERE user_id = ? OR user_id IS NULL 
            ORDER BY id ASC
        ");
        $stmt->execute([$userId]);
        return $stmt->fetchAll();
    }

    public function createTheme($data) {
        $stmt = $this->db->prepare("
            INSERT INTO themes 
            (name, primary_color, legal_info, welcome_screen_time, welcome_image, welcome_video, enable_welcome, user_id) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ");
        
        return $stmt->execute([
            $data['name'],
            $data['primary_color'],
            $data['legal_info'],
            $data['welcome_screen_time'] ?? 5,
            $data['welcome_image'] ?? null,
            $data['welcome_video'] ?? null,
            $data['enable_welcome'] ?? true,
            $data['user_id']
        ]);
    }

    public function updateTheme($id, $userId, $data) {
        $stmt = $this->db->prepare("
            UPDATE themes 
            SET name = ?, primary_color = ?, legal_info = ?, 
                welcome_screen_time = ?, welcome_image = ?, 
                welcome_video = ?, enable_welcome = ? 
            WHERE id = ? AND user_id = ?
        ");
        
        return $stmt->execute([
            $data['name'],
            $data['primary_color'],
            $data['legal_info'],
            $data['welcome_screen_time'] ?? 5,
            $data['welcome_image'] ?? null,
            $data['welcome_video'] ?? null,
            $data['enable_welcome'] ?? true,
            $id,
            $userId
        ]);
    }

    public function deleteTheme($id, $userId) {
        $stmt = $this->db->prepare("
            DELETE FROM themes 
            WHERE id = ? AND user_id = ?
        ");
        return $stmt->execute([$id, $userId]);
    }
}
?>