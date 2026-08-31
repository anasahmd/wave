# Wave (AI Database Assistant)

Wave is a local-first web application that lets you connect to your databases (PostgreSQL, MySQL, MongoDB) and query them using natural language.

## Features

- **Natural Language Queries:** Ask questions in plain English; Wave's AI agent translates them into read-only SQL/MQL and executes them.
- **Inline Charts:** Automatic data visualization built directly into the chat interface.
- **Pattern Learning:** Save queries so the system learns from your schema and improves future answers.
- **Local-First & Secure:** Bring your own local LLM. Your data never leaves your machine.

---

## Prerequisites

- **Docker & Docker Compose**
- **An LLM provider:** LM Studio (recommended), Ollama, or any OpenAI-compatible API.

---

## Installation & Setup

1. Clone the repository and configure your environment:
   ```bash
   cp .env.example .env
   ```
2. Edit `.env` to set your `JWT_SECRET`, `ENCRYPTION_KEY`, and LLM connection details. You can generate random secrets using:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
   ```

### Development Mode (Hot Reload)

Starts the app with live hot-reloading for both the frontend (Vite) and backend (Nodemon).

```bash
docker compose -f docker-compose.dev.yml up
```

- Open **http://localhost:5173**
- _Note: The first run will take a few minutes as it installs npm dependencies inside the containers._

### Production Mode

Builds the static assets and runs the app behind a Caddy reverse proxy.

```bash
docker compose up -d --build
```

- Open **http://localhost:3742**

---

## Troubleshooting

- **Linux Users:** If using a local LLM like LM Studio, you must configure the LLM server to listen on all interfaces (`0.0.0.0`) so the Docker container can reach it via `host.docker.internal`.
- **Resetting Data:** To completely wipe your database, saved queries, and cached data, run:
  ```bash
  docker compose down -v
  ```

## License
[MIT](LICENSE)
