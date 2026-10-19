<?php
// services/UserService.php
require_once dirname(__DIR__) . '/config/database.php';

class UserService {
    private $db;

    public function __construct() {
        $database = new Database();
        $this->db = $database->getConnection();
    }

    public function findByEmail($email) {
        $stmt = $this->db->prepare("SELECT * FROM users WHERE email = ?");
        $stmt->execute([$email]);
        return $stmt->fetch();
    }

    public function findById($id) {
        $stmt = $this->db->prepare("
            SELECT id, name, email, role, avatar, created_at 
            FROM users 
            WHERE id = ?
        ");
        $stmt->execute([$id]);
        return $stmt->fetch();
    }

    public function verifyPassword($id, $password) {
        $stmt = $this->db->prepare("SELECT password FROM users WHERE id = ?");
        $stmt->execute([$id]);
        $user = $stmt->fetch();
        return $user && password_verify($password, $user['password']);
    }

    public function getAll() {
        $stmt = $this->db->prepare("
            SELECT id, name, email, role, avatar, created_at 
            FROM users 
            ORDER BY created_at DESC
        ");
        $stmt->execute();
        return $stmt->fetchAll();
    }

    public function create($data) {
        $hashedPassword = password_hash($data['password'] ?? 'password', PASSWORD_DEFAULT);
        $role = $data['role'] ?? 'user';
        
        $stmt = $this->db->prepare("
            INSERT INTO users (name, email, password, role) 
            VALUES (?, ?, ?, ?)
        ");
        
        return $stmt->execute([
            $data['name'],
            $data['email'], 
            $hashedPassword,
            $role
        ]);
    }

    public function update($id, $data) {
        $fields = [];
        $values = [];
        
        if (isset($data['name'])) {
            $fields[] = "name = ?";
            $values[] = $data['name'];
        }
        if (isset($data['email'])) {
            $fields[] = "email = ?";
            $values[] = $data['email'];
        }
        if (isset($data['role'])) {
            $fields[] = "role = ?";
            $values[] = $data['role'];
        }
        if (isset($data['password'])) {
            $hashedPassword = password_hash($data['password'], PASSWORD_DEFAULT);
            $fields[] = "password = ?";
            $values[] = $hashedPassword;
        }
        if (isset($data['avatar'])) {
            $fields[] = "avatar = ?";
            $values[] = $data['avatar'];
        }

        if (empty($fields)) {
            return true; // Nothing to update
        }

        $values[] = $id; // Add ID for WHERE clause
        
        $sql = "UPDATE users SET " . implode(', ', $fields) . " WHERE id = ?";
        $stmt = $this->db->prepare($sql);
        return $stmt->execute($values);
    }

    public function delete($id) {
        $stmt = $this->db->prepare("DELETE FROM users WHERE id = ?");
        return $stmt->execute([$id]);
    }
    
    public function updateCurrentUser($id, $data) {
        $fields = [];
        $values = [];
        
        if (isset($data['name'])) {
            $fields[] = "name = ?";
            $values[] = $data['name'];
        }
        if (isset($data['email'])) {
            $fields[] = "email = ?";
            $values[] = $data['email'];
        }
        if (isset($data['avatar'])) {
            $fields[] = "avatar = ?";
            $values[] = $data['avatar'];
        }
        if (isset($data['password'])) {
            $hashedPassword = password_hash($data['password'], PASSWORD_DEFAULT);
            $fields[] = "password = ?";
            $values[] = $hashedPassword;
        }

        if (empty($fields)) {
            return true; // Nothing to update
        }

        $values[] = $id; // Add ID for WHERE clause
        
        $sql = "UPDATE users SET " . implode(', ', $fields) . " WHERE id = ?";
        $stmt = $this->db->prepare($sql);
        return $stmt->execute($values);
    }
}
?>