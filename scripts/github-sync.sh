#!/bin/bash
# GitHub Sync Script
# Push changes to remote repository

set -e

# Konfigurasi
SERVER_APP_DIR="/home/moh_solehuddin190805/server-app"
REMOTE_REPO="https://github.com/your-username/server-app.git"
BRANCH="main"

echo "=== GitHub Sync ==="
echo ""

# Check if git repository exists
cd "${SERVER_APP_DIR}"
if [ ! -d ".git" ]; then
    echo "Initializing git repository..."
    git init
    git add .
    git commit -m "Initial commit"
fi

# Check current remote
CURRENT_REMOTE=$(git remote -v | grep origin | head -1 | awk '{print $2}')

if [ -z "${CURRENT_REMOTE}" ]; then
    echo "Configuring remote repository..."
    git remote add origin "${REMOTE_REPO}"
elif [ "${CURRENT_REMOTE}" != "${REMOTE_REPO}" ]; then
    echo "Updating remote repository..."
    git remote set-url origin "${REMOTE_REPO}"
fi

# Add all changes
echo "Staging changes..."
git add .

# Check if there are changes to commit
if git diff --cached --quiet; then
    echo "No changes to commit."
    exit 0
fi

# Commit changes
echo "Committing changes..."
git commit -m "Update server-app configuration"

# Push to remote
echo "Pushing to remote..."
git push -u origin "${BRANCH}"

echo ""
echo "=== Sync Complete ==="
echo "Changes pushed to: ${REMOTE_REPO}"
