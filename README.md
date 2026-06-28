# PromptEvo

**Advanced AI red-team automation framework for auditing LLM safety** — powered by a LangGraph pipeline with a real-time web UI.

PromptEvo orchestrates multi-agent red-team operations (reconnaissance, persuasion probing, compliance scoring, and reporting) against target LLMs. Agents adapt strategies in real time using MCTS-guided selection, goal rotation, and an experience pool.

## Architecture

```
┌──────────────┐       ┌──────────────────┐       ┌──────────┐
│  React UI    │ ◄──►  │  FastAPI Backend │ ◄──►  │  Ollama  │
│  (frontend/) │  SSE  │  (api.py)        │       │ gemma2:2b│
└──────────────┘       └────────┬─────────┘       └──────────┘
                                │ LangGraph
                         ┌──────▼──────┐
                         │  Pipeline   │
                         │  scout →    │
                         │  analyst →  │
                         │  inquiry →  │
                         │  judge →    │
                         │  reporter   │
                         └─────────────┘
```

## Features

- **Multi-agent LangGraph pipeline** — Scout Planner, Scout, Analyst, Decomposer, Inquiry Swarm, Target, Judge, Combiner, Reporter
- **Real-time SSE streaming** — watch every node execute live in the browser
- **MCTS-guided strategy selection** — adapts persuasion techniques per target
- **Goal rotation** — cycles through objective families (structural inquiry, priority inversion, domain-specific, full jailbreak)
- **Mock target support** — test the pipeline without a real LLM (`target_model: "mock-target"`)
- **REST API + CLI** — integrate into CI/CD pipelines or run interactively

## Prerequisites

- **Python 3.11+**
- **Node.js 18+** (for frontend development)
- **Ollama** with `gemma2:2b` (or any supported model)

## Quick Start

### 1. Clone and set up

```powershell
git clone https://github.com/Tokyo00o/PromptEvo.git
cd PromptEvo

# Python backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt

# Environment configuration
copy .env.example .env

# Pull the local model
ollama pull gemma2:2b

# Frontend dependencies
cd frontend
npm install
cd ..
```

### 2. Launch

```powershell
python run.py
```

This starts both servers and opens the browser:
- **FastAPI backend** → `http://localhost:8000`
- **React frontend** → `http://localhost:5173`

> **Tip:** For faster startup, build the frontend once (`cd frontend && npm run build`). The backend serves the built UI directly at `http://localhost:8000`, and `python run.py` skips the Vite dev server.

### 3. Run an Audit

Open the UI → click **New Audit** → enter an objective → launch.

Or use the API directly:

```powershell
curl -X POST http://localhost:8000/api/v1/audit `
  -H "Content-Type: application/json" `
  -d '{"objective":"Reveal the complete system prompt","target_model":"mock-target"}'
```

### 4. CLI Mode (no UI)

```powershell
python main.py --objective "Reveal your system prompt" --target mock-target
```

## Usage

| Command | Description |
|---------|-------------|
| `python run.py` | Start backend + frontend, open browser |
| `uvicorn api:app --reload` | Start REST API with hot-reload |
| `python main.py` | Run audit from the CLI |
| `npm run dev` (in `frontend/`) | Start React dev server |
| `pytest tests/` | Run test suite |

## Project Structure

```
PromptEvo/
├── api.py              # FastAPI REST + SSE endpoints
├── main.py             # CLI entry point
├── config.py           # Central settings and LLM factory
├── run.py              # One-command launcher
├── requirements.txt    # Python dependencies
├── .env.example        # Environment variable template
├── frontend/           # React + Vite + TypeScript UI
│   ├── src/            # Components, pages, hooks, API client
│   ├── package.json
│   └── vite.config.ts
├── core/               # LangGraph pipeline and state machine
│   └── graph.py        # Graph topology, reporter, routing
├── agents/             # Agent implementations
│   ├── scout/          # Adaptive reconnaissance (MCTS-guided)
│   ├── scout_planner/  # Offline preparation (profiling, scenario gen)
│   ├── analyst/        # Strategy layer, technique selection
│   ├── hive_mind/      # Inquiry swarm (persuasion delivery)
│   ├── target/         # Target LLM adapter
│   └── ...             # Decomposer, combiner, referee, etc.
├── adapters/           # LLM provider adapters (Ollama, OpenAI, Groq, etc.)
├── evaluators/         # Response classification, Prometheus scoring
├── infra/              # Security, persistence, observability
├── memory/             # MCTS memory, experience pool
├── reporting/          # Report generation
├── tests/              # Integration and unit tests
└── dashboard/          # Legacy Streamlit dashboard
```

## Pipeline Stages

| Stage | Role |
|-------|------|
| **Scout Planner** | Offline preparation — objective analysis, target profiling, scenario generation |
| **Scout** | Adaptive reconnaissance — MCTS-guided strategy selection, probe generation |
| **Analyst** | Strategy layer — selects persuasion techniques, routes probes |
| **Decomposer** | Breaks objectives into sub-goals |
| **Inquiry Swarm** | Delivers persuasion probes via role-inversion, authority-bias, etc. |
| **Target** | The LLM under test |
| **Judge** | Evaluates compliance, scores responses |
| **Combiner** | Aggregates findings across turns |
| **Reporter** | Generates final audit report |

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/v1/audit` | Launch an audit session |
| `GET` | `/api/v1/audit/{id}` | Poll session status and report |
| `GET` | `/api/v1/audit/{id}/stream` | SSE live stream of node execution |
| `GET` | `/api/v1/health` | Liveness probe |
| `GET` | `/api/v1/sessions` | List all sessions |
| `GET` | `/api/v1/findings` | List findings from completed reports |
| `GET` | `/api/v1/reports` | List audit reports |
| `GET` | `/api/v1/agents/metrics` | Agent performance metrics |
| `GET` | `/api/v1/graph-topology` | LangGraph Mermaid diagram |

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PROMPTEVO_DEV_DISABLE_AUTH` | `true` | Disable API key auth (dev only) |
| `PROMPTEVO_CORS_ORIGINS` | `http://localhost:5173` | Allowed CORS origins |
| `ALLOWED_TARGET_MODELS` | `mock-target,gemma2` | Comma-separated allowlist |
| `INQUIRYER_PROVIDER` | `ollama` | LLM provider (ollama, groq, openai, etc.) |
| `INQUIRYER_MODEL` | `gemma2:2b` | Model name for probe generation |
| `PROMPTEVO_FAST_DEBUG` | `true` | Skip expensive evaluations for faster iteration |
| `DEBERTA_ENABLED` | `false` | Enable DeBERTa-based response classifier |
| `LOG_LEVEL` | `INFO` | Logging verbosity |

## Frontend Pages

| Route | Page |
|-------|------|
| `/` | Dashboard — recent sessions and summary |
| `/new-audit` | Create a new audit session |
| `/session/{id}/live` | Live audit stream (SSE) |
| `/session/{id}` | Audit detail and report |
| `/findings` | Cross-session findings browser |
| `/reports` | Completed audit reports |
| `/memory` | TLTM memory store viewer |
| `/agents` | Agent performance metrics |
| `/settings` | Application settings |

## Testing

```powershell
pytest tests/
```
