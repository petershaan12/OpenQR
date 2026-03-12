# ArmyQRCode - QR Code Generator Application

## Overview

ArmyQRCode is a React-based QR code generator application that allows users to create digital business cards with customizable themes and profiles. The application has been configured to work with a PHP backend for deployment on shared hosting environments.

## Architecture

The application follows a decoupled architecture:
- **Frontend**: React application built with React Router v7
- **Backend**: PHP API that handles database operations and authentication
- **Database**: MySQL for data storage

## Deployment for Shared Hosting

### Prerequisites

- Web server with PHP 7.4+ support
- MySQL database
- Ability to modify .htaccess files (Apache) or equivalent (Nginx)

### Step 1: Prepare the Frontend

1. Build the React application:
   ```bash
   npm run build
   ```

2. The build output will be in the `build/client` directory

### Step 2: Set Up the PHP Backend

1. Upload the `php-backend` directory to your web server (e.g., to `/public_html/php-backend/`)

2. Update the database configuration in `php-backend/config/database.php`:
   ```php
   private $host = 'localhost'; // Your database host
   private $port = 3306;        // Your database port
   private $dbname = 'your_database_name';
   private $username = 'your_db_username';
   private $password = 'your_db_password';
   ```

### Step 3: Database Setup

Run the following SQL commands to create the necessary tables:

```sql
-- Users table
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'user',
    avatar VARCHAR(255) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Themes table
CREATE TABLE themes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    primary_color VARCHAR(7) NOT NULL,
    legal_info TEXT,
    welcome_screen_time INT DEFAULT 5,
    welcome_image VARCHAR(255) NULL,
    welcome_video VARCHAR(255) NULL,
    enable_welcome BOOLEAN DEFAULT TRUE,
    user_id INT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- QR Codes table
CREATE TABLE qrcodes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    surname VARCHAR(255) NOT NULL,
    title VARCHAR(255),
    email VARCHAR(255),
    profile_image VARCHAR(255) NULL,
    social_network VARCHAR(255),
    theme_id INT,
    status VARCHAR(50) DEFAULT 'active',
    unique_id VARCHAR(255) UNIQUE NOT NULL,
    scans INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (theme_id) REFERENCES themes(id) ON DELETE SET NULL
);

-- QR Code Phones table
CREATE TABLE qrcode_phones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    qrcode_id INT NOT NULL,
    phone VARCHAR(50) NOT NULL,
    FOREIGN KEY (qrcode_id) REFERENCES qrcodes(id) ON DELETE CASCADE
);

-- Insert default admin user (password is 'password')
INSERT INTO users (name, email, password, role) VALUES 
('Admin', 'admin@example.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin');
```

### Step 4: Configure Web Server

#### Apache (.htaccess)

A properly configured `.htaccess` file is included with the project. It handles:

- Routing API requests to the PHP backend
- Enabling client-side routing for React Router
- Security measures to protect sensitive files
- Proper headers for security

### Step 5: Deploy Files

1. Upload the contents of `build/client` to your web server's document root
2. Upload the `php-backend` directory to your web server
3. Ensure your web server has write permissions for PHP session storage
4. Update the database configuration in `php-backend/config/database.php`

### API Endpoints

The PHP backend provides the following API endpoints:

- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user info
- `GET /api/users` - Get all users (admin only)
- `GET /api/users/{id}` - Get specific user
- `POST /api/users` - Create new user
- `PUT/PATCH /api/users/{id}` - Update user
- `PUT/PATCH /api/users/me` - Update current user profile
- `PUT/PATCH /api/users/me/password` - Update current user password
- `DELETE /api/users/{id}` - Delete user
- `GET /api/qrcodes` - Get user's QR codes
- `GET /api/qrcodes/{id}` - Get specific QR code
- `POST /api/qrcodes` - Create new QR code
- `PUT/PATCH /api/qrcodes/{id}` - Update QR code
- `DELETE /api/qrcodes/{id}` - Delete QR code
- `GET /api/qrcodes/public/{uniqueId}` - Get public QR code data
- `POST /api/qrcodes/{uniqueId}/increment` - Increment scan count
- `GET /api/themes` - Get user's themes
- `POST /api/themes` - Create new theme
- `PUT/PATCH /api/themes/{id}` - Update theme
- `DELETE /api/themes/{id}` - Delete theme

## Development

For development purposes, you can run the application locally:

```bash
npm run dev
```

## Security Considerations

- Always use HTTPS in production
- Sanitize all user inputs
- Regularly update dependencies
- Protect against CSRF attacks
- Implement rate limiting for API endpoints
- The included .htaccess file provides additional security measures

## Troubleshooting

If you encounter issues:

1. Check that PHP sessions are working properly
2. Verify database connection settings
3. Ensure the web server can write to session storage
4. Check that all required PHP extensions are installed (PDO, MySQL)
5. Verify file permissions for uploaded content

## Support

For support, please contact the development team or refer to the project documentation.