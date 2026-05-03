from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from app.models.crawl import JobStatus


class CrawlJobCreate(BaseModel):
    seed_url: str
    max_depth: int = 3
    max_pages: int = 100


class CrawlJobResponse(BaseModel):
    id: str
    seed_url: str
    max_depth: int
    max_pages: int
    status: JobStatus
    pages_crawled: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class CrawledPageResponse(BaseModel):
    id: int
    job_id: str
    url: str
    title: Optional[str]
    status_code: Optional[int]
    content_type: Optional[str]
    meta_description: Optional[str]
    depth: int
    outbound_links: int
    crawled_at: datetime
    error: Optional[str]

    class Config:
        from_attributes = True


class CrawledPageDetail(CrawledPageResponse):
    text_content: Optional[str]


class PageSnapshotResponse(BaseModel):
    id: int
    job_id: str
    url: str
    content_hash: str
    has_changed: bool
    previous_hash: Optional[str]
    snapshot_at: datetime

    class Config:
        from_attributes = True


class CrawlJobListResponse(BaseModel):
    jobs: List[CrawlJobResponse]
    total: int


class CrawledPagesListResponse(BaseModel):
    pages: List[CrawledPageResponse]
    total: int
