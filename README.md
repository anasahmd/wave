# Wave — AI Database Assistant

Wave is a full-stack web application that lets you connect to your databases (PostgreSQL, MySQL, MongoDB) and query them using natural language. An AI agent translates your questions into read-only queries, executes them, and returns human-readable answers.

## Architecture

```
┌─────────────────┐        ┌──────────────────────────────┐
│  React (Vite)   │◄──────►│  Express API Server          │
│  TailwindCSS v4 │  REST  │  LangChain/LangGraph Agent   │
│  Redux Toolkit  │        │  Mongoose (MongoDB metadata)  │
└─────────────────┘        └──────┬───────────────────────┘
                                  │
                    ┌─────────────┼─────────────┐
                    ▼             ▼             ▼
               PostgreSQL      MySQL        MongoDB
              (user DBs)    (user DBs)    (user DBs)
```

## Tech Stack

| Layer     | Technology                                          |
| --------- | --------------------------------------------------- |
| Frontend  | React 19, Vite 8, TailwindCSS v4, Redux Toolkit    |
| Backend   | Node.js, Express 5, Mongoose, LangChain, LangGraph |
| AI        | OpenAI-compatible API (Groq, LM Studio, etc.)       |
| DB Support| PostgreSQL (via TypeORM), MySQL (via TypeORM), MongoDB (native driver) |
| Auth      | JWT (7-day expiry), bcrypt password hashing         |
| Encryption| AES-256-GCM (Cryptr) for stored connection URIs     |

## Prerequisites

- **Node.js** ≥ 20
- **MongoDB** running locally (or a remote URI)
- **An LLM provider**: Groq API key, local LM Studio, or any OpenAI-compatible endpoint
- _(Optional)_ Docker & Docker Compose

## Local Setup

### 1. Clone the repository

```bash
git clone https://github.com/your-username/wave.git
cd wave
```

### 2. Server setup

```bash
cd server
cp .env.example .env
# Edit .env — fill in MONGO_URI, JWT_SECRET, ENCRYPTION_KEY, and LLM config
npm install
npm run dev
```

**Required `.env` variables:**

| Variable            | Description                                      | Example                            |
| ------------------- | ------------------------------------------------ | ---------------------------------- |
| `PORT`              | Server port                                      | `5000`                             |
| `MONGO_URI`         | MongoDB connection string (app metadata)         | `mongodb://localhost:27017/wave`    |
| `JWT_SECRET`        | Secret for signing JWTs                          | `a-long-random-string`             |
| `ENCRYPTION_KEY`    | Secret for encrypting stored DB URIs             | `another-long-random-string`       |
| `LLM_BASE_URL`     | OpenAI-compatible API base URL                   | `https://api.groq.com/openai/v1`   |
| `LLM_API_KEY`       | API key for the LLM provider                    | `gsk_...`                          |
| `LLM_MODEL`         | Model identifier                                 | `llama-3.1-8b-instant`             |

Optional LangSmith tracing variables are also supported (see `.env.example`).

### 3. Client setup

```bash
cd client
cp .env .env.local   # or create one
# Ensure VITE_API_URL=http://localhost:5000/api
npm install
npm run dev
```

The client runs at `http://localhost:5173` by default.

### 4. Using Docker (recommended)

```bash
# From the project root
docker compose up --build
```

This starts the server (port 5000), client (port 5173), and MongoDB (port 27017).

## Usage

1. **Register** or **Login as Guest**
2. **Add a database** — paste a connection URI (`postgres://`, `mysql://`, `mongodb://`)
3. **Ask questions** in natural language (e.g., "How many users signed up this week?")
4. The AI agent generates and executes read-only queries, then summarises the results

## Project Structure

```
wave/
├── client/                  # React frontend (Vite + TailwindCSS v4)
│   └── src/
│       ├── components/      # UI components (sidebar, chat, settings, ui library)
│       ├── providers/       # AuthProvider (Context), ChatProvider (Context)
│       ├── slices/          # Redux Toolkit slices (connectionSlice)
│       ├── reducers/        # useReducer reducers (auth, chat)
│       ├── services/        # Axios API client
│       ├── types/           # TypeScript interfaces
│       └── validations/     # Zod schemas (client-side)
├── server/                  # Express backend
│   ├── controllers/         # Route handlers (auth, chat, connection)
│   ├── middleware/           # JWT auth, Zod validation
│   ├── models/              # Mongoose schemas (User, Connection, Thread)
│   ├── routes/              # Express routers
│   ├── services/            # Business logic
│   │   ├── adapters/        # Database adapters (Postgres, MySQL, Mongo)
│   │   ├── agentService.js  # LangChain agent creation & invocation
│   │   ├── chatService.js   # Thread & connection helpers
│   │   ├── dbManager.js     # In-memory connection pool
│   │   └── llmService.js    # LLM factory
│   ├── utils/               # Encryption, SQL validation
│   └── validations/         # Zod schemas (server-side)
└── docker-compose.yml
```

## API Endpoints

| Method   | Endpoint                          | Auth | Description                  |
| -------- | --------------------------------- | ---- | ---------------------------- |
| POST     | `/api/auth/register`              | No   | Register a new user          |
| POST     | `/api/auth/login`                 | No   | Login                        |
| POST     | `/api/auth/guest`                 | No   | Guest login                  |
| GET      | `/api/auth/me`                    | Yes  | Get current user             |
| PUT      | `/api/auth/password`              | Yes  | Change password              |
| PATCH    | `/api/auth/profile`               | Yes  | Update profile               |
| POST     | `/api/connections/connect`        | Yes  | Add & connect a database     |
| GET      | `/api/connections`                | Yes  | List connections             |
| POST     | `/api/connections/:id/activate`   | Yes  | Activate a connection        |
| POST     | `/api/connections/:id/disconnect` | Yes  | Disconnect                   |
| DELETE   | `/api/connections/:id`            | Yes  | Remove connection & data     |
| PATCH    | `/api/connections/:id/name`       | Yes  | Rename connection            |
| POST     | `/api/chats`                      | Yes  | Send a chat message          |
| GET      | `/api/chats/threads/:connId`      | Yes  | List threads for connection  |
| GET      | `/api/chats/messages/:threadId`   | Yes  | Get messages in a thread     |
| DELETE   | `/api/chats/threads/:threadId`    | Yes  | Delete a thread              |
| PATCH    | `/api/chats/threads/:threadId/pin`| Yes  | Toggle thread pin            |
| PATCH    | `/api/chats/threads/:threadId/title` | Yes | Update thread title       |

## License

ISC
