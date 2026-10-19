# Deployment Guide

Panduan ini untuk skenario production sesuai setup kamu:
- Aplikasi jalan pakai Docker Compose
- MySQL jalan dalam Docker
- Nginx reverse proxy sudah ada di server (container terpisah, port 80)
- Inisialisasi database dilakukan manual via SQL (bukan auto dari app)

## 1. Prasyarat

Pastikan server sudah ada:
- Docker
- Docker Compose
- Nginx reverse proxy existing (contoh: `nginx-proxy` container di port 80)
- DNS domain mengarah ke IP server

## 2. Clone dan Setup Env

```bash
git clone <repo-url>
cd qr-code
```

Buat/cek `.env` di root project:

```env
MYSQL_ROOT_PASSWORD=your_password
MYSQL_DATABASE=qrcard
SESSION_SECRET=replace-with-strong-random-secret
MYSQL_PORT=3306
APP_PORT=3000
APP_PUBLIC_PORT=3001
```

Keterangan:
- `APP_PORT`: port internal app di container
- `APP_PUBLIC_PORT`: port app di host server (yang diproxy nginx existing)

## 3. Jalankan Service

```bash
docker compose up -d --build
```

Cek status:

```bash
docker compose ps
```

Dengan config saat ini:
- App expose ke host di `APP_PUBLIC_PORT` (default `3001`)
- MySQL expose ke host di `MYSQL_PORT` (default `3306`)

## 4. Inisialisasi Database (Sekali Saja)

SQL schema+seed ada di:
- `database/init.sql`

Jalankan command ini (Linux/bash):

```bash
docker exec -i qrcard_mysql mysql -uroot -p"your_password" "qrcard" < database/init.sql
```

Untuk PowerShell:

```powershell
Get-Content .\database\init.sql | docker exec -i qrcard_mysql mysql -uroot -pyour_password qrcard
```

Validasi tabel:

```bash
docker exec -it qrcard_mysql mysql -uroot -pyour_password -e "USE qrcard; SHOW TABLES;"
```

Catatan:
- Warning `Using a password on the command line interface can be insecure` itu normal.
- Inisialisasi cukup sekali. Deploy berikutnya tidak perlu ulang kecuali reset DB.

## 5. Konfigurasi Nginx Existing untuk Domain Baru

Karena nginx utama sudah ada di server, buat server block untuk domain baru dan arahkan ke app di `127.0.0.1:3001`.

Contoh config:

```nginx
server {
    listen 80;
    server_name qr.domainbaru.com;
    client_max_body_size 25m;

    location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

Reload nginx:

```bash
nginx -t && nginx -s reload
```

Jika nginx kamu bukan host-level tapi containerized reverse proxy manager, sesuaikan lewat mekanisme tool tersebut (UI/labels/vhost mapping).

## 6. Update Deployment

Saat ada update code:

```bash
git pull
docker compose up -d --build
```

## 7. Troubleshooting Cepat

### A. `Access denied for user 'root'@'localhost'`
Penyebab umum:
- Password yang dipakai tidak sama dengan `MYSQL_ROOT_PASSWORD` saat container pertama kali dibuat.

Solusi:
- Pakai password yang benar, atau recreate volume MySQL jika memang ingin reset total database.

### B. `ERROR 1046 (3D000): No database selected`
Penyebab:
- Nama database tidak dipass di command mysql.

Solusi:
- Pastikan command menyertakan nama DB, contoh:

```bash
docker exec -i qrcard_mysql mysql -uroot -p"your_password" "qrcard" < database/init.sql
```

### C. Domain tidak resolve ke app
Checklist:
- DNS domain sudah pointing ke server
- Nginx config `proxy_pass` ke `127.0.0.1:3001`
- `docker compose ps` menunjukkan `qrcard_app` status up
- Port `3001` tidak diblok firewall internal

## 8. Security Notes (Production)

Sebelum go-live:
- Ganti `MYSQL_ROOT_PASSWORD` dengan password kuat
- Ganti `SESSION_SECRET` dengan random secret yang kuat
- Aktifkan HTTPS/TLS di nginx
- Batasi akses publik ke port MySQL (`3306`) jika tidak diperlukan dari luar server
