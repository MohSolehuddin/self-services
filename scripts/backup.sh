#!/bin/bash
# Server App Backup Script
# Backup semua data docker volumes dan konfigurasi

set -e

# Konfigurasi
BACKUP_BASE_DIR="/home/moh_solehuddin190805/backups/server-app"
SERVER_APP_DIR="/home/moh_solehuddin190805/server-app"
DATE=$(date +"%Y-%m-%d_%H-%M-%S")
BACKUP_DIR="${BACKUP_BASE_DIR}/${DATE}"

# Log function
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

log "Starting backup..."

# Create backup directory
mkdir -p "${BACKUP_DIR}"

# Create metadata file
cat > "${BACKUP_DIR}/metadata.json" << EOF
{
  "backup_time": "${DATE}",
  "server": "$(hostname)",
  "docker_compose_version": "$(docker compose version --short 2>/dev/null || echo 'unknown')",
  "docker_version": "$(docker --version | grep -oP '\d+\.\d+\.\d+' || echo 'unknown')",
  "services": [
EOF

# Backup each Docker volume
log "Backing up Docker volumes..."

# List of volumes to backup
SERVICES=("trilium" "code-config" "gitea" "filebrowser" "nextcloud" "actual" "sourcebot" "open-webui")

for service in "${SERVICES[@]}"; do
    log "Backing up ${service}..."
    
    # Map service name to directory
    case "$service" in
        "trilium") dir="trilium" ;;
        "code-config") dir="code-config" ;;
        "gitea") dir="gitea" ;;
        "filebrowser") dir="filebrowser" ;;
        "nextcloud") dir="nextcloud" ;;
        "actual") dir="actual" ;;
        "sourcebot") dir="sourcebot" ;;
        "open-webui") dir="open-webui" ;;
    esac
    
    # Check if directory exists
    if [ -d "${SERVER_APP_DIR}/data/${dir}" ]; then
        # Create tarball
        tar -czf "${BACKUP_DIR}/volume-${service}.tar.gz" \
            -C "${SERVER_APP_DIR}/data" "${dir}" \
            --exclude="node_modules" \
            --exclude="*.git" 2>/dev/null || true
        
        log "  Created volume-${service}.tar.gz"
    else
        log "  Warning: Directory data/${dir} not found"
    fi
done

# Add services to metadata
for i in "${!SERVICES[@]}"; do
    if [ $i -eq $((${#SERVICES[@]} - 1)) ]; then
        echo "    \"${SERVICES[$i]}\"" >> "${BACKUP_DIR}/metadata.json"
    else
        echo "    \"${SERVICES[$i]}\","
    fi
done

echo "  ]," >> "${BACKUP_DIR}/metadata.json"
echo "  \"backup_dir\": \"${BACKUP_DIR}\"" >> "${BACKUP_DIR}/metadata.json"
echo "}" >> "${BACKUP_DIR}/metadata.json"

# Backup docker-compose.yaml
log "Backing up docker-compose.yaml..."
tar -czf "${BACKUP_DIR}/docker-compose.tar.gz" \
    -C "${SERVER_APP_DIR}" \
    docker-compose.yaml .env .env.example scripts/ 2>/dev/null || true

# Backup docker images list
log "Backing up docker images list..."
docker images --format "{{.Repository}}:{{.Tag}}" > "${BACKUP_DIR}/docker-images.txt" 2>/dev/null || true

# Cleanup old backups (keep last 7 days)
log "Cleaning up old backups..."
find "${BACKUP_BASE_DIR}" -maxdepth 1 -type d -mtime +7 -exec rm -rf {} \; 2>/dev/null || true

log "Backup completed successfully!"
log "Backup location: ${BACKUP_DIR}"

# Show backup info
echo ""
echo "=== Backup Summary ==="
echo "Backup Time: ${DATE}"
echo "Location: ${BACKUP_DIR}"
echo ""
echo "Files created:"
ls -lh "${BACKUP_DIR}"/*.tar.gz "${BACKUP_DIR}"/*.json "${BACKUP_DIR}"/*.txt 2>/dev/null || true
echo ""

# Calculate backup size
BACKUP_SIZE=$(du -sh "${BACKUP_DIR}" | cut -f1)
echo "Total Size: ${BACKUP_SIZE}"

# List all available backups
echo ""
echo "Available Backups:"
ls -1 "${BACKUP_BASE_DIR}" | nl

log "Backup completed!"
