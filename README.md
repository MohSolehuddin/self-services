# Server App - Home Server Infrastructure

Dokumentasi lengkap infrastruktur server home untuk Moh Solehuddin.

## 📋 Daftar Isi
- [Overview](#overview)
- [Service yang Tersedia](#service-yang-tersedia)
- [Setup Awal](#setup-awal)
- [Konfigurasi](#konfigurasi)
- [Backup & Restore](#backup--restore)
- [Maintenance](#maintenance)
- [Troubleshooting](#troubleshooting)

---

## 🚀 Overview

Server ini menjalankan berbagai layanan untuk mendukung aktivitas digital:
- **Blog/Website** (Next.js + PostgreSQL)
- **Notes & Knowledge Base** (Trilium)
- **Code Editor** (code-server)
- **Git Repository** (Gitea)
- **File Manager** (Filebrowser)
- **Cloud Storage** (Nextcloud)
- **Chatbot/LLM UI** (Open WebUI)
- **Budget Management** (Actual Budget)
- **GitHub Actions Runner** (Sourcebot)
- **Telegram Bot Bridge** (WAHA)

---

## 📦 Service yang Tersedia

| Service | Port | Container | Status |
|---------|------|-----------|--------|
| Trilium Notes | 8081 | trilium | ✅ Running |
| code-server | 8443 | code_server | ✅ Running |
| Gitea | 3005 | gitea | ✅ Running |
| Filebrowser | 9999 | filebrowser | ✅ Running |
| Open WebUI | 8888 | open-webui | ✅ Running |
| Actual Budget | 5006 | actual_server | ✅ Running |
| WAHA (Telegram) | 3004 | waha | ✅ Running |
| Sourcebot | 3003 | sourcebot | ✅ Running |
| Nextcloud | - | nextcloud_app | ⚠️ Configured |
| DB (PostgreSQL) | 5432 | db | ✅ Running |
| Sourcebot DB | 5432 | postgres_sb | ✅ Running |
| Redis | 6379 | redis_sb | ✅ Running |

---

## 🛠️ Setup Awal

### Prerequisites
- Docker & Docker Compose terinstall
- Akses root/sudo
- Minimal 4GB RAM (rekomendasikan 8GB+)

### Clone Repository
```bash
git clone https://github.com/your-username/server-app.git
cd server-app
```

### Setup Environment Variables
```bash
cp .env.example .env
nano .env  # Isi dengan nilai sesuai kebutuhan
```

### Setup Permissions
```bash
# Buat direktori data jika belum ada
mkdir -p data/{trilium,code-config,gitea,filebrowser,nextcloud,actual,sourcebot,open-webui,postgres_sb}

# Set permissions (uid 1000 = user default)
sudo chown -R 1000:1000 data/
```

### Jalankan Semua Service
```bash
docker compose up -d
```

### Cek Status
```bash
docker compose ps
docker compose logs -f
```

---

## ⚙️ Konfigurasi

### Database
Database menggunakan PostgreSQL 15 untuk Gitea/Nextcloud dan PostgreSQL 16 untuk Sourcebot.

**Connection Strings:**
```bash
# Gitea/Nextcloud
postgresql://postgres:***@db:5432/gitea

# Sourcebot  
postgresql://sb_admin:***@postgres_sb:5432/sourcebot
```

### Trilium Notes
- URL: `http://msytc.my.id:8081`
- Data: `data/trilium/`
- Memory limit: 512MB

### code-server
- URL: `https://msytc.my.id/code`
- Password: (dari `.env`)
- Workspace: `/config/workspace`

### Gitea
- URL: `http://msytc.my.id:3005`
- SSH: `ssh://git@msytc.my.id:2222`
- Data: `data/gitea/`

### Open WebUI
- URL: `http://msytc.my.id:8888`
- Admin: `mrsoleh@msytc.my.id`
- Model: `ministral-3:14b`
- Ollama: `http://10.148.0.1:11434`

### WAHA (Telegram Bridge)
- API: `http://localhost:3004`
- Konfigurasi: `.env`

### Sourcebot
- URL: `http://msytc.my.id:3003`
- Database: PostgreSQL 16
- Redis: `redis_sb`

---

## 💾 Backup & Restore

### Backup System

Backup otomatis dijalankan setiap 1 jam melalui cron job.

#### Backup Script Location
```bash
/home/moh_solehuddin190805/server-app/scripts/backup.sh
```

#### Cron Job Setup
Backup dijadwalkan dengan cron:
```
# Backup setiap jam (0 menit)
0 * * * * /home/moh_solehuddin190805/server-app/scripts/backup.sh >> /home/moh_solehuddin190805/server-app/logs/backup.log 2>&1
```

#### Backup Contents
1. **Docker Volumes**
   - Trilium notes
   - code-server config
   - Gitea repository
   - Filebrowser database
   - Nextcloud config
   - Actual budget data
   - Open WebUI data
   - Sourcebot data

2. **Docker Compose Config**
   - `docker-compose.yaml`
   - `.env` (tanpa password real)
   - Script backup & restore

3. **Docker Images List**
   - Saved images untuk disaster recovery

#### Manual Backup
```bash
./scripts/backup.sh
```

#### Backup Location
```
/home/moh_solehuddin190805/backups/server-app/
├── 2026-06-05_01-00-00/
│   ├── docker-volumes.tar.gz
│   ├── docker-compose.tar.gz
│   ├── docker-images.tar.gz
│   └── metadata.json
```

### Restore dari Backup

#### Otoritas Backup
```bash
# Cek list backup tersedia
ls -la /home/moh_solehuddin190805/backups/server-app/

# Pilih backup yang ingin direstore
BACKUP_NAME="2026-06-05_01-00-00"
```

#### Restore Script
```bash
# Masuk ke directory server-app
cd /home/moh_solehuddin190805/server-app

# Hentikan semua container
docker compose down

# Restore docker-compose & .env
tar -xzf /home/moh_solehuddin190805/backups/server-app/${BACKUP_NAME}/docker-compose.tar.gz -C ./

# Restore volume data
sudo tar -xzf /home/moh_solehuddin190805/backups/server-app/${BACKUP_NAME}/docker-volumes.tar.gz -C ./

# Restart service
docker compose up -d
```

#### Restore Specific Service
```bash
# Contoh: restore Gitea saja
cd /home/moh_solehuddin190805/server-app
docker compose down gitea
sudo tar -xzf /home/moh_solehuddin190805/backups/server-app/${BACKUP_NAME}/docker-volumes.tar.gz -C ./
docker compose up -d gitea
```

---

## 🔧 Maintenance

### Update Service
```bash
# Pull latest images
docker compose pull

# Rebuild dan restart
docker compose up -d --build
```

### Hapus Unused Data
```bash
# Hapus container yang stopped
docker compose down

# Hapus unused images
docker image prune

# Hapus unused volumes
docker volume prune
```

### Cek Logs
```bash
# Semua logs
docker compose logs -f

# Logs service spesifik
docker compose logs -f trilium
docker compose logs -f open-webui
```

### Restart Service
```bash
# Restart semua
docker compose restart

# Restart specific service
docker compose restart trilium
```

### Monitor Resources
```bash
# Cek usage Docker
docker system df

# Cek disk space
df -h

# Cek memory
free -h
```

---

## 🐛 Troubleshooting

### Service tidak start
```bash
# Cek logs
docker compose logs SERVICE_NAME

# Cek status
docker compose ps

# Cek health
docker inspect SERVICE_NAME --format '{{.State.Health.Status}}'
```

### Port conflict
```bash
# Cek port yang digunakan
netstat -tlnp | grep :PORT

# Ubah port di docker-compose.yaml
# Contoh: ganti 8888:8080 menjadi 8889:8080
```

### Database connection issues
```bash
# Cek DB container status
docker compose ps db
docker compose logs db

# Test connection
docker compose exec db psql -U postgres -c "SELECT 1"
```

### Disk space full
```bash
# Cek usage
df -h /home

# Cek Docker usage
docker system df -v

# Clean up
docker system prune -a --volumes
```

---

## 📱 Akses Public

### URLs (via Cloudflare Tunnel)
- **Trilium**: `https://notes.msytc.my.id`
- **code-server**: `https://code.msytc.my.id`
- **Gitea**: `https://git.msytc.my.id`
- **Open WebUI**: `https://ai.msytc.my.id`
- **Filebrowser**: `https://files.msytc.my.id`
- **Actual**: `https://budget.msytc.my.id`

### HTTPS Configuration
Koneksi menggunakan Cloudflare Tunnel dengan self-signed certificate internal.

---

## 📞 Support & Maintenance

### Owner
- **Name**: Moh Solehuddin
- **Email**: mrsoleh@msytc.my.id

### Maintenance Schedule
- **Backup**: Otomatis setiap 1 jam
- **Update**: Monthly (first Sunday)
- **Review**: Quarterly (disk usage, security audit)

---

## 📄 License

Private - For internal use only.

---

*Last Updated: 2026-06-05*
