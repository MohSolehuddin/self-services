#!/bin/bash
# Server App Restore Script
# Usage: ./restore.sh [BACKUP_NAME]

set -e

# Konfigurasi
BACKUP_BASE_DIR="/home/moh_solehuddin190805/backups/server-app"
SERVER_APP_DIR="/home/moh_solehuddin190805/server-app"

# Usage
usage() {
    echo "Usage: $0 [BACKUP_NAME]"
    echo ""
    echo "Available backups:"
    ls -1 "${BACKUP_BASE_DIR}" | nl
    echo ""
    echo "Example:"
    echo "  $0 2026-06-05_01-00-00"
    exit 1
}

# Check arguments
if [ $# -eq 0 ]; then
    usage
fi

BACKUP_NAME=$1
BACKUP_DIR="${BACKUP_BASE_DIR}/${BACKUP_NAME}"

# Validate backup exists
if [ ! -d "${BACKUP_DIR}" ]; then
    echo "Error: Backup '${BACKUP_NAME}' not found!"
    echo ""
    usage
fi

# Confirm restore
echo "=== Restore Confirmation ==="
echo "Restoring from backup: ${BACKUP_NAME}"
echo "Location: ${BACKUP_DIR}"
echo ""
echo "This will:"
echo "  1. Stop all Docker containers"
echo "  2. Restore docker-compose.yaml"
echo "  3. Restore all data volumes"
echo "  4. Restart services"
echo ""
read -p "Are you sure? (yes/no): " CONFIRM

if [ "${CONFIRM}" != "yes" ]; then
    echo "Restore cancelled."
    exit 0
fi

# Start restore
echo ""
echo "Starting restore..."

# Stop all containers
echo "Stopping containers..."
cd "${SERVER_APP_DIR}"
docker compose down

# Restore docker-compose.yaml
echo "Restoring docker-compose files..."
if [ -f "${BACKUP_DIR}/docker-compose.tar.gz" ]; then
    tar -xzf "${BACKUP_DIR}/docker-compose.tar.gz" -C "${SERVER_APP_DIR}" --overwrite
    echo "  ✓ docker-compose files restored"
else
    echo "  ⚠ No docker-compose backup found"
fi

# Restore data volumes
echo "Restoring data volumes..."
VOLUME_COUNT=0

for volume_file in "${BACKUP_DIR}"/volume-*.tar.gz; do
    if [ -f "${volume_file}" ]; then
        service_name=$(basename "${volume_file}" .tar.gz | sed 's/volume-//')
        echo "  Restoring ${service_name}..."
        
        # Map service name to directory
        case "$service_name" in
            "trilium") dir="trilium" ;;
            "code-config") dir="code-config" ;;
            "gitea") dir="gitea" ;;
            "filebrowser") dir="filebrowser" ;;
            "nextcloud") dir="nextcloud" ;;
            "actual") dir="actual" ;;
            "sourcebot") dir="sourcebot" ;;
            "open-webui") dir="open-webui" ;;
            *) continue ;;
        esac
        
        # Restore directory
        sudo mkdir -p "${SERVER_APP_DIR}/data/${dir}"
        sudo tar -xzf "${volume_file}" -C "${SERVER_APP_DIR}/data" --overwrite 2>/dev/null || true
        sudo chown -R 1000:1000 "${SERVER_APP_DIR}/data/${dir}" 2>/dev/null || true
        
        echo "    ✓ ${service_name} restored"
        ((VOLUME_COUNT++))
    fi
done

# Restore docker images
echo "Restoring docker images..."
if [ -f "${BACKUP_DIR}/docker-images.txt" ]; then
    while read -r image; do
        if [ -n "$image" ]; then
            docker pull "$image" 2>/dev/null || true
        fi
    done < "${BACKUP_DIR}/docker-images.txt"
    echo "  ✓ Docker images restored"
else
    echo "  ⚠ No docker images list found"
fi

# Start services
echo "Starting services..."
docker compose up -d

# Show status
echo ""
echo "=== Restore Summary ==="
echo "Backup: ${BACKUP_NAME}"
echo "Volumes restored: ${VOLUME_COUNT}"
echo ""
echo "Service Status:"
docker compose ps

echo ""
echo "Restore completed successfully!"
echo "Next steps:"
echo "  1. Check service logs: docker compose logs"
echo "  2. Verify data integrity"
echo "  3. Test service access"
