"""Saves a copy of the organiser's Moderne pages (fallback for the live box)."""
import json
import urllib.request
from datetime import datetime, timezone

IDS = "1228,701,705,1501,762,696,694,691"
URL = f"https://var-rallye.fr/wp-json/wp/v2/pages?include={IDS}&per_page=20&_fields=id,slug,modified_gmt,content"


def main() -> None:
    req = urllib.request.Request(URL, headers={"User-Agent": "Mozilla/5.0 (crew pack snapshot)"})
    with urllib.request.urlopen(req, timeout=40) as resp:
        pages = json.load(resp)
    if not isinstance(pages, list) or len(pages) < 6:
        raise SystemExit("unexpected answer from the official site")
    out = {"checked_at": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"), "pages": pages}
    with open("live.json", "w", encoding="utf-8") as fh:
        json.dump(out, fh, ensure_ascii=False)


if __name__ == "__main__":
    main()
