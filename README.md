<div align="center">

# ChaosForge

**Infrastructure OS for distributed load testing, chaos engineering, and AI-powered operational intelligence**

[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](backend/package.json)
[![Node.js](https://img.shields.io/badge/Node.js-20.x-339933?logo=node.js&logoColor=white)](backend/package.json)
[![Next.js](https://img.shields.io/badge/Next.js-16.2-000000?logo=next.js&logoColor=white)](frontend/package.json)
[![React](https://img.shields.io/badge/React-19.2-61DAFB?logo=react&logoColor=black)](frontend/package.json)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white)](docker-compose.yml)
[![Kafka](https://img.shields.io/badge/Apache-Kafka-231F20?logo=apachekafka&logoColor=white)](docker-compose.yml)
[![Prometheus](https://img.shields.io/badge/Prometheus-Metrics-E6522C?logo=prometheus&logoColor=white)](monitoring/)
[![Grafana](https://img.shields.io/badge/Grafana-Dashboards-F46800?logo=grafana&logoColor=white)](monitoring/grafana/)
<!-- [![NVIDIA](https://img.shields.io/badge/NVIDIA-NIM-AI-76B900?logo=nvidia&logoColor=white)](backend/src/modules/ai/) -->
![GitHub stars](https://img.shields.io/github/stars/yashuyouwaraj/ChaosForge?style=social)

<img src="docs/images/landing-page.png" alt="ChaosForge landing page" width="900" />

ChaosForge is a **control-plane platform** for running staged HTTP traffic simulations, injecting chaos faults, monitoring live telemetry, and generating executive operational reports — all from a single Next.js dashboard backed by Kafka workers, Redis runtime state, and an NVIDIA-powered AI copilot.

[Quick Start](#installation) · [Demo Video](#demo-video) · [Demo Flow](#demo-flow) · [Architecture](#architecture) · [API Reference](#api-documentation) · [Contributing](#contributing)

</div>

---

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Screenshots](#screenshots)
- [Demo Flow](#demo-flow)
- [Architecture](#architecture)
- [Technology Stack](#technology-stack)
- [Folder Structure](#folder-structure)
- [AI Platform](#ai-platform)
- [Chaos Engineering](#chaos-engineering)
- [Intelligence Engine](#intelligence-engine)
- [Reports](#reports)
- [API Documentation](#api-documentation)
- [Installation](#installation)
- [Running Locally](#running-locally)
- [Environment Variables](#environment-variables)
- [Docker](#docker)
- [Project Structure](#project-structure)
- [Design Decisions](#design-decisions)
- [Innovations](#innovations)
- [Performance](#performance)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)
- [Author](#author)

---

## Overview

### What is ChaosForge?

ChaosForge is a **distributed load-testing and real-time workflow visualization platform** for running staged traffic simulations against HTTP services. Operators create projects, launch simulations, watch live telemetry, inject chaos faults, analyze runs with AI, and export executive reports — while the backend coordinates Kafka workers, Redis metrics, WebSocket streaming, and MongoDB persistence.

### What problems does it solve?

| Problem | ChaosForge approach |
|---------|---------------------|
| Load testing tied to a single process | Kafka-backed worker cluster decouples orchestration from execution |
| Stale dashboard data during active runs | WebSocket streaming + Redis live counters |
| Chaos testing as a separate toolchain | Built-in fault injection during traffic execution |
| Post-run analysis requires manual correlation | 11 deterministic intelligence engines + NVIDIA AI copilot |
| No deployment confidence signal | Health, risk, and deployment readiness scoring |
| Observability siloed from testing | Embedded Prometheus + Grafana workspace |

### Why was it built?

ChaosForge was built to practice **production-style distributed workflow design** at a realistic portfolio scale. The goal is not to claim massive scale, but to demonstrate practical engineering judgment around Kafka, Redis, WebSockets, Prometheus, Grafana, Docker, chaos engineering, and AI-assisted operational intelligence.

### Who is it for?

- **SREs and platform engineers** validating service behavior under load and fault conditions
- **Backend engineers** building portfolio-grade distributed systems
- **Hiring managers and recruiters** evaluating full-stack + infrastructure engineering depth
- **Open source contributors** extending AI skills, intelligence engines, or worker behavior

---

## Key Features

### Distributed Load Testing

- Kafka-backed asynchronous worker orchestration
- Staged simulation configuration (RPS, duration, concurrency, total requests)
- Distributed HTTP request execution through worker processes
- Retry handling with backoff for transient failures
- Failure classification: timeout, server error, network failure
- Per-run metrics: request count, failures, latency buckets, avg/p95 latency, current RPS
- Run pause, resume, stop, and rate control via Redis
- Worker readiness checks before accepting simulations
- Run history, run comparison, and configuration snapshots

### Chaos Engineering

- Latency injection (min/max delay, percentage-based)
- HTTP failure injection (configurable status codes)
- Timeout injection
- Packet loss simulation
- Connection reset simulation
- Chaos profiles: **Custom**, **Latency**, **Network**, **Failure**, **Stress**
- Per-run chaos metrics and resilience rate reporting

### AI Copilot (NVIDIA NIM)

- 14 skill-based AI capabilities with automatic model routing
- 8 supported models via NVIDIA integrate API (Nemotron Ultra/Super, Llama, Mistral, Phi, DeepSeek, Qwen)
- Streaming responses via Server-Sent style token delivery
- Conversational **Ask ChaosForge** workspace with conversation persistence
- Context builder, prompt builder, context compression, and response caching
- Skills: explain run/dashboard/report, compare runs, incident investigator, executive brief, optimization advisor, chaos advisor, capacity planner, runbook, postmortem, AI report generator, weekly review

### Operational Intelligence

- Unified Intelligence Engine with 11 analysis engines
- Health score (0–100 with grade A–D)
- Predictive risk scoring
- Root cause analysis
- Priority recommendations
- Deployment readiness (availability, reliability, performance, resilience, observability)
- Trend analysis and historical comparison
- Infrastructure memory across runs
- Executive summary and brief generation
- Real-time intelligence streaming via WebSocket

### Observability

- Prometheus `/metrics` endpoint with `prom-client` instrumentation
- Grafana dashboard provisioning (`chaosforge-metrics.json`)
- Embedded Grafana and Prometheus panels in the Observability workspace
- Platform health, infrastructure status, and incident timeline
- Live log streaming per run

### Real-time Dashboard

- WebSocket-driven metrics, logs, incidents, and completion events
- Platform health grid and infrastructure topology
- AI dashboard widgets and copilot explain panels
- Incident timeline with severity classification
- Active simulation controls and run selection

### Reports & Export

- PDF executive reports (PDFKit)
- JSON structured export
- CSV tabular metrics export
- AI report appendix with intelligence sections
- Charts: latency distribution, failure heatmap, regression analysis

### Platform Services

- JWT authentication with bcrypt password hashing
- Project-scoped ownership middleware
- User settings (appearance, simulation defaults, notifications, AI preferences)
- Email notifications (simulation completed, weekly reports via nodemailer + node-cron)
- Stripe billing integration (free / pro / enterprise plans)
- Usage tracking and plan middleware

---

## Screenshots

All screenshots below were captured from a **live running simulation** with real-time metrics, graphs, and telemetry streaming. Regenerate anytime with:

```bash
node scripts/capture-readme-screenshots.mjs
node scripts/record-demo-video.mjs
```

### Demo Video

Watch ChaosForge in action — landing page tour, live simulation, dashboard metrics, simulation history, chaos engineering, and AI copilot.

**File:** [`docs/videos/chaosforge-demo.webm`](docs/videos/chaosforge-demo.webm)

Regenerate with `node scripts/record-demo-video.mjs`. Upload the `.webm` file to GitHub or LinkedIn when publishing — GitHub README video embeds require the file to be committed and pushed to the repo.

---

### Landing Page (Full Scroll)

The marketing landing page walks through the complete platform story: workflow, chaos engineering, AI copilot, architecture, dashboard showcase, intelligence engine, and pricing.

| Hero | Workflow |
|------|----------|
| <img src="docs/images/landing-hero.png" alt="Landing hero section" width="420" /> | <img src="docs/images/landing-workflow.png" alt="Landing workflow section" width="420" /> |

| Chaos Engineering | AI Copilot |
|-------------------|------------|
| <img src="docs/images/landing-chaos.png" alt="Landing chaos section" width="420" /> | <img src="docs/images/landing-ai-copilot.png" alt="Landing AI copilot section" width="420" /> |

| Architecture | Dashboard Showcase |
|--------------|-------------------|
| <img src="docs/images/landing-architecture.png" alt="Landing architecture section" width="420" /> | <img src="docs/images/landing-dashboard-showcase.png" alt="Landing dashboard showcase" width="420" /> |

| Intelligence Engine | Pricing |
|---------------------|---------|
| <img src="docs/images/landing-intelligence.png" alt="Landing intelligence section" width="420" /> | <img src="docs/images/landing-pricing.png" alt="Landing pricing section" width="420" /> |

---

### Authentication

| Login | Register |
|-------|----------|
| <img src="docs/images/login.png" alt="Login page" width="420" /> | <img src="docs/images/register.png" alt="Register page" width="420" /> |

---

### Dashboard — Live Simulation Running

The dashboard streams real-time telemetry while a simulation is active: RPS, latency buckets, throughput graphs, infrastructure feed, and AI intelligence panels.

| Overview | Realtime Telemetry |
|----------|-------------------|
| <img src="docs/images/dashboard.png" alt="Dashboard overview" width="420" /> | <img src="docs/images/dashboard-realtime-telemetry.png" alt="Dashboard realtime telemetry" width="420" /> |

| Running Graphs (RPS / Throughput) | Latency Distribution |
|-----------------------------------|---------------------|
| <img src="docs/images/dashboard-running-graphs.png" alt="Dashboard running graphs" width="420" /> | <img src="docs/images/dashboard-latency-buckets.png" alt="Dashboard latency buckets" width="420" /> |

| Live Infrastructure Feed | Simulation Controls |
|--------------------------|---------------------|
| <img src="docs/images/dashboard-live-logs.png" alt="Dashboard live logs" width="420" /> | <img src="docs/images/dashboard-running-simulation.png" alt="Simulation Controls" width="420" /> |

---

### Simulations Workspace

Configure staged traffic, monitor active runs, review simulation history, and compare past runs side-by-side.

| Simulations Overview | Create Simulation Panel |
|----------------------|------------------------|
| <img src="docs/images/simulations.png" alt="Simulations page" width="420" /> | <img src="docs/images/simulations-create.png" alt="Create simulation panel" width="420" /> |

| Active Simulations | Simulation History |
|--------------------|-------------------|
| <img src="docs/images/simulations-active.png" alt="Active simulations" width="420" /> | <img src="docs/images/simulation-history.png" alt="Simulation history" width="420" /> |

| Run Comparison | Live Metrics During Run |
|----------------|------------------------|
| <img src="docs/images/simulations-run-comparison.png" alt="Run comparison" width="420" /> | <img src="docs/images/simulation-running.png" alt="Simulation running with graphs" width="420" /> |

---

### Projects

Project management with environment targets, recent runs, and linked infrastructure.

<img src="docs/images/projects.png" alt="Projects page" width="900" />

---

### Chaos Engineering

Chaos configuration with fault type cards, profiles, and experiment controls.

<img src="docs/images/chaos-page.png" alt="Chaos engineering page" width="900" />

---

### Observability

Embedded Grafana and Prometheus workspace for infrastructure monitoring.

| Observability Workspace | Grafana Dashboard |
|-------------------------|-------------------|
| <img src="docs/images/observability.png" alt="Observability workspace" width="420" /> | <img src="docs/images/grafana-dashboard.png" alt="Grafana dashboard" width="420" /> |

| Prometheus Targets |
|--------------------|
| <img src="docs/images/prometheus-panels.png" alt="Prometheus panels" width="420" /> |

---

### AI Copilot

| AI Insights Workspace | Ask ChaosForge (Conversational) |
|-----------------------|--------------------------------|
| <img src="docs/images/ai-copilot.png" alt="AI copilot workspace" width="420" /> | <img src="docs/images/ask-chaosforge.png" alt="Ask ChaosForge" width="420" /> |

---

### Reports & Run Details

| Reports List | Run Details / Intelligence Report |
|--------------|----------------------------------|
| <img src="docs/images/reports.png" alt="Reports page" width="420" /> | <img src="docs/images/run-details.png" alt="Run details report" width="420" /> |

---

### Infrastructure & Settings

| Infrastructure Health | Settings |
|-----------------------|----------|
| <img src="docs/images/infrastructure.png" alt="Infrastructure page" width="420" /> | <img src="docs/images/settings.png" alt="Settings page" width="420" /> |

| AI Model Configuration |
|------------------------|
| <img src="docs/images/ai-settings.png" alt="AI settings" width="420" /> |

---

## Demo Flow

```
Create Project
      ↓
Configure Simulation (RPS, duration, concurrency, target URL)
      ↓
Launch Traffic (API → Kafka → Workers → HTTP target)
      ↓
Monitor Dashboard (WebSocket telemetry, latency, RPS, logs)
      ↓
Inject Chaos (latency, failures, packet loss, timeouts, resets)
      ↓
Analyze with AI (Intelligence Engine + NVIDIA copilot)
      ↓
Generate Reports (PDF / JSON / CSV with executive summary)
      ↓
Deployment Decision (health, risk, deployment readiness scores)
```

### Step-by-step

1. **Register / Sign in** at `/signup` or `/login`
2. **Create a project** at `/projects` with a target service URL
3. **Configure a simulation** at `/simulations` — set method, URL, RPS, duration, concurrency
4. **Start the run** — backend creates a run record, publishes Kafka traffic jobs, workers execute HTTP requests
5. **Monitor live** at `/dashboard` — select the active run, watch realtime metrics and incident timeline
6. **Configure chaos** at `/chaos` — enable fault types or apply a profile (Latency, Network, Failure, Stress)
7. **Open observability** at `/observability` — inspect Prometheus targets and Grafana dashboards
8. **Analyze with AI** at `/ai` or `/ask` — explain runs, investigate incidents, generate executive briefs
9. **Review reports** at `/reports` — open run details, export PDF/JSON/CSV
10. **Decide deployment readiness** using health score, risk score, and deployment readiness engine output

For local smoke testing, use a target you control:

```text
http://localhost:3001/health
```

---

## Architecture

ChaosForge separates **orchestration** (API gateway) from **execution** (Kafka workers). Live dashboard data flows through Redis and WebSockets; durable data persists in MongoDB; observability flows through Prometheus and Grafana; AI analysis layers on top of the Intelligence Engine.

### How It Works (End-to-End)

```mermaid
flowchart TB
    subgraph User["Operator"]
        OP[Browser]
    end

    subgraph Frontend["Next.js Frontend"]
        LP[Landing Page]
        DASH[Dashboard]
        SIM[Simulations]
        CHAOS[Chaos Config]
        AIUI[AI Copilot]
        OBS[Observability]
    end

    subgraph Backend["Control Plane — Express API"]
        AUTH[Auth + Projects]
        TRAFFIC[Traffic Orchestrator]
        WS[Socket.IO]
        IE[Intelligence Engine]
        AIS[AI Service]
    end

    subgraph Data["Data Layer"]
        MG[(MongoDB\nRuns, Projects, Users)]
        RD[(Redis\nLive Metrics, Run State)]
        KF[Kafka\nTraffic Jobs]
    end

    subgraph Workers["Execution Layer"]
        W1[Worker 1]
        W2[Worker N]
    end

    subgraph Monitor["Observability"]
        PM[Prometheus]
        GF[Grafana]
    end

    OP --> LP & DASH & SIM & CHAOS & AIUI & OBS
    DASH <-->|WebSocket| WS
    SIM -->|POST /test/:projectId| TRAFFIC
    TRAFFIC --> MG
    TRAFFIC --> RD
    TRAFFIC --> KF
    KF --> W1 & W2
    W1 & W2 -->|HTTP requests| TARGET[Target Service]
    W1 & W2 --> RD
    WS --> RD
    PM -->|scrape /metrics| Backend
    GF --> PM
    IE --> MG
    AIS --> IE
    AIS --> NV[NVIDIA NIM API]
```

### Data Flow During a Live Simulation

```mermaid
sequenceDiagram
    autonumber
    participant U as Operator
    participant FE as Frontend
    participant API as API Gateway
    participant K as Kafka
    participant W as Worker
    participant R as Redis
    participant M as MongoDB
    participant WS as WebSocket

    U->>FE: Configure & start simulation
    FE->>API: POST /test/:projectId
    API->>M: Create run record
    API->>R: Initialize runtime counters
    API->>K: Publish staged traffic jobs
    K->>W: Consume job batch
    W->>W: Apply chaos injection (optional)
    W->>W: Execute HTTP request to target
    W->>R: Increment metrics (RPS, latency, failures)
    R->>API: Poll / subscribe
    API->>WS: Emit metrics:update
    WS->>FE: Stream live graphs & logs
    W->>K: Ack job complete
    API->>M: Persist run summary on completion
    FE->>FE: Update simulation history table
```

<!-- ### Platform Layer Diagram

<img src="docs/images/architecture.png" alt="ChaosForge architecture diagram" width="900" />

### API Request Flow

<img src="docs/images/api-flow.png" alt="ChaosForge API flow diagram" width="900" /> -->

### System Overview

```mermaid
flowchart TB
    subgraph Client
        FE[Next.js Frontend]
    end

    subgraph ControlPlane["Control Plane (Node.js / Express)"]
        API[Express API Gateway]
        WS[Socket.IO Server]
        IE[Intelligence Engine]
        AI[AI Service Layer]
    end

    subgraph Messaging
        KF[Apache Kafka]
    end

    subgraph Execution
        W1[Worker 1]
        W2[Worker N]
    end

    subgraph Runtime
        RD[(Redis)]
    end

    subgraph Persistence
        MG[(MongoDB)]
    end

    subgraph Observability
        PM[Prometheus]
        GF[Grafana]
    end

    subgraph External
        NV[NVIDIA NIM API]
    end

    FE -->|REST| API
    FE <-->|WebSocket| WS
    API --> KF
    KF --> W1
    KF --> W2
    W1 --> RD
    W2 --> RD
    API --> RD
    API --> MG
    W1 -->|HTTP traffic| Target[Target Service]
    W2 -->|HTTP traffic| Target
    PM -->|scrape /metrics| API
    GF --> PM
    FE --> GF
    FE --> PM
    API --> IE
    AI --> IE
    AI --> NV
    IE --> MG
    WS --> RD
```

### Simulation Flow

```mermaid
sequenceDiagram
    participant U as Operator
    participant FE as Frontend
    participant API as API Gateway
    participant K as Kafka
    participant W as Worker
    participant R as Redis
    participant M as MongoDB

    U->>FE: Start simulation
    FE->>API: POST /projects/:id/traffic
    API->>M: Create run record
    API->>R: Initialize runtime state
    API->>K: Publish traffic jobs
    K->>W: Consume job
    W->>W: Apply chaos injection
    W->>W: Execute HTTP request
    W->>R: Update metrics counters
    API->>FE: WebSocket metrics update
    W->>K: Job complete
    API->>M: Persist run summary
```

### AI Flow

```mermaid
flowchart LR
    REQ[AI Request] --> ROUTER[AI Router]
    ROUTER -->|fast skill| SUPER[Nemotron Super]
    ROUTER -->|deep skill| ULTRA[Nemotron Ultra]
    ROUTER -->|fallback| LLAMA[Llama 3.3 70B]
    REQ --> CTX[Context Builder]
    CTX --> COMP[Context Compressor]
    COMP --> PROMPT[Prompt Builder]
    PROMPT --> SKILL[Skill Instruction]
    SKILL --> PROV[NVIDIA Provider]
    PROV --> FMT[Response Formatter]
    FMT --> CACHE[Response Cache]
    FMT --> RESP[Structured Response]
```

### Chaos Flow

```mermaid
flowchart TD
    START[Worker receives job] --> LOAD[Load chaos config from MongoDB]
    LOAD --> PL{Packet Loss?}
    PL -->|inject| ERR1[Throw PACKET_LOSS]
    PL --> CR{Connection Reset?}
    CR -->|inject| ERR2[Throw ECONNRESET]
    CR --> FAIL{HTTP Failure?}
    FAIL -->|inject| ERR3[Throw status code error]
    FAIL --> LAT{Latency?}
    LAT -->|inject| DELAY[Apply random delay]
    LAT --> TO{Timeout?}
    TO -->|inject| ERR4[Abort request]
    TO --> EXEC[Execute HTTP request]
    DELAY --> EXEC
    EXEC --> METRICS[Record chaos metrics in Redis]
```

### Intelligence Flow

```mermaid
flowchart TB
    RUN[Completed / Active Run] --> NORM[Normalize Metrics]
    NORM --> HEALTH[Health Engine]
    NORM --> RISK[Risk Engine]
    NORM --> RC[Root Cause Engine]
    NORM --> REC[Recommendation Engine]
    NORM --> TREND[Trend Engine]
    NORM --> DEPLOY[Deployment Readiness]
    NORM --> OPS[Operational Insights]
    NORM --> EXEC[Executive Summary]
    NORM --> INFRA[Infrastructure Health]
    NORM --> RES[Resilience Engine]
    NORM --> MEM[Infrastructure Memory]
    HEALTH & RISK & RC & REC --> INTEL[Unified Intelligence Payload]
    INTEL --> WS[WebSocket intelligence:update]
    INTEL --> REPORT[Report Builder]
    INTEL --> AICTX[AI Context Builder]
```

### WebSocket Flow

```mermaid
flowchart LR
    W[Workers / API] --> R[(Redis)]
    API --> SIO[Socket.IO]
    R --> API
    SIO -->|run metrics| FE[Dashboard]
    SIO -->|logs-projectId-runId| FE
    SIO -->|incident-timeline| FE
    SIO -->|infrastructure-alerts| FE
    SIO -->|ai-insights| FE
    SIO -->|system-health| FE
    SIO -->|intelligence:update| FE
```

### Report Flow

```mermaid
flowchart LR
    RUN[Run + Metrics] --> IE[Intelligence Engine]
    IE --> RB[Report Builder]
    RB --> PDF[PDF via PDFKit]
    RB --> JSON[JSON Export]
    RB --> CSV[CSV Export]
    AI[AI Report Generator] --> RB
    RB --> FE[Reports UI]
```

---

## Technology Stack

### Frontend

| Category | Technology |
|----------|------------|
| Framework | Next.js 16.2, React 19.2 |
| Styling | Tailwind CSS 4, tw-animate-css |
| UI | Radix UI, shadcn, class-variance-authority |
| Charts | Recharts |
| Animation | Framer Motion |
| Icons | Lucide React, Phosphor Icons |
| Realtime | socket.io-client |
| Theming | next-themes (dark default) |
| Export | html2canvas |

### Backend

| Category | Technology |
|----------|------------|
| Runtime | Node.js 20.x |
| Framework | Express 5 |
| Auth | JWT, bcrypt |
| Realtime | Socket.IO |
| Logging | Winston |
| PDF | PDFKit |
| Rate limiting | express-rate-limit |
| Concurrency | p-limit |

### Database & Cache

| Service | Role |
|---------|------|
| MongoDB 7 | Users, projects, runs, chaos config, settings, AI conversations |
| Redis 7 | Active run state, metrics counters, latency samples, log queues, worker heartbeats |

### Messaging

| Service | Role |
|---------|------|
| Apache Kafka | Traffic job queue between API and workers |
| KafkaJS | Producer/consumer client |

### Monitoring

| Service | Role |
|---------|------|
| Prometheus | Scrapes `/metrics`, stores time-series |
| Grafana | Provisioned dashboards, embedded in UI |
| prom-client | Application-level metrics |

### AI

| Service | Role |
|---------|------|
| NVIDIA NIM (integrate.api.nvidia.com) | Primary LLM provider |
| OpenAI SDK | HTTP client for NVIDIA-compatible API |

### Infrastructure

| Tool | Role |
|------|------|
| Docker | Container images for backend, frontend, workers |
| Docker Compose | Local full-stack orchestration |
| Stripe | Subscription billing |
| Nodemailer | Email notifications |

---

## Folder Structure

```text
ChaosForge/
├── backend/                    # Node.js API + worker processes
│   ├── src/
│   │   ├── config/             # DB, Redis, Kafka, env loading
│   │   ├── consumers/          # Kafka traffic consumer
│   │   ├── control/            # Control socket (JWT auth)
│   │   ├── metrics/            # Prometheus + Redis metrics store
│   │   ├── middleware/         # Auth, ownership, request ID, plans
│   │   ├── modules/            # Domain modules (see Project Structure)
│   │   ├── routes/             # Health, metrics, incidents, test routes
│   │   ├── services/           # Traffic, health, producer, heartbeat
│   │   ├── websocket/          # Socket.IO server + event constants
│   │   ├── server.js           # API entry point
│   │   └── worker.js           # Worker entry point
│   └── Dockerfile
├── frontend/                   # Next.js application
│   ├── src/
│   │   ├── app/                # App Router pages
│   │   ├── components/         # UI components by domain
│   │   ├── hooks/              # Data fetching + WebSocket hooks
│   │   ├── lib/                # API client, auth, utilities
│   │   ├── data/               # Landing page static data
│   │   └── styles/             # Global CSS
│   └── Dockerfile
├── monitoring/                 # Prometheus + Grafana config
│   ├── prometheus.yml          # Scrape config template
│   └── grafana/
│       ├── dashboards/         # Versioned dashboard JSON
│       └── provisioning/       # Datasource + dashboard provisioning
├── docs/
│   └── images/                 # README screenshots
├── scripts/
│   └── capture-readme-screenshots.mjs
└── docker-compose.yml          # Full local stack
```

---

## AI Platform

ChaosForge includes a modular AI layer under `backend/src/modules/ai/` that combines deterministic intelligence with NVIDIA LLM reasoning.

### Architecture Components

| Component | Purpose |
|-----------|---------|
| **Intelligence Engine** | Deterministic analysis (health, risk, root cause) — feeds AI context |
| **Context Builder** | Assembles run, dashboard, incident, and chat context per skill |
| **Context Compressor** | Truncates context to fit model token budgets |
| **Prompt Builder** | Combines system, developer, instruction, and context templates |
| **Skill Registry** | 14 registered skills with dedicated instruction builders |
| **AI Router** | Routes skills to Nemotron Super (fast) or Ultra (deep) with fallback chain |
| **Provider Factory** | NVIDIA provider with OpenAI-compatible API |
| **Conversation Layer** | Persistent chat sessions in MongoDB |
| **Response Formatter** | Merges LLM output with intelligence engine data |
| **AI Cache** | Prompt hash + response caching with hit/miss metrics |

### Supported Models

| Key | Model | Speed | Use case |
|-----|-------|-------|------------|
| `ultra` | Nemotron Ultra 550B | Slow | Deep reasoning, incidents, executive briefs |
| `super` | Nemotron Super 120B | Fast | Explain run/dashboard, comparisons, chat |
| `llama70b` | Llama 3.3 70B | Fast | Fallback |
| `llama405b` | Llama 3.1 405B | Medium | Complex reasoning alternative |
| `mistralNemo` | Mistral Nemo 12B | Fastest | Lightweight Q&A |
| `phi35` | Phi-3.5 Mini | Fastest | Low-latency chat |
| `deepseekR1` | DeepSeek R1 | Medium | Chain-of-thought reasoning |
| `qwen25` | Qwen 2.5 72B | Fast | General analysis |

### AI Modes

| Mode | Behavior |
|------|----------|
| **Automatic** | Route by skill — fast skills → Super, deep skills → Ultra |
| **Fast** | Always Nemotron Super |
| **Balanced** | Skill-aware routing |
| **Deep** | Always Nemotron Ultra with reasoning budget |
| **Custom** | User-selected model for all skills |

### AI Skills (14)

| Skill | Category | Endpoint |
|-------|----------|----------|
| Explain Run | Fast | `POST /api/ai/explain/run` |
| Explain Dashboard | Fast | `POST /api/ai/explain/dashboard` |
| Explain Report | Fast | `POST /api/ai/explain/report` |
| Compare Runs | Fast | `POST /api/ai/compare` |
| Ask ChaosForge | Fast | `POST /api/ai/chat/:id/messages` |
| Incident Investigator | Deep | `POST /api/ai/incident/investigate` |
| Executive Brief | Deep | `POST /api/ai/executive-brief` |
| Optimization Advisor | Deep | `POST /api/ai/optimize` |
| Chaos Advisor | Deep | `POST /api/ai/chaos/advise` |
| Capacity Planner | Deep | `POST /api/ai/capacity` |
| Runbook Generator | Deep | `POST /api/ai/runbook` |
| Postmortem | Deep | `POST /api/ai/postmortem` |
| AI Report Generator | Deep | `POST /api/ai/report/generate` |
| Weekly Review | Deep | `POST /api/ai/weekly-review` |

Streaming is available via `POST /api/ai/stream`.

---

## Chaos Engineering

Chaos faults are applied in the worker execution path (`chaos.engine.js`) before HTTP requests complete.

### Fault Types

| Fault | Behavior |
|-------|----------|
| **Latency** | Random delay between configured min/max ms |
| **Timeout** | Abort request at configured duration |
| **HTTP Failure** | Inject random status code from configured list (e.g. 500) |
| **Packet Loss** | Throw `PACKET_LOSS` error |
| **Connection Reset** | Throw `ECONNRESET` error |

All faults use **percentage-based injection** — a random roll determines whether the fault applies to each request.

### Chaos Profiles

| Profile | Configuration |
|---------|---------------|
| **Custom** | Manual per-fault settings |
| **Latency** | 200–1000ms delay at 50% rate |
| **Failure** | 30% HTTP 500 failure rate |
| **Network** | 20% packet loss + 5s timeouts |
| **Stress** | Combined latency, failure, timeout, and packet loss |

### API

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/chaos/:projectId` | Get chaos configuration |
| `PATCH` | `/chaos/:projectId` | Update chaos settings |
| `POST` | `/chaos/:projectId/reset` | Reset to defaults |
| `POST` | `/chaos/:projectId/profile` | Apply named profile |

Chaos metrics (injected count, success/failure, resilience rate) feed into the Intelligence Engine and reports.

---

## Intelligence Engine

The Intelligence Engine (`backend/src/modules/intelligence/`) produces deterministic operational analysis from run metrics — independent of LLM calls. AI skills consume this data as structured context.

### Engines

| Engine | Output |
|--------|--------|
| **Health** | Composite health score (0–100), grade (A–D), status |
| **Risk** | Predictive risk level with contributing factors |
| **Root Cause** | Correlated failure/latency/chaos signals |
| **Recommendations** | Priority remediation actions |
| **Trend** | Historical trend and comparison analysis |
| **Deployment Readiness** | Availability, reliability, performance, resilience, observability scores |
| **Operational Insights** | Actionable operational observations |
| **Executive** | Executive brief and summary |
| **Infrastructure Health** | Platform component health assessment |
| **Resilience** | Chaos resilience scoring |
| **Memory** | Infrastructure memory from historical runs |

### Health Score Formula

Starting score: **100**. Deductions based on:

- Failure rate thresholds (>0%, >5%, >10%, >20%)
- Average latency thresholds (>500ms, >1000ms, >2000ms)
- P95 latency thresholds (>1000ms, >2000ms, >3000ms)
- Error type diversity (up to -20)

Status: **excellent** ≥90 · **good** ≥75 · **warning** ≥50 · **critical** <50

See `backend/src/modules/intelligence/FORMULA.md` for the canonical formula.

### API

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/intelligence/:projectId/:runId` | Full intelligence payload |

Intelligence updates stream via WebSocket event `intelligence:update`.

---

## Reports

Reports combine run metrics, intelligence engine output, incident timeline, and optional AI appendix.

### Export Formats

| Format | Endpoint | Contents |
|--------|----------|----------|
| **PDF** | `GET /report/pdf/:projectId/:runId` | Executive layout with charts and intelligence sections |
| **JSON** | `GET /report/json/:projectId/:runId` | Full structured report data |
| **CSV** | `GET /report/csv/:projectId/:runId` | Tabular metrics export |

### Report Sections

- Executive Brief
- Health Score
- Predictive Risk
- Root Cause Analysis
- Recommendations
- Deployment Readiness
- Chaos Summary
- Incident Timeline
- Infrastructure Memory
- Operational Insights
- AI Appendix (when generated)

---

## API Documentation

Base URL: `http://localhost:3001`

All authenticated routes require `Authorization: Bearer <token>`.

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/auth/signup` | Register new user |
| `POST` | `/auth/login` | Login, returns JWT |
| `GET` | `/auth/me` | Current user profile |
| `PATCH` | `/auth/change-password` | Change password |

### Projects

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/projects` | Create project |
| `GET` | `/projects` | List projects |
| `GET` | `/projects/:id` | Get project |
| `PATCH` | `/projects/:id` | Update project |
| `DELETE` | `/projects/:id` | Delete project |
| `POST` | `/projects/:id/traffic` | Start simulation |

### Runs

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/runs/:projectId` | List runs for project |
| `GET` | `/runs/details/:runId` | Run details |
| `GET` | `/runs/compare?runA=&runB=` | Compare two runs |

### Chaos

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/chaos/:projectId` | Get chaos config |
| `PATCH` | `/chaos/:projectId` | Update chaos config |
| `POST` | `/chaos/:projectId/reset` | Reset chaos |
| `POST` | `/chaos/:projectId/profile` | Apply profile |

### Dashboard & Metrics

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | System health + incident timeline |
| `POST` | `/health/wake` | Wake Grafana + Prometheus |
| `GET` | `/metrics` | Prometheus metrics |
| `GET` | `/metrics/:projectId` | Project-scoped metrics |

### AI

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/ai/models` | List available models |
| `GET` | `/api/ai/status` | Provider configuration status |
| `GET` | `/api/ai/route` | Skill routing table |
| `GET` | `/api/ai/metrics` | AI request/cache metrics |
| `POST` | `/api/ai/stream` | Stream any skill response |
| `POST` | `/api/ai/explain/run` | Explain a simulation run |
| `POST` | `/api/ai/explain/dashboard` | Explain dashboard state |
| `POST` | `/api/ai/compare` | Compare runs with AI |
| `POST` | `/api/ai/incident/investigate` | Investigate incident |
| `POST` | `/api/ai/executive-brief` | Generate executive brief |
| `POST` | `/api/ai/chaos/advise` | Chaos experiment advisor |
| `POST` | `/api/ai/capacity` | Capacity planning |
| `POST` | `/api/ai/runbook` | Generate runbook |
| `POST` | `/api/ai/postmortem` | Generate postmortem |
| `POST` | `/api/ai/report/generate` | AI report generation |
| `POST` | `/api/ai/weekly-review` | Weekly infrastructure review |
| `GET/POST/PATCH/DELETE` | `/api/ai/chat/*` | Conversation management |
| `GET` | `/api/ai/:projectId/:runId` | Legacy AI analysis |

### Intelligence & Memory

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/intelligence/:projectId/:runId` | Full intelligence payload |
| `GET` | `/api/memory/:projectId` | Infrastructure memory |
| `POST` | `/api/memory/test` | Test memory generation |

### Reports

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/report/pdf/:projectId/:runId` | Download PDF |
| `GET` | `/report/json/:projectId/:runId` | Download JSON |
| `GET` | `/report/csv/:projectId/:runId` | Download CSV |

### Settings

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/settings` | Get user settings |
| `PATCH` | `/settings` | Update settings |
| `POST` | `/settings/reset` | Reset to defaults |

### Incidents

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/incidents` | All incidents |
| `GET` | `/api/incidents/:runId` | Run incidents |

### Billing & Usage

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/payment/checkout` | Stripe checkout |
| `GET` | `/payment/history` | Payment history |
| `GET` | `/usage/me` | Current usage |

Interactive API docs are also available at `/docs/api` in the frontend.

---

## Installation

### Prerequisites

- **Node.js 20+**
- **Docker Desktop**
- **npm**
- **Git**

### 1. Clone the repository

```bash
git clone https://github.com/yashuyouwaraj/ChaosForge.git
cd ChaosForge
```

### 2. Install dependencies

```bash
cd backend && npm install
cd ../frontend && npm install
```

### 3. Configure environment

Create `backend/.env` (or `backend/.env.development`):

```env
NODE_ENV=development
PORT=3001
JWT_SECRET=replace-with-a-local-secret

FRONTEND_URL=http://localhost:3000
CORS_ORIGIN=http://localhost:3000

MONGO_URI=mongodb://localhost:27017/chaosforge
REDIS_URL=redis://localhost:6379

USE_KAFKA=true
KAFKA_BROKER=localhost:29092
KAFKA_TOPIC_REPLICATION_FACTOR=1
KAFKA_TRAFFIC_TOPIC_PARTITIONS=6

PROMETHEUS_BASE_URL=http://localhost:9090
PROMETHEUS_HEALTH_URL=http://localhost:9090/-/healthy

GRAFANA_URL=http://localhost:5000
GRAFANA_WAKE_URL=http://localhost:5000
GRAFANA_HEALTH_URL=http://localhost:5000/api/health

# Optional — NVIDIA AI
AI_PROVIDER=nvidia
AI_MODEL=automatic
NVIDIA_API_KEY=your-nvidia-api-key
NVIDIA_BASE_URL=https://integrate.api.nvidia.com/v1
```

Create `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
NEXT_PUBLIC_GRAFANA_URL=http://localhost:5000
NEXT_PUBLIC_GRAFANA_WAKE_URL=http://localhost:5000
NEXT_PUBLIC_PROMETHEUS_URL=http://localhost:9090
```

### 4. Start infrastructure

```bash
docker compose up -d redis kafka mongo prometheus grafana
```

Wait ~15 seconds for Kafka to become ready.

---

## Running Locally

### Hybrid mode (recommended for development)

**Terminal 1 — API server:**

```bash
cd backend
npm run dev:server
```

**Terminal 2 — Worker:**

```bash
cd backend
npm run dev:worker
```

**Terminal 3 — Frontend:**

```bash
cd frontend
npm run dev
```

**Or run API + worker together:**

```bash
cd backend
npm run dev
```

### Expected URLs

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend health | http://localhost:3001/health |
| Backend metrics | http://localhost:3001/metrics |
| Prometheus | http://localhost:9090 |
| Grafana | http://localhost:5000 |

### Health checks

```bash
curl http://localhost:3001/health
curl http://localhost:9090/-/healthy
curl http://localhost:5000/api/health
```

### Running a simulation

1. Sign in or create an account
2. Create a project with a target URL
3. Open Simulations or Dashboard
4. Configure RPS, duration, concurrency
5. Start the run
6. Ensure at least one worker is running before launching Kafka-backed simulations

---

## Environment Variables

<details>
<summary><strong>Backend — Required</strong></summary>

| Variable | Description | Example |
|----------|-------------|---------|
| `JWT_SECRET` | JWT signing secret | `your-local-secret` |
| `MONGO_URI` | MongoDB connection string | `mongodb://localhost:27017/chaosforge` |
| `REDIS_URL` | Redis connection URL | `redis://localhost:6379` |

</details>

<details>
<summary><strong>Backend — Kafka</strong></summary>

| Variable | Default | Description |
|----------|---------|-------------|
| `USE_KAFKA` | — | Enable Kafka traffic pipeline (`true` / `false`) |
| `KAFKA_BROKER` | `localhost:9092` | Broker address (`localhost:29092` for host dev) |
| `KAFKA_TRAFFIC_TOPIC_PARTITIONS` | `6` | Traffic topic partitions |
| `KAFKA_TOPIC_REPLICATION_FACTOR` | `1` | Topic replication factor |
| `KAFKA_USERNAME` | — | Confluent Cloud API key (optional) |
| `KAFKA_PASSWORD` | — | Confluent Cloud API secret (optional) |

</details>

<details>
<summary><strong>Backend — Observability</strong></summary>

| Variable | Default | Description |
|----------|---------|-------------|
| `PROMETHEUS_BASE_URL` | — | Prometheus base URL |
| `PROMETHEUS_HEALTH_URL` | — | Prometheus health endpoint |
| `PROMETHEUS_WAKE_URL` | — | URL to wake Prometheus |
| `PROMETHEUS_WAKE_TIMEOUT_MS` | `30000` | Wake timeout |
| `GRAFANA_URL` | — | Grafana base URL |
| `GRAFANA_HEALTH_URL` | — | Grafana health endpoint |
| `GRAFANA_WAKE_URL` | — | URL to wake Grafana |
| `GRAFANA_WAKE_TIMEOUT_MS` | `30000` | Wake timeout |

</details>

<details>
<summary><strong>Backend — AI (NVIDIA)</strong></summary>

| Variable | Default | Description |
|----------|---------|-------------|
| `AI_PROVIDER` | `nvidia` | AI provider identifier |
| `AI_MODEL` | `ultra` | Default model key |
| `NVIDIA_API_KEY` | — | NVIDIA API key (required for AI features) |
| `NVIDIA_BASE_URL` | `https://integrate.api.nvidia.com/v1` | NVIDIA API base URL |

</details>

<details>
<summary><strong>Backend — Workers</strong></summary>

| Variable | Default | Description |
|----------|---------|-------------|
| `WORKER_HEALTH_PORT` | — | Worker health HTTP port |
| `WORKER_EXPECTED_COUNT` | `1` | Expected workers before simulation start |
| `WORKER_READY_TIMEOUT_MS` | `180000` | Worker readiness timeout |
| `WORKER_READY_POLL_MS` | `3000` | Readiness poll interval |
| `WORKER_HEARTBEAT_INTERVAL_MS` | `5000` | Heartbeat write interval |
| `WORKER_HEARTBEAT_TTL_MS` | `15000` | Heartbeat TTL in Redis |
| `WORKER_COUNT` | `1` | Workers recorded in run snapshot |

</details>

<details>
<summary><strong>Backend — Email & Billing (Optional)</strong></summary>

| Variable | Description |
|----------|-------------|
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM` | Email delivery |
| `WEEKLY_REPORT_CRON` | Cron schedule for weekly reports |
| `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` | Stripe billing |
| `STRIPE_SUCCESS_URL`, `STRIPE_CANCEL_URL` | Checkout redirect URLs |

</details>

<details>
<summary><strong>Frontend</strong></summary>

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_API_URL` | Backend REST API URL |
| `NEXT_PUBLIC_SOCKET_URL` | Socket.IO server URL |
| `NEXT_PUBLIC_GRAFANA_URL` | Grafana embed URL |
| `NEXT_PUBLIC_GRAFANA_WAKE_URL` | Grafana wake URL |
| `NEXT_PUBLIC_PROMETHEUS_URL` | Prometheus embed URL |

</details>

<details>
<summary><strong>Docker Compose (Prometheus scrape target)</strong></summary>

| Variable | Default | Description |
|----------|---------|-------------|
| `PROMETHEUS_BACKEND_SCHEME` | `http` | Backend scrape scheme |
| `PROMETHEUS_BACKEND_TARGET` | `host.docker.internal:3001` | Backend scrape target |

</details>

---

## Docker

### Services

| Service | Image | Port | Profile |
|---------|-------|------|---------|
| `backend` | Built from `./backend` | 3001 | `app` |
| `worker` | Built from `./backend` | — | `app` |
| `frontend` | Built from `./frontend` | 3000 | `app` |
| `redis` | redis:7 | 6379 | default |
| `kafka` | apache/kafka:latest | 9092, 29092 | default |
| `mongo` | mongo:7 | 27017 | default |
| `prometheus` | prom/prometheus | 9090 | default |
| `grafana` | grafana/grafana | 5000 | default |

### Commands

**Infrastructure only (hybrid dev):**

```bash
docker compose up -d redis kafka mongo prometheus grafana
```

**Full stack:**

```bash
docker compose --profile app up --build
```

**Reset:**

```bash
docker compose down
docker compose up -d redis kafka mongo prometheus grafana
```

**Clear volumes (destructive):**

```bash
docker compose down -v
```

### Volumes

- `mongo-data` — MongoDB persistence
- `redis-data` — Redis persistence
- `prometheus-data` — Metrics time-series
- `grafana-data` — Grafana state

### Kafka networking

| Context | Broker address |
|---------|------------------|
| Host-based backend/worker | `localhost:29092` |
| Docker Compose services | `kafka:9092` |

---

## Project Structure

### Backend Modules

| Module | Responsibility |
|--------|----------------|
| `auth` | Signup, login, JWT, password change |
| `project` | Project CRUD, simulation launch |
| `run` | Run history, details, comparison, snapshots |
| `chaos` | Chaos config CRUD, profiles, validation |
| `intelligence` | 11 analysis engines, unified intelligence service |
| `memory` | Infrastructure memory generation and retrieval |
| `ai` | NVIDIA provider, skills, router, cache, conversations |
| `report` | PDF/JSON/CSV report builder |
| `settings` | User preferences (appearance, simulation, AI, notifications) |
| `notification` | Email templates, scheduler, delivery |
| `payment` | Stripe checkout, webhooks, plan upgrades |
| `usage` | Plan usage tracking |
| `user` | User model and plan fields |

### Backend Services

| Service | Responsibility |
|---------|----------------|
| `traffic.service` | Simulation orchestration, Kafka publishing |
| `execution.engine` | HTTP request execution with retries |
| `producer.service` | Kafka message production |
| `health.service` | System health aggregation |
| `worker-heartbeat.service` | Worker liveness in Redis |
| `worker-readiness.service` | Pre-simulation worker checks |
| `incidentTimeline` | In-memory incident event store |
| `analysisEngine` | Legacy analysis hooks |

### Frontend Pages

| Route | Purpose |
|-------|---------|
| `/` | Marketing landing page |
| `/login`, `/signup` | Authentication |
| `/dashboard` | Realtime operations dashboard |
| `/projects` | Project management |
| `/simulations` | Simulation controls and history |
| `/chaos` | Chaos engineering configuration |
| `/infrastructure` | Infrastructure health overview |
| `/observability` | Grafana + Prometheus workspace |
| `/ai` | AI Insights workspace |
| `/ask` | Ask ChaosForge conversational copilot |
| `/reports` | Report list and exports |
| `/reports/[runId]` | Run report detail |
| `/settings` | User settings |
| `/billing` | Subscription and usage |
| `/docs`, `/docs/api` | Documentation pages |

---

## Design Decisions

### Why Kafka?

Kafka decouples simulation scheduling from request execution. The API decides *what* work should happen; workers execute traffic independently. This keeps the API process from becoming a bottleneck and makes worker count a deployment concern rather than a frontend concern.

### Why Redis?

Redis stores fast-moving runtime data: active run state, metrics counters, latency samples, log queues, pause/resume controls, and WebSocket buffering. MongoDB is reserved for durable entities — writing every telemetry event to MongoDB would turn it into a telemetry sink.

### Why MongoDB?

MongoDB holds durable application data: users, projects, completed run summaries, chaos configuration, settings, and AI conversations. It is intentionally not used for high-volume per-request telemetry.

### Why WebSockets?

WebSockets provide low-latency dashboard updates for metrics, logs, incidents, and intelligence — scoped to active runs and project context. This avoids constant polling during active simulations.

### Why the Intelligence Engine?

Deterministic engines produce consistent, explainable health/risk/root-cause scores that do not depend on LLM availability. AI skills consume this structured data as context, combining rule-based analysis with natural language explanation.

### Why the AI Layer?

LLMs excel at explaining complex operational data, generating runbooks, and answering ad-hoc questions. The AI layer sits on top of the Intelligence Engine — it does not replace deterministic scoring.

### Why NVIDIA?

NVIDIA NIM provides OpenAI-compatible access to Nemotron and open models with streaming, structured output, and reasoning budget support — routed automatically by skill type.

### Why Prometheus + Grafana?

Load-testing systems need observability of the *tester itself*, not only the target service. Prometheus scrapes application metrics; Grafana provides operational dashboards provisioned as versioned JSON.

---

## Innovations

| Innovation | Description |
|------------|-------------|
| **Unified Intelligence Engine** | 11 deterministic engines produce a single intelligence payload per run |
| **Infrastructure Memory** | Historical pattern recognition across runs for recurring failure modes |
| **AI + Intelligence Integration** | LLM skills consume compressed intelligence context, not raw metrics |
| **Chaos + Load Integration** | Fault injection during active traffic execution, not as a separate tool |
| **Skill-based AI Router** | Automatic Nemotron Super/Ultra routing by skill category with fallback chain |
| **Deployment Readiness Scoring** | Multi-dimensional release confidence signal |
| **Kafka Worker Architecture** | Explicit orchestration/execution boundary with heartbeat readiness |
| **Embedded Observability** | Grafana and Prometheus panels inside the application workspace |
| **Configuration Snapshots** | Run records capture full simulation + chaos configuration for comparison |
| **Real-time Intelligence Streaming** | Intelligence updates pushed via WebSocket during active analysis |

---

## Performance

| Optimization | Implementation |
|--------------|----------------|
| **Redis caching** | Live metrics, run state, worker heartbeats |
| **Bounded samples** | Latency/timestamp samples capped to prevent unbounded memory |
| **TTL runtime keys** | Temporary run data expires automatically |
| **Buffered log emission** | WebSocket log batching reduces event noise |
| **AI response cache** | Prompt hash caching with hit/miss metrics |
| **Context compression** | Token budget management before LLM calls |
| **Kafka partitioning** | 6 default partitions for parallel worker consumption |
| **Streaming AI** | Token-by-token delivery for copilot UX |
| **Lazy frontend loading** | Next.js App Router with component-level data hooks |
| **Prometheus aggregation** | Application + Redis-backed simulation metrics on `/metrics` |

### Known bottlenecks

- Kafka startup readiness on cold Docker start
- Redis write pressure during high-frequency metrics updates
- WebSocket fanout with many clients on the same run
- Worker count is manually scaled (no autoscaling yet)

---

## Roadmap

### Completed

- [x] Distributed load testing with Kafka workers
- [x] Redis runtime state and live metrics
- [x] WebSocket realtime dashboard
- [x] Chaos engineering (5 fault types, 5 profiles)
- [x] Intelligence Engine (11 engines)
- [x] AI Copilot with NVIDIA NIM (14 skills, 8 models)
- [x] Ask ChaosForge conversational workspace
- [x] PDF / JSON / CSV report export
- [x] Run comparison and configuration snapshots
- [x] Prometheus + Grafana integration
- [x] Grafana dashboard provisioning (versioned JSON)
- [x] Infrastructure memory
- [x] Deployment readiness scoring
- [x] Email notifications and weekly report scheduler
- [x] Stripe billing integration
- [x] Marketing landing page
- [x] Settings with AI model preferences

### In Progress

- [ ] Automated integration test suite (Kafka + Redis + MongoDB + workers)
- [ ] CI pipeline (lint, build, Docker validation, smoke tests)

### Future

- [ ] Kubernetes deployment manifests
- [ ] Helm charts
- [ ] Terraform infrastructure modules
- [ ] Multi-region worker deployment
- [ ] Autoscaling based on Kafka lag and worker heartbeats
- [ ] Dead-letter queue for malformed Kafka messages
- [ ] Idempotency keys for simulation start
- [ ] Richer historical trace persistence outside Redis TTL

---

## Contributing

Contributions are welcome. Please follow these guidelines:

1. **Fork** the repository and create a feature branch from `main`
2. **Match conventions** — read surrounding code before adding new modules
3. **Keep scope focused** — one feature or fix per pull request
4. **Test locally** — verify backend, worker, and frontend start cleanly
5. **Document API changes** — update `/docs/api` page if adding endpoints
6. **No secrets** — never commit `.env` files, API keys, or credentials

### Development setup

```bash
docker compose up -d redis kafka mongo prometheus grafana
cd backend && npm run dev
cd frontend && npm run dev
```

### Areas for contribution

- New AI skills and prompt templates
- Intelligence engine improvements
- Worker execution optimizations
- Integration tests
- Kubernetes / Helm deployment configs

---

## License

This project is licensed under the **ISC License**. See [backend/package.json](backend/package.json).

---

## Author

**Yashu Youwaraj**

Built ChaosForge as a portfolio-grade distributed infrastructure platform demonstrating Kafka worker orchestration, chaos engineering, operational intelligence, and NVIDIA AI integration.

| | |
|---|---|
| **GitHub** | [github.com/yashuyouwaraj](https://github.com/yashuyouwaraj) |
| **Project** | [github.com/yashuyouwaraj/ChaosForge](https://github.com/yashuyouwaraj/ChaosForge) |
| **LinkedIn** | [linkedin.com/in/yashu-youwaraj](https://www.linkedin.com/in/yashu-youwaraj/) |
| **Portfolio** | [yashuyouwaraj.vercel.app](https://yashuyouwaraj.vercel.app/) |
| **Email** | yashuyouwaraj123@gmail.com |

---

<div align="center">

**ChaosForge** — Simulate traffic. Inject chaos. Deploy with confidence.

</div>
