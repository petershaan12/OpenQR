<?php
// config/database.php
class Database {
    private $host = 'localhost';
    private $port = 3306;
    private $dbname = 'qrcard';
    private $username = 'root';
    private $password = '';
    private $pdo;

    public function __construct() {
        $envFile = dirname(__DIR__, 2) . '/.env';
        $env = is_file($envFile) ? parse_ini_file($envFile, false, INI_SCANNER_RAW) : [];

        $this->host = getenv('DB_HOST') ?: ($env['DB_HOST'] ?? $this->host);
        $this->port = getenv('DB_PORT') ?: ($env['DB_PORT'] ?? $this->port);
        $this->dbname = getenv('DB_NAME') ?: ($env['DB_NAME'] ?? $this->dbname);
        $this->username = getenv('DB_USER') ?: ($env['DB_USER'] ?? $this->username);
        $this->password = getenv('DB_PASSWORD') ?: ($env['DB_PASSWORD'] ?? $this->password);

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
