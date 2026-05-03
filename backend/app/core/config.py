from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # App
    APP_NAME: str = "WebCrawler API"
    DEBUG: bool = False

    # Database
    DATABASE_URL: str = "postgresql://crawler:crawler@db:5432/crawlerdb"

    # Redis / Celery
    REDIS_URL: str = "redis://redis:6379/0"
    CELERY_BROKER_URL: str = "redis://redis:6379/0"
    CELERY_RESULT_BACKEND: str = "redis://redis:6379/0"

    # Crawler defaults
    MAX_DEPTH: int = 3
    MAX_PAGES: int = 100
    REQUEST_TIMEOUT: int = 10  # seconds
    CRAWL_DELAY: float = 0.5   # seconds between requests (polite crawling)

    class Config:
        env_file = ".env"


settings = Settings()
