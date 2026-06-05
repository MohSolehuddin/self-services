# Server App - Structure

Organisasi file dan folder untuk server-app.

```
server-app/
├── 📄 docker-compose.yaml      # Main configuration
├── 📄 .env                      # Environment variables (with passwords)
├── 📄 .env.example              # Template untuk .env
├── 📄 .gitignore                # Git ignore rules
│
├── 📚 Dokumentasi
│   ├── README.md                # Overview dan quick start
│   ├── QUICKSTART.md           # 1-minute setup guide
│   ├── SERVICES.md             # Detail setiap service
│   ├── BACKUP.md               # Backup dan restore guide
│   └── scripts/README.md       # Script documentation
│
├── 📁 data/                     # Docker volumes (NOT in git)
│   ├── trilium/                # Trilium notes data
│   ├── code-config/            # code-server config
│   ├── gitea/                  # Git repository data
│   ├── filebrowser/            # Filebrowser data
│   ├── nextcloud/              # Nextcloud data
│   ├── actual/                 # Actual budget data
│   ├── sourcebot/              # Sourcebot config
│   ├── open-webui/             # Open WebUI data
│   ├── postgres_main/          # PostgreSQL main DB
│   ├── postgres_sb/            # PostgreSQL SB DB
│   ├── .sessions/              # WAHA sessions
│   └── ...                     # Other service data
│
├── 📁 scripts/                  # Automation scripts (executable)
│   ├── README.md               # Script documentation
│   ├── backup.sh               # Backup semua data
│   ├── restore.sh              # Restore dari backup
│   ├── setup-cron.sh           # Setup cron job backup
│   ├── cleanup.sh              # Clean Docker resources
│   └── github-sync.sh          # Push to GitHub
│
├── 📁 logs/                     # Script logs
│   └── backup.log              # Backup operation logs
│
└── 📁 .git/                     # Git repository (not shown)
```

---

## 📁 File Explanations

### docker-compose.yaml
Main configuration file untuk semua services.

**Jangan edit manual** - gunakan environment variables di `.env`!

### .env
Environment variables dengan **password dan secret keys**.

**Jangan commit ke Git!** Ini sudah di-include di `.gitignore`.

### .env.example
Template untuk `.env` - used for initial setup.

### .gitignore
```
# Data volumes - Jangan di-commit!
data/
*.db
*.log

# Environment variables
.env
```

---

## 📁 Data Directory

### Purpose
Semua Docker volumes disimpan di `data/` directory.

### Safety
- **Jangan hapus** tanpa backup
- **Jangan commit** ke Git
- **Backup secara berkala**

### Permissions
Semua file di `data/` dimiliki oleh user ID 1000.

```bash
# Check permissions
ls -la data/

# Fix permissions if needed
sudo chown -R 1000:1000 data/
```

---

## 📁 Scripts Directory

### Purpose
Automation scripts untuk:
- Backup dan restore
- Cron job management
- Cleanup
- Git sync

### Permissions
Semua scripts harus executable.

```bash
# Make all scripts executable
chmod +x scripts/*.sh

# Check permissions
ls -la scripts/
```

### Output
Scripts menyimpan output di:
- Logs: `logs/backup.log`
- Backups: `/home/moh_solehuddin190805/backups/server-app/`

---

## 🔄 Workflow

### Development
1. Edit `.env` untuk konfigurasi
2. Run services: `docker compose up -d`
3. Test services
4. Make changes
5. Sync ke GitHub: `scripts/github-sync.sh`

### Backup
1. Setup cron: `scripts/setup-cron.sh`
2. Cron runs backup setiap jam
3. Backups di: `/home/moh_solehuddin190805/backups/server-app/`

### Restore
1. List backups: `ls -1 /home/moh_solehuddin190805/backups/server-app/`
2. Restore: `scripts/restore.sh BACKUP_NAME`

### Migration (to new server)
1. Clone repo: `git clone https://github.com/your-username/server-app.git`
2. Setup `.env` dengan values yang baru
3. Run: `docker compose up -d`
4. Restore data dari backup:
   ```bash
   scripts/restore.sh 2026-06-05_01-00-00
   ```

---

## 🛠️ Common Operations

### View Structure
```bash
# Show tree structure
find /home/moh_solehuddin190805/server-app/ -type f | head -50

# Show size
du -sh /home/moh_solehuddin190805/server-app/
du -sh /home/moh_solehuddin190805/server-app/data/
```

### Validate Configuration
```bash
# Check docker-compose
docker compose config

# Check env variables
docker compose config --env-file .env
```

---

*Last Updated: 2026-06-05*
