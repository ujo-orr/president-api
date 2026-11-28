import argparse
import json
from urllib.error import HTTPError

from prepare_related_cases import DIRECTORY, PRESIDENT_IDS, prepare, require
from verify_public_events_api import get


def verify(base):
    records = json.loads((DIRECTORY / "president-related-cases.json").read_text(encoding="utf-8-sig"))
    public = json.loads((DIRECTORY / "public-events.chapter-09.json").read_text(encoding="utf-8"))
    rows = prepare(records, public)["president_related_case"][1]
    for president_id in PRESIDENT_IDS.values():
        ordered = sorted(
            ((case_id, when, reference, document) for case_id, owner, when, reference, document in rows
             if owner == president_id),
            key=lambda row: (row[1] is None, row[1] or "", row[0]),
        )
        require(get(f"{base}/{president_id}/related-cases") == [
            dict(document, presidentId=president_id, publicEventId=reference)
            for _, _, reference, document in ordered
        ], f"{president_id}: related cases API mismatch")
        print(f"{president_id}: {len(ordered)}")
    try:
        get(f"{base}/unknown/related-cases")
    except HTTPError as error:
        require(error.code == 404, "unknown president")
    else:
        raise AssertionError("unknown president")
    print(f"input={len(records)} published={len(rows)} presidents={len(PRESIDENT_IDS)} OK")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("base", nargs="?", default="http://localhost:8080/api/presidents")
    verify(parser.parse_args().base.rstrip("/"))
