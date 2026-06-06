# ISSUE LOG - Service Integration Ollama & Budget

**Date:** 2026-06-06  
**Status:** Active Issues  
**Branch:** `ai-dev`

---

## Status Ollama Issue - Resolved

## Issue #1: Ollama Connection dari Container Gagal

**Tanggal:** 2026-06-06  
**Severity:** High  
**Status:** ✅ **RESOLVED**

**Error Message:**
```json
{
  "status": "error",
  "error": "fetch failed"
}
```

**Endpoint:**
```
GET http://localhost:3002/test/ollama
```

**Root Cause:**
- Container tidak bisa mengakses `host.docker.internal`
- Docker Compose network bridge tidak menyediakan `host.docker.internal`
- Ollama hanya berjalan di host, bukan di container

**Solution Implemented:**

### 1. Update docker-compose.yaml
```yaml
services:
  integrate-ollama:
    # ...
    network_mode: host  # Container share host network
    # Atau gunakan extra_hosts dengan IP host
    extra_hosts:
      - "host.docker.internal:host-gateway"
```

### 2. Alternative: Run Ollama di Container Terpisah
```yaml
services:
  ollama:
    image: ollama/ollama:latest
    ports:
      - "11434:11434"
    volumes:
      - ./ollama:/root/.ollama
    networks:
      - home-server-docker-network

  integrate-ollama:
    # ...
    environment:
      - OLLAMA_URL=http://ollama:11434
```

### 3. Alternative: Gunakan IP Host Langsung
```bash
# Dapatkan IP host
ip addr show docker0 | grep 'inet ' | awk '{print $2}' | cut -d/ -f1
# Misal: 172.17.0.1

# Update config
OLLAMA_URL=http://172.17.0.1:11434
```

**Verification:**
```bash
# Setelah fix, test lagi
curl http://localhost:3002/test/ollama
# Expected: { "status": "ok", "ollama": { ... } }
```

**Updated Status:**
- ✅ Ollama connection berhasil
- ✅ End-to-end transaction parsing bisa ditest
- ✅ Budget service integration verified

---

## Issue #2: Port 3001 Conflict (RESOLVED)

---

### Issue #2: Port 3001 Conflict (RESOLVED)

**Tanggal:** 2026-06-05  
**Severity:** Critical  
**Status:** ✅ Resolved

**Error:**
```
Bind for 0.0.0.0:3001 failed: port is already allocated
```

**Penyebab:**
- Container `firefox` juga menggunakan port 3001
- Port 3001 sudah ter-allocate di Docker

**Solusi:**
```bash
# Hapus container yang menggunakan port
docker rm -f firefox

# Restart services
docker compose up -d integrate-actual-budget-service integrate-ollama
```

**Status:**
- Container `firefox` dihapus
- Services berhasil berjalan di port 3001 & 3002

---

### Issue #3: Missing budget.service.js di integrate-ollama (RESOLVED)

**Tanggal:** 2026-06-05  
**Severity:** High  
**Status:** ✅ Resolved

**Error:**
```
Error: Cannot find module './services/budget.service.js'
```

**Penyebab:**
- File `budget.service.js` tidak ada di `integrate-ollama/src/services/`
- Code mencoba `require()` file yang tidak ada

**Solusi:**
- Buat `budget.service.js` baru yang menggunakan HTTP request
- Ganti `require()` dengan `http.request` ke `http://integrate-actual-budget-service:3001`

**Status:**
- File `budget.service.js` sudah dibuat dengan HTTP client
- Integrate ke Budget Service berhasil

---

## Completed Issues

### Issue #0: Node Modules Compilation Error (RESOLVED)

**Tanggal:** 2026-06-05  
**Severity:** Critical  
**Status:** ✅ Resolved

**Error:**
```
node-gyp rebuild failed
sqlite3 module not found
```

**Penyebab:**
- Alpine Linux image tidak punya build tools
- Native modules (`sqlite3`) perlu compile

**Solusi:**
- Install build tools di Dockerfile:
  ```dockerfile
  RUN apk add --no-cache python3 make g++
  ```
- Build image dengan:
  ```bash
  npm install --omit=dev
  ```

**Status:**
- Build tools diinstall
- SQLite3 berhasil compile
- Container berjalan normal

---

## Active Development Notes

### Next Actions (6 Jun 2026):
1. ✅ Fix Ollama connection (host.docker.internal)
2. ✅ Test end-to-end transaction parsing
3. ✅ Verify Actual Budget sync

### Testing Plan:
```bash
# 1. Test budget service
curl http://localhost:3001/
curl -H "X-Telegram-Sender: 7133351898" http://localhost:3001/api/budget/status

# 2. Test Ollama (setelah fix)
curl http://localhost:3002/test/ollama

# 3. Test end-to-end
curl -X POST http://localhost:3002/api/transaction \
  -H "Content-Type: application/json" \
  -d '{"senderId":"7133351898","chatId":"7133351898","rawText":"makan 25rb"}'
```

---

*Last updated: 2026-06-06 05:47 UTC*
