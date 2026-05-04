# 🕷️ WebCrawler

[![CI](https://github.com/Helenyixuanwang/webcrawler/actions/workflows/ci.yml/badge.svg)](https://github.com/Helenyixuanwang/webcrawler/actions/workflows/ci.yml)

A full-stack web crawler built with **FastAPI**, **Celery**, **PostgreSQL**, and **Redis** — deployed on **Railway** and **Vercel**, with **Kubernetes** support.

## 🌐 Live Demo
- **Frontend**: https://webcrawler-liart.vercel.app
- **Backend API**: https://backend-production-dd8b.up.railway.app/docs

## 🔄 CI/CD Pipeline
git push origin main
→ GitHub Actions: FastAPI syntax check + pip install (parallel with frontend)
→ GitHub Actions: React Vite build (parallel with backend)
→ if both ✅ → Railway auto-deploys backend
→ if both ✅ → Railway auto-deploys worker

## Features
- 🔍 **BFS Crawling** — crawl all reachable pages from a seed URL up to configurable depth
- 📄 **Content Extraction** — title, meta description, clean text, outbound link count
- 🔄 **Change Monitoring** — SHA-256 content hashing to detect page changes across crawls
- ⏱️ **Scheduled Re-crawls** — automatically re-crawl URLs on a set interval via Celery Beat
- 📊 **Real-time Dashboard** — React UI with live job status, crawled pages viewer, changes tab
- ⚡ **Async Job Queue** — Celery workers process crawl jobs in the background

## Tech Stack
| Layer | Technology |
|---|---|
| Frontend | React + Vite + Axios |
| API | FastAPI + Uvicorn |
| Task Queue | Celery + Redis |
| Scheduler | Celery Beat |
| Database | PostgreSQL + SQLAlchemy |
| Crawler | httpx + BeautifulSoup4 |
| Container | Docker + Docker Compose |
| Orchestration | Kubernetes + HPA |
| Deployment | Railway (backend) + Vercel (frontend) |
| CI/CD | GitHub Actions + Railway auto-deploy |


## Project Structure
webcrawler/
├── backend/
│   ├── app/
│   │   ├── api/         # FastAPI route handlers
│   │   ├── core/        # Config, DB, Celery setup
│   │   ├── models/      # SQLAlchemy ORM models
│   │   ├── schemas/     # Pydantic request/response schemas
│   │   ├── services/    # Crawler logic (httpx + BeautifulSoup)
│   │   ├── workers/     # Celery tasks
│   │   └── main.py      # App entrypoint
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/  # Navbar, JobForm, JobTable, PageTable
│   │   ├── pages/       # JobListPage, JobDetailPage
│   │   └── api.js       # Axios API client
│   └── package.json
├── k8s/                 # Kubernetes manifests
│   ├── api.yaml
│   ├── worker.yaml      # Includes HorizontalPodAutoscaler
│   ├── flower.yaml
│   ├── postgres.yaml
│   └── redis.yaml
└── docker-compose.yml
## Quick Start (Local)

### Prerequisites
- Docker + Docker Compose
- Node.js 18+

### Run backend
```bash
cp backend/.env.example backend/.env
docker compose up --build
```

### Run frontend
```bash
cd frontend
npm install
npm run dev
```

- API: http://localhost:8000
- Swagger UI: http://localhost:8000/docs
- Flower: http://localhost:5555
- Dashboard: http://localhost:5173

## Kubernetes Deployment

### Prerequisites
- Minikube
- kubectl

### Deploy
```bash
minikube start
eval $(minikube docker-env)
docker build -t webcrawler-api:latest ./backend
kubectl apply -f k8s/redis.yaml
kubectl apply -f k8s/postgres.yaml
kubectl apply -f k8s/api.yaml
kubectl apply -f k8s/worker.yaml
kubectl apply -f k8s/flower.yaml
minikube service api --url
minikube service flower --url
```

The worker deployment includes a **HorizontalPodAutoscaler** that scales from 2 to 10 pods based on CPU usage.

## API Endpoints
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/v1/jobs/` | Submit a new crawl job |
| GET | `/api/v1/jobs/` | List all jobs |
| GET | `/api/v1/jobs/{id}` | Get job status |
| DELETE | `/api/v1/jobs/{id}` | Delete a job |
| GET | `/api/v1/jobs/{id}/pages` | Get crawled pages |
| GET | `/api/v1/jobs/{id}/changes` | Get changed pages |

## Roadmap
- [x] Phase 1 — FastAPI + Celery + PostgreSQL + Redis + Docker
- [x] Phase 2 — React dashboard
- [x] Phase 3 — Kubernetes deployment with HPA
- [x] Phase 4 — Scheduled re-crawls + Railway + Vercel deployment
- [ ] Phase 5 — Celery Beat on Railway for automated scheduling
- [ ] Phase 6 — Email/webhook alerts on page changes
# CI/CD Test
