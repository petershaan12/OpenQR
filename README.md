# OpenQRCard

QR Code Generator untuk membuat digital business card dengan tema dan profil yang bisa dikustomisasi.

## Tech Stack

- **Frontend**: React 19 + Vite 6 + TypeScript
- **Styling**: Tailwind CSS 4 + DaisyUI 5
- **State**: Zustand 5
- **Routing**: React Router DOM 7
- **Backend**: PHP 7.4+
- **Database**: MySQL

## Quick Start

### Development

```bash
# Install dependencies (butuh Node.js 20+)
npm install

# Jalankan frontend + backend bersamaan
npm run dev:full

# Atau jalankan terpisah:
# Terminal 1 - PHP Backend
cd php-backend && php -S localhost:8000

# Terminal 2 - React Frontend
npm run dev
```

Buka http://localhost:3000

### Build untuk Production

```bash
npm run build
```

Output di folder `dist/`

## Deployment ke Shared Hosting

### 1. Siapkan Konfigurasi Production

Pastikan `.env` sudah berisi konfigurasi database hosting dan URL API berikut:

```env
VITE_API_URL="/php-backend/api.php"

DB_HOST="localhost"
DB_PORT="3306"
DB_NAME="nama_database"
DB_USER="user_database"
DB_PASSWORD="password_database"
```

### 2. Build dan Buat ZIP

```bash
npm run build

# Gunakan nama folder lain jika folder deployment sudah ada
mkdir deployment

# Salin hasil build frontend dan backend
cp -R dist/. deployment/
cp -R php-backend deployment/

# Gunakan .htaccess utama dan sertakan konfigurasi production
cp .htaccess .env deployment/

# Buat file qr-code-production.zip
(cd deployment && zip -r ../qr-code-production.zip .)
```

### 3. Upload Files

Upload `qr-code-production.zip` ke hosting, lalu extract isinya langsung di `public_html`:

```
public_html/
├── .env
├── .htaccess
├── assets/
├── php-backend/
└── index.html
```

Jangan upload folder `deployment` sebagai folder pembungkus. File `index.html` harus berada langsung di `public_html`.

### 4. Setup Database

```sql
-- Users
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'user',
    avatar LONGTEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Themes
CREATE TABLE themes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    primary_color VARCHAR(7) NOT NULL,
    legal_info TEXT,
    welcome_screen_time INT DEFAULT 5,
    welcome_image LONGTEXT NULL,
    welcome_video LONGTEXT NULL,
    enable_welcome BOOLEAN DEFAULT TRUE,
    user_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- QR Codes
CREATE TABLE qrcodes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    surname VARCHAR(255),
    title VARCHAR(255),
    email VARCHAR(255),
    profile_image LONGTEXT NULL,
    social_network TEXT,
    theme_id INT,
    status VARCHAR(50) DEFAULT 'draft',
    unique_id VARCHAR(255) UNIQUE NOT NULL,
    scans INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (theme_id) REFERENCES themes(id) ON DELETE SET NULL
);

-- Phones
CREATE TABLE qrcode_phones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    qrcode_id INT NOT NULL,
    phone VARCHAR(50) NOT NULL,
    FOREIGN KEY (qrcode_id) REFERENCES qrcodes(id) ON DELETE CASCADE
);

-- Default admin (password: password)
INSERT INTO users (name, email, password, role) VALUES
('Admin', 'admin@example.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin');
```

## API Endpoints

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| POST | `/auth/login` | Login |
| GET | `/auth/me` | Get current user |
| GET | `/qrcodes` | List QR codes |
| POST | `/qrcodes` | Create QR code |
| GET | `/qrcodes/{id}` | Get QR code |
| PUT | `/qrcodes/{id}` | Update QR code |
| DELETE | `/qrcodes/{id}` | Delete QR code |
| GET | `/qrcodes/public/{uniqueId}` | Public QR data |
| GET | `/themes` | List themes |
| POST | `/themes` | Create theme |
| PUT | `/themes/{id}` | Update theme |
| DELETE | `/themes/{id}` | Delete theme |
| GET | `/users` | List users (admin) |
| POST | `/users` | Create user |
| PUT | `/users/{id}` | Update user |
| DELETE | `/users/{id}` | Delete user |

## Struktur Project

```
qr-code/
├── app/
│   ├── components/     # React components
│   ├── routes/         # Page components
│   ├── store/          # Zustand store
│   ├── types/          # TypeScript types
│   ├── utils/          # Utility functions
│   ├── App.tsx         # Main app dengan routing
│   ├── main.tsx        # Entry point
│   └── app.css         # Global styles
├── php-backend/
│   ├── config/         # Database config
│   ├── controllers/    # API controllers
│   ├── services/       # Business logic
│   └── api.php         # API router
├── public/
│   └── .htaccess       # Apache SPA routing
├── index.html          # HTML template
├── vite.config.ts      # Vite config
└── package.json
```

## Default Login

- Email: `admin@example.com`
- Password: `password`
