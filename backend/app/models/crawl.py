import enum
from datetime import datetime
from sqlalchemy import (
    Column, String, Integer, Text, DateTime,
    ForeignKey, Enum as SAEnum, Boolean
)
from sqlalchemy.orm import relationship
from app.core.database import Base


class JobStatus(str, enum.Enum):
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"


class CrawlJob(Base):
    __tablename__ = "crawl_jobs"

    id = Column(String, primary_key=True)
    seed_url = Column(String, nullable=False)
    max_depth = Column(Integer, default=3)
    max_pages = Column(Integer, default=100)
    status = Column(SAEnum(JobStatus), default=JobStatus.PENDING)
    celery_task_id = Column(String, nullable=True)
    pages_crawled = Column(Integer, default=0)
    is_scheduled = Column(Boolean, default=False)
    schedule_interval = Column(Integer, nullable=True)  # hours between re-crawls
    last_crawled_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    pages = relationship("CrawledPage", back_populates="job", cascade="all, delete-orphan")
    change_snapshots = relationship("PageSnapshot", back_populates="job", cascade="all, delete-orphan")


class CrawledPage(Base):
    __tablename__ = "crawled_pages"

    id = Column(Integer, primary_key=True, autoincrement=True)
    job_id = Column(String, ForeignKey("crawl_jobs.id"), nullable=False)
    url = Column(String, nullable=False)
    title = Column(String, nullable=True)
    status_code = Column(Integer, nullable=True)
    content_type = Column(String, nullable=True)
    text_content = Column(Text, nullable=True)
    meta_description = Column(Text, nullable=True)
    depth = Column(Integer, default=0)
    outbound_links = Column(Integer, default=0)
    crawled_at = Column(DateTime, default=datetime.utcnow)
    error = Column(Text, nullable=True)

    job = relationship("CrawlJob", back_populates="pages")


class PageSnapshot(Base):
    __tablename__ = "page_snapshots"

    id = Column(Integer, primary_key=True, autoincrement=True)
    job_id = Column(String, ForeignKey("crawl_jobs.id"), nullable=False)
    url = Column(String, nullable=False)
    content_hash = Column(String, nullable=False)
    text_content = Column(Text, nullable=True)
    has_changed = Column(Boolean, default=False)
    previous_hash = Column(String, nullable=True)
    snapshot_at = Column(DateTime, default=datetime.utcnow)

    job = relationship("CrawlJob", back_populates="change_snapshots")
