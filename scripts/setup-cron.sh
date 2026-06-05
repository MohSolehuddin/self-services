#!/bin/bash
# Setup Cron Job for Server App Backup

set -e

echo "=== Server App Backup Setup ==="
echo ""

# Paths
BACKUP_SCRIPT="/home/moh_solehuddin190805/server-app/scripts/backup.sh"
LOG_DIR="/home/moh_solehuddin190805/server-app/logs"
BACKUP_DIR="/home/moh_solehuddin190805/backups/server-app"
CRON_FILE="/etc/cron.d/server-app-backup"

# Create directories
echo "Creating directories..."
mkdir -p "${LOG_DIR}"
mkdir -p "${BACKUP_DIR}"
chmod 755 "${LOG_DIR}"
chmod 755 "${BACKUP_DIR}"

# Make scripts executable
echo "Making scripts executable..."
chmod +x /home/moh_solehuddin190805/server-app/scripts/*.sh

# Create backup cron job
echo "Creating cron job..."
cat > "${CRON_FILE}" << EOF
# Server App Backup - Every hour at minute 0
# Last updated: $(date '+%Y-%m-%d %H:%M:%S')
0 * * * * root /home/moh_solehuddin190805/server-app/scripts/backup.sh >> ${LOG_DIR}/backup.log 2>&1
EOF

chmod 644 "${CRON_FILE}"

# Restart cron service
echo "Restarting cron service..."
sudo systemctl restart cron 2>/dev/null || sudo service cron restart 2>/dev/null || echo "Cron service not found or failed to restart"

# Verify cron job
echo ""
echo "=== Verification ==="
echo "Cron job:"
cat "${CRON_FILE}"
echo ""
echo "Cron status:"
sudo systemctl status cron 2>/dev/null || sudo service cron status 2>/dev/null || echo "Cron service status unavailable"

# Show available backups
echo ""
echo "Available backups:"
ls -1 "${BACKUP_DIR}" 2>/dev/null | nl || echo "No backups yet"

# Test backup script
echo ""
read -p "Run test backup now? (yes/no): " TEST_BACKUP

if [ "${TEST_BACKUP}" = "yes" ]; then
    echo "Running test backup..."
    /home/moh_solehuddin190805/server-app/scripts/backup.sh
fi

echo ""
echo "=== Setup Complete ==="
echo ""
echo "Next steps:"
echo "  1. Test backup: /home/moh_solehuddin190805/server-app/scripts/backup.sh"
echo "  2. Check logs: tail -f ${LOG_DIR}/backup.log"
echo "  3. Configure GitHub repo in github-sync.sh"
echo "  4. Run: /home/moh_solehuddin190805/server-app/scripts/github-sync.sh"
