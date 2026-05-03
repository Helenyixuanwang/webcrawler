# 🕷️ WebCrawler

A full-stack web crawler built with **FastAPI**, **Celery**, **PostgreSQL**, and **Redis** — deployable on **Kubernetes**.

## Features
- Crawl & index URLs via BFS from a seed URL
- Extract title, meta description, and clean text content
- Detect page changes via SHA-256 content hashing
- Async job queue with Celery workers
- REST API with Swagger UI

## Tech Stack
| Layer | Technology |
|---|---|
| API | FastAPI + Uvicorn |
| Task Queue | Celery + Redis |
| Database | PostgreSQL + SQLAlchemy |
| Crawler | httpx + BeautifulSoup4 |
| Container | Docker + Docker Compose |
| Orchestration | Kubernetes (Phase 3) |

## Quick Start
```bash
cp backend/.env.example backend/.env
docker compose up --build
```

- API: http://localhost:8000
- Swagger UI: http://localhost:8000/docs
- Flower: http://localhost:5555

## Roadmap
- [x] Phase 1 — FastAPI + Celery + PostgreSQL + Redis + Docker
- [ ] Phase 2 — React dashboard
- [ ] Phase 3 — Kubernetes deployment with HPA
- [ ] Phase 4 — Scheduled re-crawls + change alerts
