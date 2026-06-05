# Server App - Quick Start Guide

Quick start guide untuk setup dan running server-app.

---

## 🚀 1-Minute Setup

### Prerequisites
- Docker & Docker Compose installed
- 4GB+ RAM recommended
- Linux server (Ubuntu/Debian)

### Install Docker
```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo apt-get install docker-compose-plugin
```

### Clone & Setup
```bash
# Clone repository
cd /home/moh_solehuddin190805
git clone https://github.com/your-username/server-app.git
cd server-app

# Setup environment
cp .env.example .env
nano .env  # Edit dengan nilai kamu
```

### Create Directories
```bash
# Create data directories
mkdir -p data/{trilium,code-config,gitea,filebrowser,nextcloud,actual,sourcebot,open-webui}

# Set permissions
sudo chown -R 1000:1000 data/
```

### Start Services
```bash
# Start all services
docker compose up -d

# Check status
docker compose ps

# Check logs
docker compose logs -f
```

---

## 🛠️ First-Time Setup

### 1. Trilium Notes
1. Akses: `http://localhost:8081`
2. Buat user pertama
3. Setup sync dengan desktop app

### 2. code-server
1. Akses: `http://localhost:8443`
2. Login dengan password dari `.env`
3. Setup Git config

### 3. Gitea
1. Akses: `http://localhost:3005`
2. Setup database (sudah configured)
3. Buat admin account

### 4. Open WebUI
1. Akses: `http://localhost:8888`
2. Login: `mrsoleh@msytc.my.id`
3. Setup Ollama connection
4. Download model (ministral-3:14b)

### 5. Actual Budget
1. Akses: `http://localhost:5006`
2. Create new budget
3. Sync dengan desktop app

---

## 📱 Access URLs

| Service | Local URL | External URL |
|---------|-----------|--------------|
| Trilium | http://localhost:8081 | https://notes.msytc.my.id |
| code-server | http://localhost:8443 | https://code.msytc.my.id |
| Gitea | http://localhost:3005 | https://git.msytc.my.id |
| Open WebUI | http://localhost:8888 | https://ai.msytc.my.id |
| Filebrowser | http://localhost:9999 | https://files.msytc.my.id |
| Actual | http://localhost:5006 | https://budget.msytc.my.id |
| WAHA | http://localhost:3004 | - |
| Sourcebot | http://localhost:3003 | - |

---

## 🔄 Common Commands

### Start/Stop
```bash
# Start services
docker compose up -d

# Stop services
docker compose down

# Restart services
docker compose restart
```

### Logs
```bash
# All logs
docker compose logs -f

# Specific service
docker compose logs -f trilium
docker compose logs -f open-webui
```

### Update
```bash
# Pull latest images
docker compose pull

# Rebuild and restart
docker compose up -d --build
```

### Cleanup
```bash
# Remove unused containers
docker container prune

# Remove unused images
docker image prune -a

# Remove unused volumes
docker volume prune
```

---

## 🔐 Security

### HTTPS Setup (Cloudflare Tunnel)
1. Setup Cloudflare Tunnel
2. Configure domains:
   - `notes.msytc.my.id` → 8081
   - `code.msytc.my.id` → 8443
   - `git.msytc.my.id` → 3005
   - `ai.msytc.my.id` → 8888
   - `files.msytc.my.id` → 9999
   - `budget.msytc.my.id` → 5006

### Firewall
```bash
# Open required ports
sudo ufw allow 22/tcp      # SSH
sudo ufw allow 80/tcp      # HTTP (Cloudflare)
sudo ufw allow 443/tcp     # HTTPS (Cloudflare)
sudo ufw enable
```

---

## 📊 Monitoring

### Check Disk Usage
```bash
df -h /home/moh_solehuddin190805/server-app/data
```

### Check Memory Usage
```bash
docker stats
```

### Check Container Health
```bash
docker compose ps
```

---

## 🛠️ Maintenance

### Weekly Tasks
- [ ] Check disk usage
- [ ] Review logs
- [ ] Update Docker images
- [ ] Run backup

### Monthly Tasks
- [ ] Test restore procedure
- [ ] Review security
- [ ] Clean up unused data
- [ ] Update documentation

---

## 🆘 Troubleshooting

### Service not starting
```bash
# Check logs
docker compose logs SERVICE_NAME

# Restart service
docker compose restart SERVICE_NAME
```

### Port conflict
```bash
# Check port usage
netstat -tlnp | grep :PORT

# Change port in docker-compose.yaml
```

### Database connection error
```bash
# Check DB container
docker compose ps db

# Test connection
docker compose exec db psql -U postgres -c "SELECT 1"
```

---

## 📚 Documentation

- **README.md** - Overview dan quick start
- **SERVICES.md** - Detail setiap service
- **BACKUP.md** - Backup dan restore guide
- **Docker Compose** - Full configuration

---

## 📞 Support

**Owner**: Moh Solehuddin  
**Email**: mrsoleh@msytc.my.id

---

*Last Updated: 2026-06-05*
