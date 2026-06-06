# Microservices Architecture - Integrate Ollama & Actual Budget

## Overview

Project ini terdiri dari **2 service terpisah** yang berkomunikasi via HTTP:

1. **integrate-ollama** (API Gateway + Parser) - Port 3002
2. **integrate-actual-budget-service** (Budget Service) - Port 3001

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    Telegram Bot                             │
│              (Webhook or Long Polling)                      │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              integrate-ollama (Port 3002)                   │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  Express.js Server                                    │  │
│  │  - /api/transaction (Parse & forward)                │  │
│  │  - /api/budget (Budget endpoints)                    │  │
│  └───────────────────────────────────────────────────────┘  │
│                     │                                        │
│                     ▼                                        │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  Ollama Service (AI Parsing)                          │  │
│  │  - Gemma: Preprocessing (bahasa gaul → formal)       │  │
│  │  - Qwen: JSON extraction                              │  │
│  └───────────────────────────────────────────────────────┘  │
└────────────────────┬────────────────────────────────────────┘
                     │ HTTP Request
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              integrate-actual-budget-service (Port 3001)    │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  Fastify Server                                       │  │
│  │  - /api/budget (Budget endpoints)                    │  │
│  │  - /login (Authentication)                           │  │
│  └───────────────────────────────────────────────────────┘  │
│                     │                                        │
│                     ▼                                        │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  Actual Budget Service (Port 5006)                   │  │
│  │  - Budget API (Accounts, Categories, Transactions)  │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## Project Structure

```
~/server-app/
├── docker-compose.yaml              # Main Docker Compose (existing)
├── .env                             # Environment variables
├── integrate-ollama/                # API Gateway + Parser
│   ├── src/
│   │   ├── config.js               # Ollama, Budget URLs
│   │   ├── database.js             # SQLite (state management)
│   │   ├── services/
│   │   │   ├── auth.service.js     # JWT caching
│   │   │   ├── ollama.service.js   # AI parsing
│   │   │   └── budget.service.js   # Budget service calls
│   │   ├── controllers/
│   │   │   └── transaction.controller.js
│   │   ├── routes/
│   │   │   ├── transaction.routes.js
│   │   │   └── budget.routes.js
│   │   ├── app.js                  # Express setup
│   │   └── server.js               # Entry point
│   ├── package.json
│   ├── .env.example
│   └── README.md
└── integrate-actual-budget-service/ # Budget Service
    ├── src/
    │   ├── config.js               # Budget, Actual URLs
    │   ├── database.js             # SQLite schema
    │   ├── services/
    │   │   ├── auth.service.js     # JWT management
    │   │   ├── actual.service.js   # Actual Budget API
    │   │   └── budget.service.js   # Budget operations
    │   ├── controllers/
    │   │   └── budget.controller.js
    │   ├── routes/
    │   │   └── budget.routes.js
    │   ├── app.js                  # Fastify setup
    │   └── server.js               # Entry point
    ├── package.json
    ├── .env.example
    └── README.md
```

## Service Responsibilities

### integrate-ollama (API Gateway)

| Function | Endpoint | Responsibility |
|----------|----------|----------------|
| Parse Transaction | `POST /api/transaction` | Telegram message → Ollama → Budget service |
| Get Budget Status | `GET /api/budget/status` | Check user budget existence |
| Get Accounts | `GET /api/budget/accounts` | List budget accounts |
| Get Categories | `GET /api/budget/categories` | List budget categories |
| Health Check | `GET /` | Service status |

**Tech Stack**: Express.js, SQLite, Ollama API

### integrate-actual-budget-service (Budget Service)

| Function | Endpoint | Responsibility |
|----------|----------|----------------|
| Login | `POST /login` | JWT authentication |
| Get Budget Status | `GET /api/budget/status` | Check budget existence |
| Get Accounts | `GET /api/budget/accounts` | List user accounts |
| Get Categories | `GET /api/budget/categories` | List budget categories |
| Add Transaction | `POST /api/budget/transactions` | Sync transaction to budget |
| Create Budget | `POST /api/budget` | Create new budget |

**Tech Stack**: Fastify, SQLite, Actual Budget API

### Actual Budget (External Service)

| Port | Container | Responsibility |
|------|-----------|----------------|
| 5006 | `actual_server` | Budget data storage & API |

---

## Running Services

### 1. Start Actual Budget (Docker)

Already running via `~/server-app/docker-compose.yaml`.

Verify:
```bash
curl http://localhost:5006
```

### 2. Start integrate-actual-budget-service

```bash
cd ~/server-app/integrate-actual-budget-service
npm install
cp .env.example .env
npm start
```

**Port**: 3001

### 3. Start integrate-ollama

```bash
cd ~/server-app/integrate-ollama
npm install
cp .env.example .env
npm start
```

**Port**: 3002

### 4. Verify Full Stack

```bash
# Health check
curl http://localhost:3002/

# Parse transaction
curl -X POST http://localhost:3002/api/transaction \
  -H "Content-Type: application/json" \
  -d '{"senderId":"7133351898","rawText":"makan 25rb"}'
```

---

## Data Flow

### Transaction Parsing Flow

```
1. Telegram message received
   ↓
2. POST /api/transaction (integrate-ollama:3002)
   ↓
3. Ollama Service:
   - Preprocess (Gemma)
   - Extract JSON (Qwen)
   ↓
4. POST /api/budget/transactions (integrate-actual-budget-service:3001)
   ↓
5. POST /budget/transactions (Actual Budget:5006)
   ↓
6. Response back through chain
```

### Budget Auto-Creation Flow

```
1. New sender_id detected
   ↓
2. integrate-ollama:3002 calls integrate-actual-budget-service:3001
   ↓
3. Budget created in Actual Budget:5006
   ↓
4. User record updated in SQLite
   ↓
5. Budget structure returned
```

---

## Environment Configuration

### integrate-ollama/.env

```env
# Ollama Configuration
OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=qwen2.5-coder:0.5b
OLLAMA_PREPROCESS_MODEL=gemma3:270m

# Budget Service
BUDGET_SERVICE_URL=http://localhost:3001
BUDGET_DEFAULT_PASSWORD=***

# Server
PORT=3002
DATABASE_PATH=./database.sqlite
```

### integrate-actual-budget-service/.env

```env
# Budget Service
PORT=3001
DATABASE_PATH=./database.sqlite

# Actual Budget
ACTUAL_BASE_URL=http://localhost:5006
ACTUAL_DEFAULT_PASSWORD=***

# JWT
JWT_SECRET=super-secret-jwt-key-change-me
JWT_EXPIRES_IN=7d
```

---

## Testing

### Test integrate-ollama

```bash
# Health check
curl http://localhost:3002/

# Parse transaction
curl -X POST http://localhost:3002/api/transaction \
  -H "Content-Type: application/json" \
  -d '{"senderId":"7133351898","rawText":"makan 25rb"}'
```

### Test integrate-actual-budget-service

```bash
# Health check
curl http://localhost:3001/

# Get budget status
curl http://localhost:3001/api/budget/status \
  -H "X-Telegram-Sender: 7133351898"

# Get accounts
curl http://localhost:3001/api/budget/accounts \
  -H "X-Telegram-Sender: 7133351898"
```

---

## Deployment

### With Docker Compose

Add to `~/server-app/docker-compose.yaml`:

```yaml
services:
  integrate-ollama:
    build: ./integrate-ollama
    ports:
      - "3002:3002"
    environment:
      - OLLAMA_URL=http://host.docker.internal:11434
      - BUDGET_SERVICE_URL=http://localhost:3001
    networks:
      - home-server-docker-network

  integrate-actual-budget-service:
    build: ./integrate-actual-budget-service
    ports:
      - "3001:3001"
    environment:
      - ACTUAL_BASE_URL=http://actual_server:5006
    networks:
      - home-server-docker-network

networks:
  home-server-docker-network:
    driver: bridge
```

Build and run:
```bash
cd ~/server-app
docker-compose up -d --build
```

---

## Development

### Branch Strategy

- **`ai-dev`**: Active development (integrate-ollama)
- **`main`**: Production-ready

### Adding New Features

1. Create feature branch from `ai-dev`
2. Implement in respective service
3. Test full flow
4. Merge to `ai-dev`
5. Push to GitHub

---

*Last updated: 2026-06-06*
