import argparse
import json
import re
from datetime import date
from pathlib import Path

from calculate_presidency_scores import DIRECTORY, TERMS, key_by, require
from prepare_presidency_archive import migration_sql, source_url

PRESIDENT_IDS = {name: president_id for president_id, name, *_ in TERMS}
PUBLIC_REFERENCES = {
    "roh-tae-1990s-funds": "roh-funds-apology",
    "park-gh-2013-state": "impeachment-park",
}
# 선고 이후 감형을 반영하기 전까지 공개 보류
WITHHELD_IDS = {"rhee-1960-election"}
STATUSES = {
    "CONVICTED_FINAL", "ACQUITTED_FINAL", "PARTIALLY_CONVICTED_FINAL", "TRIAL_IN_PROGRESS",
    "UNDER_INVESTIGATION", "NOT_INDICTED", "PROSECUTION_DEFERRED", "NO_PROSECUTION_RIGHT",
    "NOT_APPLICABLE", "UNKNOWN",
}
DATE_LENGTHS = {"YEAR": {4}, "MONTH": {7}, "DAY": {10}, "MIXED": {4, 7, 10}, "UNKNOWN": set()}
VERIFICATION = {"VERIFIED", "PARTIALLY_VERIFIED", "DISPUTED", "INSUFFICIENT_EVIDENCE"}


def checked_date(value, lengths):
    if value is None:
        return None
    require(isinstance(value, str) and len(value) in lengths
            and re.fullmatch(r"[0-9]{4}(?:-[0-9]{2}(?:-[0-9]{2})?)?", value), f"날짜 형식: {value}")
    return date.fromisoformat((value + "-01-01")[:10])


def prepare(records, public_events):
    rows = []
    cases = key_by(records, "id")
    public = key_by(public_events, "id")
    require(WITHHELD_IDS | PUBLIC_REFERENCES.keys() <= cases.keys(), "공개 검토 ID 불일치")
    for case_id, item in cases.items():
        require(re.fullmatch(r"[a-z0-9-]{1,96}", case_id), f"사건 ID: {case_id}")
        president_id = PRESIDENT_IDS[item["presidentName"]]
        date_lengths = DATE_LENGTHS[item["datePrecision"]]
        start = checked_date(item["occurredFrom"], date_lengths)
        end = checked_date(item["occurredTo"], date_lengths)
        require((start is None) == (item["datePrecision"] == "UNKNOWN")
                and (end is None or start <= end), f"{case_id}: 사건 기간")
        require(checked_date(item["lastVerifiedAt"], {10}) is not None, f"{case_id}: 확인일")
        require(item["title"].strip() and item["summary"].strip()
                and item["verificationStatus"] in VERIFICATION, f"{case_id}: 기본 정보")
        by_source = key_by(item["sources"], "id")
        require(by_source and all(s["title"].strip() and source_url(s["url"])
                and s["url"].startswith("https://") for s in by_source.values()), f"{case_id}: 출처")
        people = key_by(item["relatedPersons"], "name")
        require(people and all(p["name"].strip() and p["relationship"].strip() for p in people.values()),
                f"{case_id}: 관련 인물")
        participants = people.keys() | {item["presidentName"]}
        rulings = item["legalDecisions"]
        for ruling in rulings:
            require(ruling["personName"] in participants and ruling["status"] in STATUSES
                    and ruling["charges"] and all(c.strip() for c in ruling["charges"]), f"{case_id}: 판결")
            checked_date(ruling["decisionDate"], {4, 7, 10})
            checked_date(ruling["finalizedAt"], {4, 7, 10})
        involvement = item["presidentInvolvement"]
        linked_evidence = [*people.values(), *rulings, *item["allegations"], *item["verifiedFacts"]]
        if involvement is not None:
            require(involvement["action"].strip() and involvement["evidenceType"].strip(), f"{case_id}: 대통령 관여")
            linked_evidence.append(involvement)
        for evidence in linked_evidence:
            ids = evidence["sourceIds"]
            require(ids and set(ids) <= by_source.keys(), f"{case_id}: 연결된 출처")
        public_id = PUBLIC_REFERENCES.get(case_id)
        if public_id:
            require(any(link["presidentId"] == president_id for link in public[public_id]["links"]),
                    f"{case_id}: 기존 사건 참조")
        if case_id not in WITHHELD_IDS:
            rows.append((case_id, president_id, item["occurredFrom"], public_id, item))
    return {"president_related_case": ("id, president_id, occurred_from, public_event_id, document", rows)}


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--sql", type=Path, required=True)
    args = parser.parse_args()
    records = json.loads((DIRECTORY / "president-related-cases.json").read_text(encoding="utf-8-sig"))
    public = json.loads((DIRECTORY / "public-events.chapter-09.json").read_text(encoding="utf-8"))
    args.sql.write_text(migration_sql(prepare(records, public)), encoding="utf-8")
