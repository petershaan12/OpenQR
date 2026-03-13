-- Army QR Code Database Schema
-- Import this file to phpMyAdmin

-- =============================================
-- Table: users
-- =============================================
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `role` ENUM('admin', 'user') DEFAULT 'user',
  `avatar` TEXT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- Table: themes
-- =============================================
CREATE TABLE IF NOT EXISTS `themes` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `primary_color` VARCHAR(50) DEFAULT '#000000',
  `legal_info` TEXT NULL,
  `welcome_screen_time` INT DEFAULT 5,
  `welcome_image` TEXT NULL,
  `welcome_video` TEXT NULL,
  `enable_welcome` TINYINT(1) DEFAULT 1,
  `user_id` INT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- Table: qrcodes
-- =============================================
CREATE TABLE IF NOT EXISTS `qrcodes` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `surname` VARCHAR(255) NOT NULL,
  `title` VARCHAR(255) NULL,
  `email` VARCHAR(255) NULL,
  `profile_image` TEXT NULL,
  `social_network` JSON NULL,
  `theme_id` INT NULL,
  `status` ENUM('published', 'draft') DEFAULT 'draft',
  `unique_id` VARCHAR(255) NOT NULL UNIQUE,
  `scans` INT DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`theme_id`) REFERENCES `themes`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- Table: qrcode_phones
-- =============================================
CREATE TABLE IF NOT EXISTS `qrcode_phones` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `qrcode_id` INT NOT NULL,
  `phone` VARCHAR(50) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`qrcode_id`) REFERENCES `qrcodes`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- Default Admin User
-- Email: admin@armysecurityguard.co.id
-- Password: admin123 (hashed)
-- =============================================
INSERT INTO `users` (`name`, `email`, `password`, `role`) VALUES
('Admin', 'admin@armysecurity.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin');

-- =============================================
-- Default Theme
-- =============================================
INSERT INTO `themes` (`name`, `primary_color`, `legal_info`, `welcome_screen_time`, `enable_welcome`, `user_id`) VALUES
('Default Theme', '#dc2626', 'Army Security Guard - Professional Security Services', 5, 1, NULL);
