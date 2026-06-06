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

## Stack

- **Runtime:** Node.js 20
- **Database:** PostgreSQL 16
- **Budget Engine:** Actual Budget (Docker)
- **API Framework:** Express.js

## Quick Start (Docker - Recommended)

### Using Docker Compose

```bash
cd ~/server-app/integrate-actual-budget-service
docker-compose up -d
```

This will start:
- PostgreSQL database (port 5432)
- Actual Budget server (port 5006)
- Budget Service API (port 3001)

### Using Node.js (Development)

```bash
cd ~/server-app/integrate-actual-budget-service
npm install
cp .env.example .env
npm start
```

**Note:** For development, you need:
- PostgreSQL running locally
- Actual Budget server accessible

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
| `POSTGRES_HOST` | `localhost` | PostgreSQL host |
| `POSTGRES_PORT` | `5432` | PostgreSQL port |
| `POSTGRES_DB` | `budget_service` | Database name |
| `POSTGRES_USER` | `postgres` | Database user |
| `POSTGRES_PASSWORD` | `postgres` | Database password |
| `ACTUAL_BASE_URL` | `http://actual_budget:5006` | Actual Budget service URL |
| `ACTUAL_DEFAULT_PASSWORD` | `secret` | Default password |
| `JWT_SECRET` | `super-secret-jwt-key-7133351898` | JWT secret |
| `JWT_EXPIRES_IN` | `7d` | Token expiry |

## Docker Compose Services

### PostgreSQL
- **Image:** postgres:16-alpine
- **Container:** budget-postgres
- **Port:** 5432
- **Volume:** postgres_data

### Actual Budget
- **Image:** actualbudget/actual-server:latest
- **Container:** actual-budget
- **Port:** 5006
- **Volume:** actual_budget_data

### Budget Service
- **Build:** Dockerfile
- **Container:** budget-service
- **Port:** 3001
- **Dependencies:** postgres, actual_budget

## Database Schema

### Tables
- **users** - Telegram user mapping (sender_id → budget info)
- **chats** - Telegram chat sessions
- **budget_accounts** - Budget account structures
- **transactions** - Transaction history

## Development

### Local Development Setup

1. **Start PostgreSQL:**
```bash
docker run -d \
  --name budget-postgres \
  -e POSTGRES_DB=budget_service \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -p 5432:5432 \
  postgres:16-alpine
```

2. **Start Actual Budget:**
```bash
docker run -d \
  --name actual-budget \
  -p 5006:5006 \
  actualbudget/actual-server:latest
```

3. **Run Budget Service:**
```bash
npm install
npm start
```

### Docker Commands

```bash
# Build image
docker-compose build

# Start services
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f

# Run migrations (if needed)
docker-compose exec budget-service psql -U postgres -d budget_service
```

## Troubleshooting

### Database Connection Issues
- Ensure PostgreSQL is running: `docker-compose ps postgres`
- Check connection string in `.env`
- Verify database exists: `docker-compose exec postgres psql -U postgres -c '\l'`

### Actual Budget Connection Issues
- Ensure Actual Budget container is running: `docker-compose ps actual_budget`
- Check Actual Budget URL in `.env`
- Verify network connectivity: `docker-compose exec budget_service ping actual_budget`

### Port Already in Use
- Change port in `.env` (e.g., `PORT=3002`)
- Update Docker Compose ports mapping accordingly

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
