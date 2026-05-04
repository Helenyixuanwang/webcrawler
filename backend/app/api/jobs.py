import uuid
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.crawl import CrawlJob, CrawledPage, PageSnapshot, JobStatus
from app.schemas.crawl import (
    CrawlJobCreate, CrawlJobResponse, CrawlJobListResponse,
    CrawledPagesListResponse, CrawledPageDetail,
    PageSnapshotResponse,
)
from app.workers.crawl_tasks import run_crawl_job
from datetime import datetime

router = APIRouter(prefix="/jobs", tags=["Crawl Jobs"])


@router.post("/", response_model=CrawlJobResponse, status_code=201)
def create_job(payload: CrawlJobCreate, db: Session = Depends(get_db)):
    job = CrawlJob(
        id=str(uuid.uuid4()),
        seed_url=str(payload.seed_url),
        max_depth=payload.max_depth,
        max_pages=payload.max_pages,
        status=JobStatus.PENDING,
        is_scheduled=payload.is_scheduled,
        schedule_interval=payload.schedule_interval,
    )
    db.add(job)
    db.commit()
    db.refresh(job)
    run_crawl_job.delay(job.id)
    return job


@router.get("/", response_model=CrawlJobListResponse)
def list_jobs(skip: int = 0, limit: int = 20, db: Session = Depends(get_db)):
    total = db.query(CrawlJob).count()
    jobs = db.query(CrawlJob).order_by(CrawlJob.created_at.desc()).offset(skip).limit(limit).all()
    return {"jobs": jobs, "total": total}


@router.get("/{job_id}", response_model=CrawlJobResponse)
def get_job(job_id: str, db: Session = Depends(get_db)):
    job = db.query(CrawlJob).filter(CrawlJob.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job


@router.delete("/{job_id}", status_code=204)
def delete_job(job_id: str, db: Session = Depends(get_db)):
    job = db.query(CrawlJob).filter(CrawlJob.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    db.delete(job)
    db.commit()


@router.get("/{job_id}/pages", response_model=CrawledPagesListResponse)
def get_job_pages(
    job_id: str,
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
):
    job = db.query(CrawlJob).filter(CrawlJob.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    total = db.query(CrawledPage).filter(CrawledPage.job_id == job_id).count()
    pages = (
        db.query(CrawledPage)
        .filter(CrawledPage.job_id == job_id)
        .offset(skip)
        .limit(limit)
        .all()
    )
    return {"pages": pages, "total": total}


@router.get("/{job_id}/pages/{page_id}", response_model=CrawledPageDetail)
def get_page_detail(job_id: str, page_id: int, db: Session = Depends(get_db)):
    page = (
        db.query(CrawledPage)
        .filter(CrawledPage.id == page_id, CrawledPage.job_id == job_id)
        .first()
    )
    if not page:
        raise HTTPException(status_code=404, detail="Page not found")
    return page


@router.get("/{job_id}/changes", response_model=list[PageSnapshotResponse])
def get_changes(job_id: str, db: Session = Depends(get_db)):
    job = db.query(CrawlJob).filter(CrawlJob.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    snapshots = (
        db.query(PageSnapshot)
        .filter(PageSnapshot.job_id == job_id, PageSnapshot.has_changed == True)
        .all()
    )
    return snapshots
