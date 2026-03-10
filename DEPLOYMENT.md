# 🚀 Deployment Guide: ArmyQR Code Management

Panduan profesional untuk mengdeploy sistem **ArmyQR** menggunakan **Docker Compose**, **MySQL 8.0**, dan **React Router v7** (Production Mode).

---

## 🏗️ 1. Architecture Overview

Sistem ini dirancang untuk dijalankan di VPS/Server Linux dengan konfigurasi:

- **App Service:** React Router v7 (Port 3000 internal).
- **Database Service:** MySQL 8.0 (Port 3306 internal).
- **Reverse Proxy:** Nginx (External atau Internal Proxy Manager).

---

## 🛠️ 2. Prasyarat Sistem

Pastikan server Anda sudah terinstall:

- ✅ **Docker** (v20.10+)
- ✅ **Docker Compose** (v2.x+)
- ✅ **Git**
- ✅ **Domain Nama** (Point ke IP Public Server)

---

## 📂 3. Persiapan Deployment

### A. Clone Repository

```bash
git clone <repo-url>
cd qr-code
```

### B. Konfigurasi Environment (`.env`)

Salin file `.env` dan sesuaikan nilainya:

```bash
# Database Config
MYSQL_ROOT_PASSWORD=Indonesia77
MYSQL_DATABASE=army_qrcode
MYSQL_PORT=3306

# App Config
APP_PORT=3000
APP_PUBLIC_PORT=3001
SESSION_SECRET=UBAH_DENGAN_RANDOM_STRING_YANG_KUAT
```

> [!IMPORTANT]
> Jangan lupa mengubah `SESSION_SECRET` di production untuk keamanan sesi user.

---

## ⚙️ 4. Menjalankan Layanan

Jalankan seluruh stack aplikasi di background:

```bash
docker compose up -d --build
```

Verifikasi kesehatan layanan:

```bash
docker compose ps
```

Pastikan statusnya **Running (Healthy)**.

---

## 🗄️ 5. Inisialisasi Database (Wajib Dilakukan Sekali)

Gunakan perintah di bawah untuk memasukkan schema dan data awal (Peter Shaan seed):

**Via Linux/Bash (Recommended):**

```bash
docker exec -i army_qrcode_mysql mysql -uroot -p"Indonesia77" "army_qrcode" < database/init.sql
```

### 🧹 Cara Reset Database (Jika Perlu)

Jika Anda ingin menghapus data lama dan mulai dari awal:

1. Matikan container: `docker compose down -v`
2. Jalankan kembali: `docker compose up -d`
3. Jalankan inisialisasi SQL di atas.

---

## 🌐 6. Konfigurasi Nginx Reverse Proxy

Untuk menghubungkan domain Anda (misal: `qr.armysecurity.com`), arahkan proxy nginx ke port **3001** di host:

```nginx
server {
    listen 80;
    server_name qr.armysecurity.com;

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

---

## 🔄 7. Cara Update Aplikasi

Setiap kali ada perubahan code, cukup jalankan:

```bash
git pull origin main
docker compose up -d --build
```

Docker akan secara otomatis melakukan rebuild image yang berubah.

---

## 🛡️ 8. Security Checklist

- [ ] Menggunakan HTTPS (Certbot/SSL) di Nginx.
- [ ] Firewall (UFW) hanya membuka port 80/443 dan 22 (SSH).
- [ ] Matikan akses publik port 3306 jika tidak diperlukan.
- [ ] Ganti password root MySQL di `.env` (Pastikan konsisten dengan data init).

---

## 🆘 Troubleshooting

| Error                     | Solusi                                                                     |
| :------------------------ | :------------------------------------------------------------------------- |
| **Access Denied (MySQL)** | Pastikan password `.env` sama dengan password saat DB pertama kali dibuat. |
| **Unknown column '...'**  | Anda belum menjalankan `init.sql` (Lihat bagian 5).                        |
| **Port Conflict**         | Ubah `APP_PUBLIC_PORT` di `.env` ke port lain.                             |

---

**ArmyQR Team** - © 2026 🇮🇩
