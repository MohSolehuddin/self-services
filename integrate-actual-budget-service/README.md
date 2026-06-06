# integrate-actual-budget-service - Budget Service

**Branch:** `ai-dev` (active development)  
**Port:** 3001

## Overview

This is the **Budget Service** that manages budget operations including:

1. Creating budget structures per Telegram sender
2. Managing budget accounts and categories
3. Syncing transactions to Actual Budget

## Architecture

```
integrate-ollama:3002 → integrate-actual-budget-service:3001 → Actual Budget:5006
```

## Quick Start

```bash
cd ~/server-app/integrate-actual-budget-service
npm install
cp .env.example .env
npm start
```

## Endpoints

### Health Check
```
GET /
```

### Get Budget Status
```
GET /api/budget/status
Headers:
  X-Telegram-Sender: 7133351898
```

### Get Accounts
```
GET /api/budget/accounts
Headers:
  X-Telegram-Sender: 7133351898
```

### Get Categories
```
GET /api/budget/categories
Headers:
  X-Telegram-Sender: 7133351898
```

### Add Transaction
```
POST /api/budget/transactions
Headers:
  X-Telegram-Sender: 7133351898
```

**Request:**
```json
{
  "accountId": "acc_123",
  "transactions": [{
    "date": "2026-06-06",
    "amount": 2500000,
    "payee": "Warung",
    "category": "food",
    "notes": "Makan siang"
  }]
}
```

## Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3001` | Server port |
| `DATABASE_PATH` | `./database.sqlite` | SQLite database path |
| `ACTUAL_BASE_URL` | `http://localhost:5006` | Actual Budget service URL |
| `ACTUAL_DEFAULT_PASSWORD` | `***` | Default password |
| `JWT_SECRET` | `super-secret-jwt-key-change-me` | JWT secret |
| `JWT_EXPIRES_IN` | `7d` | Token expiry |

## Documentation

- **MICROSERVICES.md**: Full microservices architecture
- **API.md**: Complete API reference
- **DEVELOPMENT.md**: Development guide

## Next Steps

- [ ] Complete budget operations implementation
- [ ] Add transaction history
- [ ] Budget reporting API
- [ ] Rate limiting

---

*Last updated: 2026-06-06*
