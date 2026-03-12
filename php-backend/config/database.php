<?php
// config/database.php
class Database {
    private $host = 'localhost';
    private $port = 3306;
    private $dbname = 'army_qrcode';
    private $username = 'root';
    private $password = 'Indonesia77';
    private $pdo;

    public function __construct() {
        // Override with environment variables if available
        $this->host = $_ENV['DB_HOST'] ?? $this->host;
        $this->port = $_ENV['DB_PORT'] ?? $this->port;
        $this->dbname = $_ENV['DB_NAME'] ?? $this->dbname;
        $this->username = $_ENV['DB_USER'] ?? $this->username;
        $this->password = $_ENV['DB_PASSWORD'] ?? $this->password;

        $dsn = "mysql:host={$this->host};port={$this->port};dbname={$this->dbname}";
        
        try {
            $this->pdo = new PDO($dsn, $this->username, $this->password, [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
            ]);
        } catch (PDOException $e) {
            throw new Exception("Connection failed: " . $e->getMessage());
        }
    }

    public function getConnection() {
        return $this->pdo;
    }
}
?>