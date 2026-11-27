import argparse
import json
from collections import defaultdict
from urllib.error import HTTPError
from urllib.request import urlopen

from calculate_presidency_scores import DIRECTORY, TERMS, require


def get(url):
    with urlopen(url, timeout=10) as response:
        require(response.headers.get_content_type() == "application/json", url)
        return json.load(response)


def verify(base):
    events = json.loads((DIRECTORY / "public-events.chapter-09.json").read_text(encoding="utf-8"))
    expected = defaultdict(list)
    for event in events:
        links = event.pop("links")
        for link in links:
            expected[link["presidentId"]].append(event | link)
    profiles = get(base)
    require([row["id"] for row in profiles] == [pid for pid, *_ in TERMS], "프로필 목록")
    for profile in profiles:
        pid = profile["id"]
        require(get(f"{base}/{pid}") == profile, f"{pid}: 프로필")
        rows = get(f"{base}/{pid}/events")
        ordered = sorted(expected[pid], key=lambda row: (row["occurredAt"], row["id"]))
        require(rows == ordered, f"{pid}: 사건 본문 또는 정렬")
        require(len({row["id"] for row in rows}) == len(rows), f"{pid}: 중복")
    for suffix in ("/unknown", "/unknown/events"):
        try:
            get(base + suffix)
        except HTTPError as error:
            require(error.code == 404, suffix)
        else:
            raise AssertionError(suffix)
    print(f"profiles={len(profiles)} events={len(events)} links={sum(map(len, expected.values()))} OK")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("base", nargs="?", default="http://localhost:8080/api/presidents")
    verify(parser.parse_args().base.rstrip("/"))
