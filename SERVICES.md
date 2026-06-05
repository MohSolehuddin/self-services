# Server App - Service Documentation

Detail konfigurasi dan dokumentasi untuk setiap service yang berjalan di server-app.

---

## Trilium Notes

**URL**: `https://notes.msytc.my.id`  
**Port**: 8081  
**Container**: trilium  
**Data**: `/home/moh_solehuddin190805/server-app/data/trilium/`

### Konfigurasi
```yaml
trilium:
  image: zadam/trilium:latest
  container_name: trilium
  restart: always
  deploy:
    resources:
      limits:
        memory: 512M
  ports:
    - 8081:8080
  volumes:
    - ./data/trilium:/home/node/trilium-data
```

### Fitur
- Knowledge base dan notes management
- Sync dengan client desktop
- Database SQLite
- Memory limit 512MB

### Backup
```bash
# Backup data
tar -czf trilium-backup.tar.gz data/trilium/

# Restore
tar -xzf trilium-backup.tar.gz -C data/
```

---

## code-server

**URL**: `https://code.msytc.my.id`  
**Port**: 8443  
**Container**: code_server  
**Data**: `/home/moh_solehuddin190805/server-app/data/code-config/`

### Konfigurasi
```yaml
code-server:
  image: lscr.io/linuxserver/code-server:latest
  container_name: code_server
  restart: always
  environment:
    - PUID=1000
    - PGID=1000
    - TZ=Asia/Jakarta
    - PASSWORD=***
    - DEFAULT_WORKSPACE=/config/workspace
  volumes:
    - ./data/code-config:/config
    - .:/config/workspace
  ports:
    - "8443:8443"
```

### Fitur
- VS Code web interface
- Git integration
- Terminal access
- extensions support

### Password
Ubah di `.env`: `CODESERVER_PASSWORD=yourpassword`

---

## Gitea

**URL**: `https://git.msytc.my.id`  
**Port**: 3005 (HTTP), 2222 (SSH)  
**Container**: gitea  
**Database**: db:5432 (PostgreSQL)  
**Data**: `/home/moh_solehuddin190805/server-app/data/gitea/`

### Konfigurasi
```yaml
gitea:
  image: gitea/gitea:latest
  container_name: gitea
  restart: always
  environment:
    - USER_UID=1000
    - USER_GID=1000
    - GITEA__database__DB_TYPE=postgres
    - GITEA__database__HOST=db:5432
    - GITEA__database__NAME=gitea
    - GITEA__database__USER=${DB_USER}
    - GITEA__database__PASS=${DB_PASSWORD}
  volumes:
    - ./data/gitea:/data
    - /etc/timezone:/etc/timezone:ro
    - /etc/localtime:/etc/localtime:ro
  ports:
    - "3005:3000"
    - "2222:22"
  depends_on:
    - db
```

### Fitur
- Git repository hosting
- Web-based UI
- SSH access
- Issue tracking
- CI/CD integration

### Database Setup
Database `gitea` harus dibuat di PostgreSQL:
```sql
CREATE DATABASE gitea;
CREATE USER gitea WITH PASSWORD 'yourpassword';
GRANT ALL PRIVILEGES ON DATABASE gitea TO gitea;
```

---

## Filebrowser

**URL**: `http://files.msytc.my.id`  
**Port**: 9999  
**Container**: filebrowser  
**Data**: `/home/moh_solehuddin190805/server-app/data/`

### Konfigurasi
```yaml
filebrowser:
  image: filebrowser/filebrowser:latest
  container_name: filebrowser
  restart: always
  ports:
    - "9999:80"
  volumes:
    - ./data:/srv 
    - ./data/filebrowser/filebrowser.db:/database.db
  command: [ "--database", "/database.db" ] 
  environment:
    - PUID=1000
    - PGID=1000
```

### Fitur
- File management web interface
- User management
- File sharing
- Multi-user support

### Default User
- Username: `admin`
- Password: `admin` (ubah segera!)

---

## Open WebUI

**URL**: `https://ai.msytc.my.id`  
**Port**: 8888  
**Container**: open-webui  
**Ollama**: `http://10.148.0.1:11434`  
**Model**: `ministral-3:14b`

### Konfigurasi
```yaml
open-webui:
  image: ghcr.io/open-webui/open-webui:latest
  container_name: open-webui
  restart: always
  ports:
    - "8888:8080"
  environment:
    - WEBUI_NAME=Ollama UI - Mr. Soleh
    - DEFAULT_MODEL=ministral-3:14b
    - WEBUI_AUTH=true
    - ADMIN_EMAIL=mrsoleh@msytc.my.id
    - ADMIN_PASSWORD=***
    - OLLAMA_BASE_URL=http://10.148.0.1:11434
  volumes:
    - ./data/open-webui:/app/backend/data
```

### Fitur
- LLM interface (Ollama)
- Chat interface
- Model management
- RAG capabilities
- User authentication

### Admin Credentials
- Email: `mrsoleh@msytc.my.id`
- Password: (dari `.env`)

### Available Models
- ministral-3:14b (default)
- Llama 3.1
- Mistral
- Others (via Ollama)

---

## Actual Budget

**URL**: `https://budget.msytc.my.id`  
**Port**: 5006  
**Container**: actual_server  
**Data**: `/home/moh_solehuddin190805/server-app/data/actual/`

### Konfigurasi
```yaml
actual_server:
  image: actualbudget/actual-server:latest
  container_name: actual_server
  restart: unless-stopped
  ports:
    - '5006:5006'
  volumes:
    - ./data/actual:/data
  healthcheck:
    test: ['CMD-SHELL', 'node src/scripts/health-check.js']
    interval: 60s
    timeout: 10s
    retries: 3
    start_period: 20s
```

### Fitur
- Personal finance management
- Budget tracking
- Transaction management
- Reports & analytics
- Offline-first

### Access
- URL: `http://localhost:5006`
- Sync dengan desktop app

---

## WAHA (Telegram Bridge)

**Port**: 3004  
**Container**: waha  
**Data**: `/home/moh_solehuddin190805/server-app/data/.sessions/`

### Konfigurasi
```yaml
waha:
  image: devlikeapro/waha
  container_name: waha
  restart: always
  ports:
    - "3004:3000"
  volumes:
    - ./data/.sessions:/app/.sessions
  env_file:
    - .env
```

### Fitur
- Telegram bot
- WhatsApp integration
- Multi-provider support
- Session persistence

### API Endpoint
- `http://localhost:3004/whatsapp/send`
- `http://localhost:3004/whatsapp/status`

---

## Sourcebot

**URL**: `http://sourcebot.msytc.my.id`  
**Port**: 3003  
**Container**: sourcebot  
**Database**: postgres_sb:5432  
**Redis**: redis_sb:6379

### Konfigurasi
```yaml
sourcebot:
  image: ghcr.io/sourcebot-dev/sourcebot:latest
  container_name: sourcebot
  restart: always
  environment:
    - CONFIG_PATH=/data/config.json
    - PUID=1000
    - PGID=1000
  depends_on:
    postgres_sb:
      condition: service_healthy
    redis_sb:
      condition: service_healthy
  ports:
    - "3003:3000"
  volumes:
    - ./data/sourcebot/config.json:/data/config.json
    - ./data/sourcebot:/data
  env_file: 
    - .env
```

### Fitur
- GitHub Actions runner
- CI/CD automation
- Workflow management
- Job scheduling

### Database Setup
```sql
CREATE DATABASE sourcebot;
CREATE USER sb_admin WITH PASSWORD '***';
GRANT ALL PRIVILEGES ON DATABASE sourcebot TO sb_admin;
```

---

## PostgreSQL Database

**Container**: db, postgres_sb  
**Port**: 5432 (internal)  
**Data**: 
- Gitea/Nextcloud: `data/postgres_main/`
- Sourcebot: `data/postgres_sb/`

### Konfigurasi
```yaml
db:
  image: postgres:15
  container_name: db
  restart: always
  environment:
    POSTGRES_USER: ${DB_USER}
    POSTGRES_PASSWORD: ***
  volumes:
    - ./data/postgres_main:/var/lib/postgresql/data

postgres_sb:
  image: postgres:16
  container_name: postgres_sb
  restart: always
  environment:
    POSTGRES_USER: ${SB_DB_USER}
    POSTGRES_PASSWORD: ***
    POSTGRES_DB: sourcebot
  volumes:
    - ./data/postgres_sb:/var/lib/postgresql/data
```

### Access
```bash
# Connect to database
docker compose exec db psql -U postgres

# Create backup
docker compose exec db pg_dump -U postgres -d gitea > backup.sql

# Restore backup
docker compose exec db psql -U postgres -d gitea < backup.sql
```

---

## Redis

**Container**: redis_sb  
**Port**: 6379 (internal)

### Konfigurasi
```yaml
redis_sb:
  image: redis:7
  container_name: redis_sb
  restart: always
  healthcheck:
    test: ["CMD", "redis-cli", "ping"]
    interval: 3s
    timeout: 10s
    retries: 10
```

### Usage
- Cache layer untuk Sourcebot
- Session storage
- Queue system

---

## Nextcloud

**Container**: nextcloud_app  
**Database**: db:5432

### Konfigurasi
```yaml
nextcloud:
  image: nextcloud:latest
  container_name: nextcloud_app
  restart: always
  volumes:
    - ./data/nextcloud/html:/var/www/html
    - ./data/nextcloud/config:/var/www/html/config
    - ./data/nextcloud/data:/var/www/html/data
  environment:
    - POSTGRES_HOST=db
    - POSTGRES_DB=nextcloud
    - POSTGRES_USER=${DB_USER}
    - POSTGRES_PASSWORD=***
  depends_on:
    - db
```

### Status
- Configured
- Ready for setup

---

## Monitoring & Maintenance

### Health Checks
```bash
# Check container health
docker compose ps
docker compose logs

# Check disk usage
df -h /home/moh_solehuddin190805/server-app/data

# Check memory usage
free -h

# Check Docker resources
docker system df -v
```

### Logs
```bash
# All logs
docker compose logs -f

# Specific service
docker compose logs -f trilium
docker compose logs -f open-webui
```

### Restart Services
```bash
# Restart all
docker compose restart

# Restart specific
docker compose restart trilium
docker compose restart open-webui

# Stop and start
docker compose down
docker compose up -d
```

---

*Last Updated: 2026-06-05*
