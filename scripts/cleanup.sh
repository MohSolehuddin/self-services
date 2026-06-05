#!/bin/bash
# Docker Cleanup Script
# Remove unused containers, images, and volumes

echo "=== Docker Cleanup ==="
echo ""

# Confirm cleanup
read -p "This will remove unused Docker containers, images, and volumes. Continue? (yes/no): " CONFIRM

if [ "${CONFIRM}" != "yes" ]; then
    echo "Cleanup cancelled."
    exit 0
fi

echo ""
echo "Cleaning up Docker..."

# Stop all containers
echo "Stopping containers..."
cd /home/moh_solehuddin190805/server-app
docker compose down

# Remove unused images
echo "Removing unused images..."
docker image prune -a -f

# Remove unused volumes
echo "Removing unused volumes..."
docker volume prune -f

# Remove unused networks
echo "Removing unused networks..."
docker network prune -f

echo ""
echo "=== Cleanup Complete ==="
echo "Disk space freed: $(docker system df --format "{{.Size}}" | awk '{sum+=$1} END {print sum}')"
