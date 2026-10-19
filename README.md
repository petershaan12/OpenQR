<p align="center">
  <img alt="OpenQRCard logo" src="public/logo.svg" width="100">
  <h1 align="center">OpenQRCard</h1>
  <p align="center">
    Made with ❤️ by <a href="https://github.com/petershaan12">Peter Shaan</a>.
  </p>
</p>

<p align="center">
  OpenQRCard – an open-source digital business card & QR code manager. <br/>
  <b>PHP edition</b>: runs on any cheap shared hosting (cPanel) — no Docker, no VPS.
</p>

<p align="center">
  <a href="https://react.dev/">
    <img alt="React" src="https://img.shields.io/badge/React%2019-20232A?style=for-the-badge&logo=react&logoColor=61DAFB">
  </a>
  <a href="https://vite.dev/">
    <img alt="Vite" src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white">
  </a>
  <a href="https://www.php.net/">
    <img alt="PHP" src="https://img.shields.io/badge/PHP%207.4+-777BB4?style=for-the-badge&logo=php&logoColor=white">
  </a>
  <a href="https://www.mysql.com/">
    <img alt="MySQL" src="https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white">
  </a>
  <a href="https://github.com/petershaan12/qr-code/blob/php/LICENSE">
    <img alt="License MIT" src="https://img.shields.io/badge/License-MIT-000000?style=for-the-badge">
  </a>
</p>

> **Two versions are available:**
> - [`main`](https://github.com/petershaan12/qr-code/tree/main) — React Router SSR + Node.js, deploy with Docker on a VPS.
> - [`php`](https://github.com/petershaan12/qr-code/tree/php) (this branch) — React + Vite static frontend with a PHP API, deploy to shared hosting by uploading a ZIP.

## About

OpenQRCard lets you create digital business cards that open from a QR code. Each person gets a public profile page (`/your-id`) with their name, title, phone numbers, emails, social links and a **Save to Contacts** button that downloads a vCard.

This branch is built for people who only have shared hosting (cPanel, Hostinger, Niagahoster, etc.): build once on your computer, upload a ZIP, import the database, done.

---

## Features

- **QR Code Generation**: Every card gets a QR code ready to print or share.
- **Public Profile Card**: Mobile-friendly card page at `/:id` — no login needed for visitors.
- **vCard Download**: One tap "Save to Contacts" (`/:id/vcard`).
- **Live Phone Preview**: See changes in a phone mockup while editing.
- **Profile Picture Upload**: Upload a photo for each card.
- **Multiple Contacts**: Multiple phone numbers, emails and social links (Instagram, LinkedIn, WhatsApp, TikTok, YouTube, etc.).
- **Theme System**: Brand themes with primary color, footer text, and an optional welcome screen (image/video).
- **User Management**: Admin dashboard to manage users and roles.
- **Scan Counter**: Track how many times each card was opened.
- **Shared Hosting Ready**: Only needs Apache + PHP 7.4+ + MySQL.

## Screenshots

| Login | Dashboard |
| --- | --- |
| <img src="docs/screenshots/login.png" width="400"> | <img src="docs/screenshots/dashboard.png" width="400"> |
| **Card Editor + Live Preview** | **Public Card** |
| <img src="docs/screenshots/editor.png" width="400"> | <img src="docs/screenshots/public-card.png" width="250"> |

---

## How to Use (Local Development)

Requirements: **Node.js 20+**, **PHP 7.4+** (with `pdo_mysql`), and **MySQL**.

1. **Clone the branch**:

   ```bash
   git clone -b php https://github.com/petershaan12/qr-code.git qr-code-php
   cd qr-code-php
   npm install
   ```

2. **Create the database** and import the schema + seed data:

   ```bash
   mysql -u root -p -e "CREATE DATABASE qrcard"
   mysql --default-character-set=utf8mb4 -u root -p qrcard < database/init.sql
   ```

3. **Create `.env`** in the project root:

   ```env
   VITE_API_URL="/php-backend/api.php"

   DB_HOST="localhost"
   DB_PORT="3306"
   DB_NAME="qrcard"
   DB_USER="root"
   DB_PASSWORD="your_password"
   ```

4. **Run frontend + PHP backend together**:

   ```bash
   npm run dev:full
   ```

   Open [http://localhost:3000](http://localhost:3000) and log in with **`admin@example.com` / `password`**.

## Deploy to Shared Hosting (cPanel)

1. **Set `.env`** to your hosting database (create it in cPanel → *MySQL Databases* and give the user *All Privileges*):

   ```env
   VITE_API_URL="/php-backend/api.php"

   DB_HOST="localhost"
   DB_PORT="3306"
   DB_NAME="cpaneluser_qrcard"
   DB_USER="cpaneluser_dbuser"
   DB_PASSWORD="your_db_password"
   ```

2. **Build and create the ZIP**:

   ```bash
   npm run build
   mkdir deployment
   cp -R dist/. deployment/
   cp -R php-backend deployment/
   cp .htaccess .env deployment/
   (cd deployment && zip -r ../qr-code-production.zip .)
   ```

3. **Upload** `qr-code-production.zip` with cPanel → *File Manager* and **extract it directly inside** `public_html` (not inside a subfolder):

   ```
   public_html/
   ├── .env
   ├── .htaccess
   ├── assets/
   ├── php-backend/
   └── index.html
   ```

   > Tip: enable *Show Hidden Files* in File Manager to see `.env` and `.htaccess`.

4. **Import the database**: cPanel → *phpMyAdmin* → select your database → *Import* → choose `database/init.sql` → *Go*.

5. **Done!** Open your domain and log in with `admin@example.com` / `password`. **Change the password right away** from the Account page.

### Updating

Build again, re-create the ZIP, upload and extract over the old files. Don't re-import `init.sql` — your data stays in the database.

## API Endpoints

All requests go through `php-backend/api.php`.

| Method | Endpoint | Description |
| --- | --- | --- |
| POST | `/auth/login` | Login |
| GET | `/auth/me` | Current user |
| GET / POST | `/qrcodes` | List / create QR codes |
| GET / PUT / DELETE | `/qrcodes/{id}` | Read / update / delete QR code |
| GET | `/qrcodes/public/{uniqueId}` | Public card data |
| GET / POST | `/themes` | List / create themes |
| PUT / DELETE | `/themes/{id}` | Update / delete theme |
| GET / POST | `/users` | List / create users (admin) |
| PUT / DELETE | `/users/{id}` | Update / delete user (admin) |

## Project Structure

```
qr-code/
├── app/                # React frontend (components, routes, store, utils)
├── php-backend/
│   ├── config/         # Database & session config
│   ├── controllers/    # API controllers
│   ├── services/       # Business logic
│   ├── uploads/        # Uploaded images
│   └── api.php         # API router
├── database/init.sql   # Schema + seed data
├── public/             # Static assets & social icons
├── .htaccess           # Apache SPA routing
└── index.html
```

## Customization

- **Themes**: create brand colors, footer text and a welcome screen from the `/theme` page.
- **Social icons**: replace the images in `public/` (`ig.png`, `facebook.png`, `tiktok.png`, `yt.png`, `pinterest.png`).
- **Public card layout**: edit `app/routes/public-card.tsx`.
- **Seed data**: edit `database/init.sql` to change the default admin and theme.

## Contributing

This project is open to contributions. Feel free to fork it, improve it, or submit pull requests with new features or fixes.

## License

This project is provided under the MIT License. You are free to use, modify, and distribute it.
