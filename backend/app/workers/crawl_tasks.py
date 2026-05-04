from celery import current_task
from app.core.celery_app import celery_app
from app.core.database import SessionLocal
from app.models.crawl import CrawlJob, CrawledPage, PageSnapshot, JobStatus
from app.services.crawler import crawl_site
from app.core.config import settings
from datetime import datetime, timedelta
import uuid


@celery_app.task(bind=True, name="crawl_tasks.run_crawl_job")
def run_crawl_job(self, job_id: str):
    db = SessionLocal()
    try:
        job = db.query(CrawlJob).filter(CrawlJob.id == job_id).first()
        if not job:
            return {"error": f"Job {job_id} not found"}

        job.status = JobStatus.RUNNING
        job.celery_task_id = self.request.id
        job.updated_at = datetime.utcnow()
        db.commit()

        pages_done = 0

        def on_page_crawled(page_result, pages_count, queue_size):
            nonlocal pages_done
            pages_done = pages_count

            crawled = CrawledPage(
                job_id=job_id,
                url=page_result.url,
                title=page_result.title,
                status_code=page_result.status_code,
                content_type=page_result.content_type,
                text_content=page_result.text_content,
                meta_description=page_result.meta_description,
                depth=0,
                outbound_links=len(page_result.links),
                error=page_result.error,
            )
            db.add(crawled)

            if page_result.content_hash:
                existing = (
                    db.query(PageSnapshot)
                    .filter(PageSnapshot.url == page_result.url)
                    .order_by(PageSnapshot.snapshot_at.desc())
                    .first()
                )
                has_changed = (
                    existing is not None
                    and existing.content_hash != page_result.content_hash
                )
                snapshot = PageSnapshot(
                    job_id=job_id,
                    url=page_result.url,
                    content_hash=page_result.content_hash,
                    text_content=page_result.text_content,
                    has_changed=has_changed,
                    previous_hash=existing.content_hash if existing else None,
                )
                db.add(snapshot)

            job.pages_crawled = pages_count
            job.updated_at = datetime.utcnow()
            db.commit()

            current_task.update_state(
                state="PROGRESS",
                meta={"pages_crawled": pages_count, "queue_size": queue_size},
            )

        crawl_site(
            seed_url=job.seed_url,
            max_depth=job.max_depth,
            max_pages=job.max_pages,
            crawl_delay=settings.CRAWL_DELAY,
            progress_callback=on_page_crawled,
        )

        job.status = JobStatus.COMPLETED
        job.pages_crawled = pages_done
        job.last_crawled_at = datetime.utcnow()
        job.updated_at = datetime.utcnow()
        db.commit()

        return {"status": "completed", "pages_crawled": pages_done}

    except Exception as e:
        job = db.query(CrawlJob).filter(CrawlJob.id == job_id).first()
        if job:
            job.status = JobStatus.FAILED
            job.updated_at = datetime.utcnow()
            db.commit()
        raise e

    finally:
        db.close()


@celery_app.task(name="crawl_tasks.run_scheduled_crawls")
def run_scheduled_crawls():
    """Runs every 30 minutes via Celery Beat. Re-crawls any scheduled jobs that are due."""
    db = SessionLocal()
    try:
        now = datetime.utcnow()
        scheduled_jobs = (
            db.query(CrawlJob)
            .filter(CrawlJob.is_scheduled == True)
            .filter(CrawlJob.status == JobStatus.COMPLETED)
            .all()
        )

        triggered = 0
        for job in scheduled_jobs:
            interval_hours = job.schedule_interval or 24
            due_at = (job.last_crawled_at or job.created_at) + timedelta(hours=interval_hours)
            if now >= due_at:
                # Create a new job for this re-crawl
                new_job = CrawlJob(
                    id=str(uuid.uuid4()),
                    seed_url=job.seed_url,
                    max_depth=job.max_depth,
                    max_pages=job.max_pages,
                    status=JobStatus.PENDING,
                    is_scheduled=True,
                    schedule_interval=job.schedule_interval,
                )
                db.add(new_job)
                db.commit()
                db.refresh(new_job)
                run_crawl_job.delay(new_job.id)
                triggered += 1

        return {"triggered": triggered}

    finally:
        db.close()
