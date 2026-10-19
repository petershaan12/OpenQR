CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin', 'user') DEFAULT 'user',
  avatar VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS themes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  primary_color VARCHAR(7) DEFAULT '#DC2626',
  legal_info TEXT,
  welcome_screen_time INT DEFAULT 5,
  welcome_image LONGTEXT,
  welcome_video LONGTEXT,
  enable_welcome BOOLEAN DEFAULT FALSE,
  user_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS qrcodes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  name VARCHAR(100),
  surname VARCHAR(100),
  title VARCHAR(100),
  email VARCHAR(100),
  profile_image LONGTEXT,
  social_network TEXT,
  theme_id INT,
  status ENUM('draft', 'published') DEFAULT 'draft',
  scans INT DEFAULT 0,
  unique_id VARCHAR(50) UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (theme_id) REFERENCES themes(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS qrcode_phones (
  id INT AUTO_INCREMENT PRIMARY KEY,
  qrcode_id INT NOT NULL,
  phone VARCHAR(30),
  FOREIGN KEY (qrcode_id) REFERENCES qrcodes(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  title VARCHAR(200),
  message TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  type ENUM('info', 'success', 'warning', 'error') DEFAULT 'info',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Optional seed data
INSERT INTO users (id, name, email, password, role)
VALUES (1, 'Admin', 'admin@example.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin')
ON DUPLICATE KEY UPDATE id = id;

INSERT INTO themes (id, name, primary_color, legal_info, user_id)
VALUES
  (1, 'Red', '#DC2626', '© 2026 Your Company. All Rights Reserved.', 1),
  (2, 'Blue', '#2563EB', '© 2026 Your Company. All Rights Reserved.', 1)
ON DUPLICATE KEY UPDATE id = id;

INSERT INTO qrcodes (id, user_id, name, surname, title, email, social_network, theme_id, status, scans, unique_id)
VALUES (1, 1, 'John', 'Doe', 'Software Engineer', 'john@example.com', '{"Website":"https://petershaan.net","Instagram":"https://instagram.com/petershaan_"}', 1, 'published', 124, 'john-doe')
ON DUPLICATE KEY UPDATE id = id;

INSERT INTO qrcode_phones (id, qrcode_id, phone)
VALUES (1, 1, '081234567890')
ON DUPLICATE KEY UPDATE id = id;

INSERT INTO notifications (id, user_id, title, message, type)
VALUES (1, 1, 'Welcome!', 'Welcome to OpenQRCard.', 'success')
ON DUPLICATE KEY UPDATE id = id;
