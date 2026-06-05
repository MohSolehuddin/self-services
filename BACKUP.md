# Backup Script - Setup Cron Job

This script sets up automatic backup cron job.

## Setup Steps

### 1. Make Scripts Executable
```bash
chmod +x /home/moh_solehuddin190805/server-app/scripts/*.sh
```

### 2. Create Backup Directory
```bash
mkdir -p /home/moh_solehuddin190805/backups/server-app
```

### 3. Create Cron Job
Run the setup script:
```bash
/home/moh_solehuddin190805/server-app/scripts/setup-cron.sh
```

Or manually add to crontab:
```bash
crontab -e
```

Add this line:
```
# Server App Backup - every hour at minute 0
0 * * * * /home/moh_solehuddin190805/server-app/scripts/backup.sh >> /home/moh_solehuddin190805/server-app/logs/backup.log 2>&1
```

### 4. Verify Cron Job
```bash
crontab -l
```

### 5. Test Backup
```bash
/home/moh_solehuddin190805/server-app/scripts/backup.sh
```

## Cron Schedule

Current schedule:
- **Frequency**: Every hour (at minute 0)
- **Retention**: 7 days (older backups automatically deleted)
- **Logging**: `/home/moh_solehuddin190805/server-app/logs/backup.log`

### Schedule Examples

| Schedule | Cron Expression | Description |
|----------|-----------------|-------------|
| Every hour | `0 * * * *` | At minute 0 of every hour |
| Every 30 minutes | `*/30 * * * *` | Every 30 minutes |
| Daily at 2 AM | `0 2 * * *` | Daily at 02:00 |
| Weekly on Sunday | `0 3 * * 0` | Weekly Sunday at 03:00 |
| Monthly | `0 4 1 * *` | First day of month at 04:00 |

## Monitoring Backup

### Check Last Backup
```bash
ls -lt /home/moh_solehuddin190805/backups/server-app/ | head -5
```

### Check Backup Logs
```bash
tail -n 50 /home/moh_solehuddin190805/server-app/logs/backup.log
```

### Check Disk Usage
```bash
du -sh /home/moh_solehuddin190805/backups/server-app/
```

## Restore from Backup

### List Available Backups
```bash
ls -1 /home/moh_solehuddin190805/backups/server-app/
```

### Restore Latest
```bash
LATEST=$(ls -1 /home/moh_solehuddin190805/backups/server-app/ | tail -1)
/home/moh_solehuddin190805/server-app/scripts/restore.sh "${LATEST}"
```

### Restore Specific Backup
```bash
/home/moh_solehuddin190805/server-app/scripts/restore.sh "2026-06-05_01-00-00"
```

## Troubleshooting

### Cron Job Not Running
```bash
# Check if cron is running
sudo systemctl status cron

# Check cron logs
tail -f /var/log/syslog | grep CRON

# Test script manually
/home/moh_solehuddin190805/server-app/scripts/backup.sh
```

### Permission Issues
```bash
# Ensure scripts are executable
chmod +x /home/moh_solehuddin190805/server-app/scripts/*.sh

# Ensure backup directory is writable
chmod 755 /home/moh_solehuddin190805/backups/server-app/
```

### Disk Space
```bash
# Check disk space
df -h /home/moh_solehuddin190805/backups

# Clean up old backups
find /home/moh_solehuddin190805/backups/server-app/ -maxdepth 1 -type d -mtime +14 -exec rm -rf {} \;
```
