# Dokumentasi Service Integration Ollama & Budget

**Branch:** `ai-dev` (active development)  
**Date:** 2026-06-06  
**Status:** Alpha (functional, dengan issue Ollama connection)

---

## Overview

Dua Node.js microservices yang diintegrasikan untuk memproses transaksi Telegram dan mensinkronkannya ke Actual Budget:

```
Telegram → integrate-ollama:3002 → integrate-actual-budget-service:3001 → Actual Budget:5006
```

---

## Daftar Service

### 1. integrate-ollama (API Gateway)
- **Port:** 3002
- **Lokasi:** `~/server-app/integrate-ollama`
- **Fungsi:** API Gateway yang menangani:
  - Menerima pesan transaksi Telegram
  - Preprocessing dengan Ollama (Gemma model)
  - Parsing JSON transaksi dengan Ollama (Qwen model)
  - Forwarding ke Budget Service

### 2. integrate-actual-budget-service (Budget Service)
- **Port:** 3001
- **Lokasi:** `~/server-app/integrate-actual-budget-service`
- **Fungsi:** Budget Service yang menangani:
  - Membuat struktur budget per Telegram sender
  - Mengelola accounts & categories
  - Mensinkronkan transaksi ke Actual Budget

---

## Status Deployment

### ✅ Yang Sudah Selesai

| Komponen | Status | Keterangan |
|----------|--------|------------|
| Dockerfile | ✅ Done | Kedua service sudah punya Dockerfile yang benar |
| Build Images | ✅ Done | Image berhasil dibuat dengan `docker compose build` |
| Docker Compose | ✅ Done | `docker-compose.yaml` sudah dikonfigurasi |
| Container Start | ✅ Done | Kedua container bisa dijalankan |
| Node Modules | ✅ Done | Dependencies terinstall (termasuk sqlite3 native modules) |
| Environment Config | ✅ Done | `.env` dan `.env.example` sudah lengkap |
| Basic API Routes | ✅ Done | Health check dan endpoint dasar berfungsi |

---

## Issue Saat Ini

### ❌ Ollama Connection Issue

**Error:**
```json
{
  "status": "error",
  "error": "fetch failed"
}
```

**Endpoint yang gagal:** `GET /test/ollama`

**Penyebab:**
- Container tidak bisa mengakses Ollama di `http://host.docker.internal:11434`
- `host.docker.internal` mungkin tidak tersedia di setup Docker Compose ini

**Kondisi Ollama di Host:**
- Ollama berjalan di host machine pada port 11434
- Dapat diakses langsung dari host: `http://localhost:11434`

**Kemungkinan Solusi:**
1. Gunakan `network_mode: host` di docker-compose
2. Gunakan IP statis host dengan `extra_hosts`
3. Pastikan Ollama bisa diakses melalui Docker network

---

## Fitur yang Sudah Diimplementasikan

### integrate-ollama (API Gateway)

| Fitur | Status | Endpoint |
|-------|--------|----------|
| Health Check | ✅ | `GET /` |
| Test Ollama | ❌ (Issue) | `GET /test/ollama` |
| Parse Transaction | 🚧 (Pending) | `POST /api/transaction` |
| Database (SQLite) | ✅ | `./database.sqlite` |
| Ollama Service (AI) | ✅ | Preprocessing + Parsing |
| Budget Service Client | ✅ | HTTP request ke port 3001 |

### integrate-actual-budget-service (Budget Service)

| Fitur | Status | Endpoint |
|-------|--------|----------|
| Health Check | ✅ | `GET /` |
| Budget Status | ✅ | `GET /api/budget/status` |
| Accounts | ✅ | `GET /api/budget/accounts` |
| Categories | ✅ | `GET /api/budget/categories` |
| Transactions | 🚧 (Pending) | `POST /api/budget/transactions` |
| Database (SQLite) | ✅ | `./database.sqlite` |
| Actual Budget API | ✅ | HTTP request ke port 5006 |
| JWT Auth | ✅ | In-memory token cache |

---

## Dokumentasi yang Perlu Dibuat

### ✅ Yang Sudah Ada

| Dokumen | Status |
|---------|--------|
| README.md | ✅ Ada |
| QUICKSTART.md | ✅ Ada |
| API.md | ✅ Ada |

### 🚧 Yang Perlu Dibuat/Update

| Dokumen | Deskripsi |
|---------|-----------|
| MICROSERVICES.md | Arsitektur lengkap, data flow, integration flow |
| DEPLOYMENT.md | Panduan deployment production |
| ISSUE_LOG.md | Catatan issue & resolution (file ini) |
| TESTING.md | Panduan testing end-to-end |
| TROUBLESHOOTING.md | Solusi masalah umum |

---

## Struktur File Utama

### integrate-ollama
```
integrate-ollama/
├── src/
│   ├── app.js                    # Express server
│   ├── config.js                 # Environment config
│   ├── database.js              # SQLite setup
│   ├── services/
│   │   ├── ollama.service.js    # AI parsing
│   │   ├── budget.service.js    # Budget API client
│   │   └── auth.service.js      # JWT handling
│   ├── controllers/
│   │   └── transaction.controller.js
│   └── routes/
│       └── transaction.routes.js
├── .env.example
├── .env
├── Dockerfile
├── package.json
├── README.md
├── QUICKSTART.md
├── API.md
└── database.sqlite (created at runtime)
```

### integrate-actual-budget-service
```
integrate-actual-budget-service/
├── src/
│   ├── app.js                   # Express server
│   ├── config.js                # Environment config
│   ├── database.js              # SQLite setup
│   ├── services/
│   │   ├── budget.service.js    # Actual Budget API client
│   │   ├── auth.service.js      # JWT handling
│   │   └── user.service.js      # User management
│   ├── controllers/
│   │   └── budget.controller.js
│   └── routes/
│       └── budget.routes.js
├── .env.example
├── .env
├── Dockerfile
├── package.json
├── README.md
├── API.md
└── database.sqlite (created at runtime)
```

---

## Configuration

### integrate-ollama (.env)
```
OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=qwen2.5-coder:0.5b
OLLAMA_PREPROCESS_MODEL=gemma3:270m
BUDGET_SERVICE_URL=http://localhost:3001
PORT=3002
DATABASE_PATH=./database.sqlite
```

### integrate-actual-budget-service (.env)
```
PORT=3001
ACTUAL_BASE_URL=http://localhost:5006
ACTUAL_DEFAULT_PASSWORD=***
JWT_SECRET=super-secret-jwt-key-change-me
JWT_EXPIRES_IN=7d
DATABASE_PATH=./database.sqlite
```

---

## Quick Start (Docker)

```bash
# Navigate to project
cd ~/server-app

# Build images
docker compose build

# Start services
docker compose up -d

# Check status
docker compose ps
docker compose logs -f
```

---

## Testing Endpoints

### Health Check
```bash
# Budget Service
curl http://localhost:3001/

# API Gateway
curl http://localhost:3002/
```

### Ollama Test (currently failing)
```bash
curl http://localhost:3002/test/ollama
```

### Budget Status (Telegram user)
```bash
curl -H "X-Telegram-Sender: 7133351898" \
  http://localhost:3001/api/budget/status
```

---

## Next Steps

### Immediate (Bug Fix)
- [ ] Fix Ollama connection issue (host.docker.internal)
- [ ] Test end-to-end transaction parsing
- [ ] Verify Actual Budget sync

### Short Term (Week 1-2)
- [ ] Complete budget operations implementation
- [ ] Add transaction history UI
- [ ] Telegram webhook integration
- [ ] Documentation update

### Medium Term (Month 1)
- [ ] Rate limiting & auth
- [ ] Budget reporting API
- [ ] Monitoring & logging
- [ ] Production deployment

---

## Kontak & Issue Reporting

**Author:** Moh Solehuddin  
**Telegram:** @MohSolehuddin  
**Email:** moh.solehuddin@example.com  
**Repo:** https://github.com/MohSolehuddin/integrate-ollama

---

*Last updated: 2026-06-06*
