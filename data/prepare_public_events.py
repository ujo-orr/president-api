import argparse
import json
import re
from datetime import date, datetime
from pathlib import Path
from urllib.parse import urlsplit

from calculate_presidency_scores import DIRECTORY, TERMS, key_by, require
from prepare_presidency_archive import migration_sql

CATEGORIES = {"HISTORICAL_EVENT", "POLITICAL_CONTROVERSY", "CRIMINAL_CASE",
              "CONSTITUTIONAL_CASE", "NATIONAL_INCIDENT", "PUBLIC_STATEMENT"}
STATUSES = {"CONVICTED_FINAL", "ACQUITTED_FINAL", "TRIAL_IN_PROGRESS", "UNDER_INVESTIGATION",
            "NO_PROSECUTION_RIGHT", "NOT_INDICTED", "PROSECUTION_DEFERRED", "NOT_APPLICABLE", "UNKNOWN"}


def prepare(events):
    # 사건별 원문과 대통령별 관여 시점 검증
    records, relations = [], []
    terms = {pid: (start, end) for pid, _, start, end in TERMS}
    for eid, entry in key_by(events, "id").items():
        doc = entry.copy()
        links = key_by(doc.pop("links"), "presidentId")
        when = doc["occurredAt"]
        require(re.fullmatch(r"[a-z0-9-]{1,96}", eid) and links, eid)
        require(doc["category"] in CATEGORIES and doc["legalStatus"] in STATUSES, eid)
        require(doc["verifiedFacts"] and doc["title"] and doc["summary"], eid)
        require(datetime.fromisoformat(doc["lastVerifiedAt"]).utcoffset() is not None, eid)
        precision = {"YEAR": 4, "MONTH": 7, "DAY": 10}[doc["datePrecision"]]
        require(len(when) == precision, eid)
        date.fromisoformat(when + {4: "-01-01", 7: "-01", 10: ""}[precision])
        urls = key_by(doc["sources"], "url")
        require(urls and all(urlsplit(u).scheme == "https" and urlsplit(u).hostname for u in urls), eid)
        for item in doc["perspectives"] + doc["legalDecisions"]:
            require(item["sourceUrl"] in urls, eid)
        for ruling in doc["legalDecisions"]:
            require(ruling["subject"] and ruling["issue"] and ruling["reason"], eid)
            date.fromisoformat(ruling["decidedAt"])
            if ruling["result"] == "CONVICTED_FINAL":
                require(ruling["final"] and ruling["sentence"], eid)
        quote = doc["quote"]
        require((quote is not None) == (doc["category"] == "PUBLIC_STATEMENT"), eid)
        if quote:
            require(quote["speaker"] and quote["role"] and quote["context"]
                    and quote["date"] == when and quote["sourceUrl"] in urls, eid)
        for pid, link in links.items():
            start, end = terms[pid]
            phase = link["presidencyPhase"]
            require(phase in {"BEFORE", "DURING", "AFTER"} and link["responsibility"], eid)
            if len(when) >= 7 and when[:7] not in (start, end):
                expected = "BEFORE" if when[:7] < start else "AFTER" if when[:7] > end else "DURING"
                require(phase == expected, f"{eid}: {pid}")
            relations.append((pid, eid, phase, link["responsibility"]))
        records.append((eid, when, doc))
    return {"public_event": ("id, occurred_at, document", records),
            "public_event_president": ("president_id, event_id, presidency_phase, responsibility", relations)}


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--sql", type=Path, required=True)
    args = parser.parse_args()
    events = json.loads((DIRECTORY / "public-events.chapter-09.json").read_text(encoding="utf-8"))
    args.sql.write_text(migration_sql(prepare(events)), encoding="utf-8")
