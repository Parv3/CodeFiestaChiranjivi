"""Registry metadata lookup for PyPI and npm.
Fetches package metrics: download counts, age, release dates, and maintainers.
"""

from typing import Optional, Dict, Any, Tuple
import json
import urllib.request
import urllib.error
from datetime import datetime, timezone

USER_AGENT = "SafePkg-StudentDetector/1.0"


class PackageMetadata:
    def __init__(
        self,
        name: str,
        ecosystem: str,
        exists: bool,
        downloads_monthly: Optional[int] = None,
        created_at: Optional[datetime] = None,
        author: Optional[str] = None,
        maintainers_count: int = 0,
        version: Optional[str] = None,
        summary: Optional[str] = None,
        error_msg: Optional[str] = None,
    ):
        self.name = name
        self.ecosystem = ecosystem
        self.exists = exists
        self.downloads_monthly = downloads_monthly
        self.created_at = created_at
        self.author = author or "Unknown"
        self.maintainers_count = maintainers_count
        self.version = version
        self.summary = summary
        self.error_msg = error_msg

    @property
    def age_days(self) -> Optional[int]:
        if not self.created_at:
            return None
        now = datetime.now(timezone.utc)
        created = self.created_at
        if created.tzinfo is None:
            created = created.replace(tzinfo=timezone.utc)
        return max(0, (now - created).days)

    @property
    def age_human(self) -> str:
        days = self.age_days
        if days is None:
            return "Unknown"
        if days < 30:
            return f"{days} days"
        elif days < 365:
            return f"{days // 30} months"
        else:
            years = days // 365
            rem_months = (days % 365) // 30
            if rem_months > 0:
                return f"{years}y {rem_months}m"
            return f"{years} years"

    @property
    def downloads_human(self) -> str:
        if self.downloads_monthly is None:
            return "Unavailable"
        d = self.downloads_monthly
        if d >= 1_000_000:
            return f"{d / 1_000_000:.1f}M/mo"
        elif d >= 1_000:
            return f"{d / 1_000:.1f}k/mo"
        else:
            return f"{d}/mo"


def _http_get_json(url: str, timeout: float = 3.5) -> Tuple[Optional[Dict[str, Any]], Optional[int]]:
    """Helper to fetch JSON over HTTP with graceful timeout."""
    req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    try:
        with urllib.request.urlopen(req, timeout=timeout) as response:
            if response.status == 200:
                data = json.loads(response.read().decode("utf-8", errors="ignore"))
                return data, 200
    except urllib.error.HTTPError as e:
        return None, e.code
    except Exception:
        return None, None
    return None, None


def fetch_pypi_metadata(package_name: str) -> PackageMetadata:
    """Fetch package metadata from PyPI JSON API and pypistats.org."""
    url = f"https://pypi.org/pypi/{package_name}/json"
    data, code = _http_get_json(url)

    if code == 404 or not data:
        return PackageMetadata(
            name=package_name,
            ecosystem="pip",
            exists=False,
            error_msg="Not found on PyPI"
        )

    info = data.get("info", {})
    releases = data.get("releases", {})

    # Determine creation date from earliest release
    earliest_date: Optional[datetime] = None
    for ver_releases in releases.values():
        for item in ver_releases:
            upload_str = item.get("upload_time_iso_8601") or item.get("upload_time")
            if upload_str:
                try:
                    # Clean potential trailing Z or microseconds
                    dt = datetime.fromisoformat(upload_str.replace("Z", "+00:00"))
                    if earliest_date is None or dt < earliest_date:
                        earliest_date = dt
                except Exception:
                    pass

    # Monthly download stats from pypistats
    monthly_downloads = None
    stats_data, _ = _http_get_json(f"https://pypistats.org/api/packages/{package_name}/recent", timeout=6.0)
    if stats_data and "data" in stats_data:
        monthly_downloads = stats_data["data"].get("last_month")

    author = info.get("author") or info.get("maintainer") or "PyPI Publisher"

    return PackageMetadata(
        name=package_name,
        ecosystem="pip",
        exists=True,
        downloads_monthly=monthly_downloads,
        created_at=earliest_date,
        author=author,
        maintainers_count=1 if author else 0,
        version=info.get("version"),
        summary=info.get("summary")
    )


def fetch_npm_metadata(package_name: str) -> PackageMetadata:
    """Fetch package metadata from npm registry API and npm downloads API."""
    url = f"https://registry.npmjs.org/{package_name}"
    data, code = _http_get_json(url)

    if code == 404 or not data:
        return PackageMetadata(
            name=package_name,
            ecosystem="npm",
            exists=False,
            error_msg="Not found on npm registry"
        )

    time_dict = data.get("time", {})
    created_str = time_dict.get("created")
    created_date: Optional[datetime] = None
    if created_str:
        try:
            created_date = datetime.fromisoformat(created_str.replace("Z", "+00:00"))
        except Exception:
            pass

    # Fetch monthly downloads
    monthly_downloads = None
    dl_data, _ = _http_get_json(f"https://api.npmjs.org/downloads/point/last-month/{package_name}", timeout=2.5)
    if dl_data and "downloads" in dl_data:
        monthly_downloads = dl_data.get("downloads")

    author_info = data.get("author")
    if isinstance(author_info, dict):
        author = author_info.get("name", "Unknown")
    elif isinstance(author_info, str):
        author = author_info
    else:
        maintainers = data.get("maintainers", [])
        author = maintainers[0].get("name") if maintainers else "npm Publisher"

    maintainers_count = len(data.get("maintainers", []))

    # Latest version
    dist_tags = data.get("dist-tags", {})
    latest_version = dist_tags.get("latest")

    return PackageMetadata(
        name=package_name,
        ecosystem="npm",
        exists=True,
        downloads_monthly=monthly_downloads,
        created_at=created_date,
        author=author,
        maintainers_count=maintainers_count,
        version=latest_version,
        summary=data.get("description")
    )


def fetch_metadata(package_name: str, ecosystem: str = "pip") -> PackageMetadata:
    """Fetch metadata for either pip or npm."""
    if ecosystem.lower() in ("pip", "pypi", "python"):
        return fetch_pypi_metadata(package_name)
    elif ecosystem.lower() in ("npm", "node", "javascript", "js"):
        return fetch_npm_metadata(package_name)
    else:
        # Default to pip
        return fetch_pypi_metadata(package_name)
