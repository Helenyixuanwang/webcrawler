from celery import Celery
from celery.schedules import crontab
from app.core.config import settings

celery_app = Celery(
    "webcrawler",
    broker=settings.CELERY_BROKER_URL,
    backend=settings.CELERY_RESULT_BACKEND,
    include=["app.workers.crawl_tasks"],
)

celery_app.conf.update(
    task_serializer="json",
    result_serializer="json",
    accept_content=["json"],
    timezone="UTC",
    enable_utc=True,
    task_track_started=True,
    worker_prefetch_multiplier=1,
    beat_schedule={
        "run-scheduled-crawls": {
            "task": "crawl_tasks.run_scheduled_crawls",
            "schedule": crontab(minute="*/30"),  # every 30 minutes
        },
    },
)
