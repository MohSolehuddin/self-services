# Sourcebot - Self-Hosted Code Understanding

Dokumentasi teknis untuk Sourcebot yang di-hosting di server Mr. Soleh.

## 📋 Overview

Sourcebot adalah alat self-hosted untuk memahami kode Anda. Anda dapat bertanya tentang kode Anda dan mendapatkan jawaban Markdown yang kaya dengan sitasi inline.

## 🚀 Status

**Status:** ✅ Running (v4.17.2)

**Endpoint:**
- **Public:** https://sourcebot.msytc.my.id
- **Local:** http://localhost:3003

## 🛠️ Infrastruktur

### Container
- **Image:** `ghcr.io/sourcebot-dev/sourcebot:latest`
- **Container Name:** `sourcebot`
- **Restart Policy:** `always`

### Ports
- `3003:3000` - Web UI

### Environment Variables
```env
CONFIG_PATH=/data/config.json
AUTH_SECRET=***
SOURCEBOT_ENCRYPTION_KEY=${SOUR…KEY}
DATABASE_URL=postgresql://${SB_DB_USER}:${SB_DB_PASSWORD}@postgres_sb:5432/${SB_DB_USER:-sourcebot}
REDIS_URL=redis://redis_sb:6379
GITHUB_PAT=***
```

### Volumes
- `./data/sourcebot/config.json:/data/config.json:ro`
- `sourcebot-data:/data/.sourcebot`

## 🔌 GitHub Connection

### Configuration (`data/sourcebot/config.json`)
```json
{
  "$schema": "https://raw.githubusercontent.com/sourcebot-dev/sourcebot/main/schemas/v3/index.json",
  "connections": {
    "github-mohsolehuddin": {
      "type": "github",
      "token": { "env": "GITHUB_PAT" },
      "url": "https://github.com",
      "users": ["MohSolehuddin"]
    }
  }
}
```

### Sync Schedule
- **Reindex:** Setiap 1 jam (`reindexIntervalMs: 3600000`)
- **Connection Sync:** Setiap 24 jam (`resyncConnectionIntervalMs: 86400000`)

## 📦 Docker Compose

Lihat file lengkap di: `https://github.com/MohSolehuddin/self-services/blob/main/docker-compose.yaml`

```bash
# Start
cd /home/moh_solehuddin190805/server-app && docker compose up -d sourcebot

# Stop
cd /home/moh_solehuddin190805/server-app && docker compose down sourcebot

# Logs
docker logs sourcebot -f
```

## 🔐 Keamanan

- **GITHUB_PAT** disimpan di `.env` (tidak di-Git)
- Sourcebot menggunakan environment variable untuk secret token
- No sensitive data di repo GitHub

## 📝 Referensi

- [Sourcebot Docs](https://docs.sourcebot.dev)
- [GitHub Repo](https://github.com/sourcebot-dev/sourcebot)
- [Configuration Schema](https://raw.githubusercontent.com/sourcebot-dev/sourcebot/main/schemas/v3/index.json)

## 🔄 Backup & Sync

- Git sync: `scripts/github-sync.sh`
- Backup: `scripts/backup.sh`
- Cron: Setiap 1 jam

## 🐛 Troubleshooting

### Config Error
```bash
docker logs sourcebot | grep -i config
```

### Connection Sync
```bash
docker logs sourcebot | grep -i connection
```

### Restart Container
```bash
cd /home/moh_solehuddin190805/server-app && docker compose restart sourcebot
```
