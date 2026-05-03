import hashlib
import time
import httpx
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse
from typing import Optional
from dataclasses import dataclass, field


@dataclass
class PageResult:
    url: str
    status_code: Optional[int] = None
    content_type: Optional[str] = None
    title: Optional[str] = None
    meta_description: Optional[str] = None
    text_content: Optional[str] = None
    links: list = field(default_factory=list)
    content_hash: Optional[str] = None
    error: Optional[str] = None


def _is_same_domain(base_url: str, target_url: str) -> bool:
    base = urlparse(base_url)
    target = urlparse(target_url)
    return base.netloc == target.netloc


def _normalize_url(url: str) -> str:
    parsed = urlparse(url)
    normalized = parsed._replace(fragment="")
    result = normalized.geturl().rstrip("/")
    return result


def fetch_page(url: str, timeout: int = 10) -> PageResult:
    headers = {
        "User-Agent": (
            "Mozilla/5.0 (compatible; WebCrawlerBot/1.0; "
            "+https://github.com/Helenyixuanwang/webcrawler)"
        )
    }
    try:
        with httpx.Client(follow_redirects=True, timeout=timeout) as client:
            response = client.get(url, headers=headers)

        content_type = response.headers.get("content-type", "")
        result = PageResult(
            url=url,
            status_code=response.status_code,
            content_type=content_type,
        )

        if "text/html" not in content_type:
            return result

        soup = BeautifulSoup(response.text, "lxml")

        title_tag = soup.find("title")
        result.title = title_tag.get_text(strip=True) if title_tag else None

        meta = soup.find("meta", attrs={"name": "description"})
        if meta:
            result.meta_description = meta.get("content", "")

        for tag in soup(["script", "style", "nav", "footer", "header"]):
            tag.decompose()
        result.text_content = soup.get_text(separator=" ", strip=True)

        result.content_hash = hashlib.sha256(
            (result.text_content or "").encode()
        ).hexdigest()

        links = []
        for a_tag in soup.find_all("a", href=True):
            href = a_tag["href"]
            absolute = urljoin(url, href)
            normalized = _normalize_url(absolute)
            if (
                normalized.startswith("http")
                and _is_same_domain(url, normalized)
            ):
                links.append(normalized)
        result.links = list(set(links))

        return result

    except Exception as e:
        return PageResult(url=url, error=str(e))


def crawl_site(
    seed_url: str,
    max_depth: int = 3,
    max_pages: int = 100,
    crawl_delay: float = 0.5,
    progress_callback=None,
) -> list[PageResult]:
    visited = set()
    queue = [(_normalize_url(seed_url), 0)]
    results = []

    while queue and len(results) < max_pages:
        url, depth = queue.pop(0)

        if url in visited:
            continue
        visited.add(url)

        page = fetch_page(url)
        page.url = url
        results.append(page)

        if progress_callback:
            progress_callback(page, len(results), len(queue))

        if depth < max_depth and not page.error:
            for link in page.links:
                if link not in visited:
                    queue.append((link, depth + 1))

        time.sleep(crawl_delay)

    return results
