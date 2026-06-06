# Production Deployment Guide

**Last Updated:** 2026-06-06  
**Author:** AI Agent

---

## Overview

This guide covers deployment of all three services:

1. **personal-bot** - WhatsApp bot with AI & budget integration
2. **integrate-actual-budget-service** - Budget API service
3. **integrate-ollama** - AI API gateway

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    Production Network                            │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────┐  ┌──────────┐  ┌──────────┐  ┌─────────────┐     │
│  │  WAHA   │  │  Ollama  │  │  PostgreSQL│  │ Actual      │     │
│  │  (3000) │  │  (11434) │  │  (5432)    │  │ Budget      │     │
│  └─────────┘  └──────────┘  └──────────┘  │  (5006)     │     │
│                                             └─────────────┘     │
│        ┌─────────────┐      ┌──────────┐      ┌──────────┐     │
│        │  Personal   │      │ Budget   │      │  Ollama  │     │
│        │    Bot      │      │ Service  │      │ Gateway  │     │
│        │  (3001/2)   │      │  (3001)  │      │  (3002)  │     │
│        └─────────────┘      └──────────┘      └──────────┘     │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Prerequisites

- Docker & Docker Compose installed
- At least 4GB RAM (8GB recommended)
- 10GB free disk space
- Domain/subdomain for production access

---

## Step-by-Step Deployment

### 1. Clone All Repositories

```bash
cd ~/server-app

# Already cloned, but if fresh:
git clone git@github.com:MohSolehuddin/self-services.git
git clone git@github.com:MohSolehuddin/personal-bot.git

# Copy service files
cp -r self-services/integrate-actual-budget-service ./
cp -r self-services/integrate-ollama ./
cp -r self-services/ollama-proxy ./
```

### 2. Configure Environment

#### For personal-bot:

```bash
cd ~/server-app/personal-bot
cp .env.example .env

# Edit .env with:
WAHA_API_URL=http://waha-whatsapp:3000/api/sendText
WAHA_API_KEY=your_waha_api_key
ACTUAL_BUDGET_URL=http://actual_budget:5006
ACTUAL_BUDGET_PASSWORD=your_password
ACTUAL_BUDGET_ID=your_budget_id
ACTUAL_ACCOUNT_ID=your_account_id
GEMINI_API_KEY=your_gemini_api_key
```

#### For integrate-actual-budget-service:

```bash
cd ~/server-app/integrate-actual-budget-service
cp .env.example .env

# Edit .env:
POSTGRES_HOST=postgres
POSTGRES_PORT=5432
POSTGRES_DB=budget_service
POSTGRES_USER=postgres
POSTGRES_PASSWORD=***
ACTUAL_BASE_URL=http://actual_budget:5006
ACTUAL_DEFAULT_PASSWORD=***
JWT_SECRET=super-unique-secret-key-here
JWT_EXPIRES_IN=7d
```

#### For integrate-ollama:

```bash
cd ~/server-app/integrate-ollama
cp .env.example .env

# Edit .env:
OLLAMA_URL=http://ollama:11434
BUDGET_SERVICE_URL=http://budget-service:3001
JWT_SECRET=super-unique-secret-key-here
JWT_EXPIRES_IN=7d
```

### 3. Build Docker Images

```bash
cd ~/server-app

# Build all images
docker-compose -f docker-compose.production.yaml build
```

### 4. Start Services

```bash
# Start all services
docker-compose -f docker-compose.production.yaml up -d

# Check status
docker-compose -f docker-compose.production.yaml ps
```

### 5. Verify Services

```bash
# Check logs
docker-compose -f docker-compose.production.yaml logs -f

# Test endpoints:
curl http://localhost:3001/        # Budget service health
curl http://localhost:3002/        # Ollama gateway health
curl http://localhost:3000/        # WAHA status
curl http://localhost:11434/       # Ollama status
```

---

## Testing Checklist

### personal-bot
- [ ] WAHA QR code scans successfully
- [ ] Bot receives messages
- [ ] AI responses work (`AI Halo`)
- [ ] Transaction parsing works (`B Makan 15k`)
- [ ] Transactions sync to Actual Budget
- [ ] No error logs

### Budget Service
- [ ] Health endpoint returns OK
- [ ] Create budget for new user
- [ ] Get accounts list
- [ ] Get categories list
- [ ] Transaction creation works
- [ ] PostgreSQL connection stable

### Ollama Gateway
- [ ] Health endpoint returns OK
- [ ] Gemma preprocessing works
- [ ] Qwen parsing works
- [ ] Budget service integration works
- [ ] JWT token caching works

---

## Monitoring

### Logs

```bash
# All services
docker-compose -f docker-compose.production.yaml logs -f

# Specific service
docker-compose -f docker-compose.production.yaml logs -f budget_service
```

### Metrics

```bash
# Check resource usage
docker stats

# Check container health
docker-compose -f docker-compose.production.yaml ps
```

### Alerts

Set up monitoring for:
- Service downtime
- High memory usage (>80%)
- Error log spikes

---

## Backup & Recovery

### Database Backup

```bash
# PostgreSQL backup
docker exec budget-postgres pg_dump -U postgres budget_service > backup.sql

# Restore
docker exec -i budget-postgres psql -U postgres budget_service < backup.sql
```

### Data Volumes

```bash
# Actual Budget data
docker run --rm -v actual_budget_data:/data -v $(pwd):/backup alpine tarczf /backup/actual-backup.tar.gz /data

# WAHA sessions
docker run --rm -v waha_sessions:/sessions -v $(pwd):/backup alpine tarczf /backup/waha-backup.tar.gz /sessions
```

---

## Troubleshooting

### Service Won't Start

```bash
# Check logs
docker-compose -f docker-compose.production.yaml logs <service>

# Restart
docker-compose -f docker-compose.production.yaml restart <service>
```

### Connection Issues

```bash
# Check network
docker network inspect production-network

# Check DNS
docker exec personal-bot ping actual_budget
docker exec personal-bot ping budget-service
```

### Database Issues

```bash
# Check connection
docker exec budget-postgres psql -U postgres -c '\dt'

# Rebuild tables (if needed)
docker-compose -f docker-compose.production.yaml down
docker volume rm budget-postgres_data
docker-compose -f docker-compose.production.yaml up -d postgres
```

---

## Maintenance

### Updates

```bash
# Pull latest changes
cd ~/server-app
git pull origin main

# Rebuild images
docker-compose -f docker-compose.production.yaml build

# Restart services
docker-compose -f docker-compose.production.yaml up -d
```

### Log Rotation

```bash
# Set up log rotation in docker-compose.yaml
logging:
  driver: json-file
  options:
    max-size: "10m"
    max-file: "3"
```

---

## Production Checklist

- [ ] All services running
- [ ] SSL/HTTPS configured (reverse proxy)
- [ ] Database backups scheduled
- [ ] Monitoring alerts set up
- [ ] Documentation updated
- [ ] API rate limiting configured
- [ ] Security scan passed
- [ ] Disaster recovery plan documented

---

## Support

For issues:
1. Check logs first
2. Verify configuration
3. Check network connectivity
4. Review service-specific docs

---

*Last Updated: 2026-06-06*
