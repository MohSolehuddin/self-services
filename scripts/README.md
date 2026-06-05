# Server App - Script Documentation

Dokumentasi untuk semua scripts yang tersedia di `scripts/` directory.

---

## 📜 List of Scripts

| Script | Purpose | Usage |
|--------|---------|-------|
| `backup.sh` | Backup semua data volumes | `/home/moh_solehuddin190805/server-app/scripts/backup.sh` |
| `restore.sh` | Restore dari backup | `/home/moh_solehuddin190805/server-app/scripts/restore.sh BACKUP_NAME` |
| `setup-cron.sh` | Setup cron job backup | `/home/moh_solehuddin190805/server-app/scripts/setup-cron.sh` |
| `cleanup.sh` | Remove unused Docker resources | `/home/moh_solehuddin190805/server-app/scripts/cleanup.sh` |
| `github-sync.sh` | Push changes to GitHub | `/home/moh_solehuddin190805/server-app/scripts/github-sync.sh` |

---

## 🔧 backup.sh

**Purpose**: Backup semua Docker volumes dan konfigurasi.

**Usage**:
```bash
/home/moh_solehuddin190805/server-app/scripts/backup.sh
```

**What it does**:
1. Creates timestamped backup directory
2. Backs up all Docker volumes (Trilium, code-config, Gitea, dll)
3. Archives docker-compose.yaml dan .env
4. Saves list of Docker images
5. Cleans up backups older than 7 days
6. Logs to `/home/moh_solehuddin190805/server-app/logs/backup.log`

**Backup Structure**:
```
/home/moh_solehuddin190805/backups/server-app/
└── 2026-06-05_01-00-00/
    ├── volume-trilium.tar.gz
    ├── volume-code-config.tar.gz
    ├── volume-gitea.tar.gz
    ├── volume-filebrowser.tar.gz
    ├── volume-nextcloud.tar.gz
    ├── volume-actual.tar.gz
    ├── volume-sourcebot.tar.gz
    ├── volume-open-webui.tar.gz
    ├── docker-compose.tar.gz
    ├── docker-images.txt
    └── metadata.json
```

**Example Output**:
```
[2026-06-05 01:00:00] Starting backup...
[2026-06-05 01:00:05] Backing up trilium...
[2026-06-05 01:00:10] Backing up code-config...
[2026-06-05 01:00:15] Created docker-compose.tar.gz
[2026-06-05 01:00:16] Cleaning up old backups...
[2026-06-05 01:00:17] Backup completed successfully!
Backup location: /home/moh_solehuddin190805/backups/server-app/2026-06-05_01-00-00

=== Backup Summary ===
Backup Time: 2026-06-05_01-00-00
Location: /home/moh_solehuddin190805/backups/server-app/2026-06-05_01-00-00

Files created:
-rw-r--r-- 1 volume-trilium.tar.gz 15M
-rw-r--r-- 1 volume-gitea.tar.gz 85M
-rw-r--r-- 1 docker-compose.tar.gz 2K
-rw-r--r-- 1 docker-images.txt 2K

Total Size: 120M
```

---

## 🔄 restore.sh

**Purpose**: Restore data dari backup.

**Usage**:
```bash
# List available backups
ls -1 /home/moh_solehuddin190805/backups/server-app/

# Restore from specific backup
/home/moh_solehuddin190805/server-app/scripts/restore.sh "2026-06-05_01-00-00"
```

**What it does**:
1. Validates backup exists
2. Prompts for confirmation
3. Stops all Docker containers
4. Restores docker-compose files
5. Restores all volume data
6. Restarts services

**Restore Specific Service Only**:
```bash
# Stop service
docker compose down trilium

# Restore directory manually
tar -xzf /home/moh_solehuddin190805/backups/server-app/BACKUP/volume-trilium.tar.gz -C data/

# Restart service
docker compose up -d trilium
```

---

## ⏰ setup-cron.sh

**Purpose**: Setup cron job untuk backup otomatis.

**Usage**:
```bash
/home/moh_solehuddin190805/server-app/scripts/setup-cron.sh
```

**What it does**:
1. Creates log directory
2. Makes scripts executable
3. Creates cron job file at `/etc/cron.d/server-app-backup`
4. Restarts cron service
5. Shows verification info

**Cron Job Created**:
```
# Server App Backup - Every hour at minute 0
0 * * * * root /home/moh_solehuddin190805/server-app/scripts/backup.sh >> /home/moh_solehuddin190805/server-app/logs/backup.log 2>&1
```

**Cron Schedule**:
- **Frequency**: Setiap jam (menit 0)
- **Retention**: 7 hari
- **Logging**: `/home/moh_solehuddin190805/server-app/logs/backup.log`

---

## 🗑️ cleanup.sh

**Purpose**: Hapus Docker resources yang tidak digunakan.

**Usage**:
```bash
/home/moh_solehuddin190805/server-app/scripts/cleanup.sh
```

**What it does**:
1. Stops all containers
2. Removes unused images
3. Removes unused volumes
4. Removes unused networks

**Warning**: Data dalam volume yang dihapus akan hilang!

---

## 🔄 github-sync.sh

**Purpose**: Sync changes ke GitHub repository.

**Usage**:
```bash
# Edit remote repo di script
nano /home/moh_solehuddin190805/server-app/scripts/github-sync.sh

# Run sync
/home/moh_solehuddin190805/server-app/scripts/github-sync.sh
```

**What it does**:
1. Adds all changes
2. Commits dengan timestamp
3. Push ke remote repository

**Configuration**:
```bash
REMOTE_REPO="https://github.com/your-username/server-app.git"
BRANCH="main"
```

---

## 📊 Monitoring Scripts

### Check Last Backup
```bash
# List backups
ls -lt /home/moh_solehuddin190805/backups/server-app/ | head -5

# Check backup size
du -sh /home/moh_solehuddin190805/backups/server-app/
```

### Check Backup Logs
```bash
# View recent logs
tail -n 50 /home/moh_solehuddin190805/server-app/logs/backup.log

# Monitor live logs
tail -f /home/moh_solehuddin190805/server-app/logs/backup.log
```

### Check Cron Status
```bash
# View cron job
cat /etc/cron.d/server-app-backup

# Check cron service
sudo systemctl status cron

# List cron jobs
crontab -l
```

---

## 🛠️ Custom Scripts

### Create New Script
```bash
# Create script
nano /home/moh_solehuddin190805/server-app/scripts/myscript.sh

# Add content
#!/bin/bash
set -e

echo "My custom script"

# Make executable
chmod +x /home/moh_solehuddin190805/server-app/scripts/myscript.sh
```

### Add to Cron
```bash
# Edit crontab
crontab -e

# Add line (example: every day at 2 AM)
0 2 * * * /home/moh_solehuddin190805/server-app/scripts/myscript.sh
```

---

## 🔍 Troubleshooting

### Script not executable
```bash
chmod +x /home/moh_solehuddin190805/server-app/scripts/*.sh
```

### Permission denied
```bash
# Check permissions
ls -la /home/moh_solehuddin190805/server-app/scripts/

# Fix permissions
sudo chmod 755 /home/moh_solehuddin190805/server-app/scripts/*.sh
```

### Cron not running
```bash
# Check if cron is running
sudo systemctl status cron

# Check logs
tail -f /var/log/syslog | grep CRON

# Test script manually
/home/moh_solehuddin190805/server-app/scripts/backup.sh
```

---

## 📝 Best Practices

### Regular Tasks
- [ ] Run backup setiap hari (otomatis via cron)
- [ ] Check backup logs weekly
- [ ] Test restore monthly
- [ ] Clean up old backups quarterly
- [ ] Update scripts quarterly

### Disk Space
- [ ] Monitor `/home/moh_solehuddin190805/backups/` usage
- [ ] Keep max 7 days of backups
- [ ] Archive old backups to external storage

### Security
- [ ] Keep scripts in protected directory
- [ ] Don't commit sensitive data
- [ ] Rotate passwords regularly

---

*Last Updated: 2026-06-05*
