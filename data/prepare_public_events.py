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
EVENT_TYPES = {"POLICY", "DIPLOMATIC"}
EFFECT_TYPES = {"POLICY", "NATIONAL_PROJECT", "ADMINISTRATIVE_REFORM"}
HISTORICAL_TYPES = EFFECT_TYPES | {"DIPLOMATIC", "HISTORICAL_EVENT"}
VERIFICATION_STATUSES = {"VERIFIED", "PARTIALLY_VERIFIED", "DISPUTED", "INSUFFICIENT_EVIDENCE"}
SOURCED_FIELDS = ("positiveImpacts", "negativeImpacts", "governmentResponses", "factSources")


def validate_evidence(doc, urls, eid):
    # 자료 검증 상태와 사법 상태의 독립 검증
    verification = doc["verificationStatus"]
    require(verification in VERIFICATION_STATUSES, f"{eid}: verificationStatus")
    if verification != "VERIFIED":
        require(doc["verificationNotes"] and doc["verificationNotes"].strip(), f"{eid}: verificationNotes")
    record_type = doc["recordType"]
    require(record_type in (HISTORICAL_TYPES if doc["category"] == "HISTORICAL_EVENT" else {doc["category"]}),
            f"{eid}: recordType")
    for field in SOURCED_FIELDS:
        items = doc.get(field, []) if field == "governmentResponses" else doc[field]
        require(isinstance(items, list), f"{eid}: {field}")
        for item in items:
            require(isinstance(item["text"], str) and item["text"].strip()
                    and item["sourceUrl"] in urls, f"{eid}: {field}")
    if doc["positiveImpacts"] or doc["negativeImpacts"]:
        require(record_type in EFFECT_TYPES, f"{eid}: policy effects")
    if doc.get("governmentResponses"):
        require(record_type == "NATIONAL_INCIDENT", f"{eid}: governmentResponses")
    require({item["text"] for item in doc["factSources"]} == set(doc["verifiedFacts"]), f"{eid}: factSources")
    require(isinstance(doc["relatedStatements"], list), f"{eid}: relatedStatements")
    for statement in doc["relatedStatements"]:
        date.fromisoformat(statement["date"])
        require(statement["speaker"] and statement["role"] and statement["context"]
                and (statement["text"] or statement.get("summary"))
                and statement["sourceUrl"] in urls, f"{eid}: relatedStatements")


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
        event_type = doc.get("eventType")
        require(event_type is None or (
            doc["category"] == "HISTORICAL_EVENT" and event_type in EVENT_TYPES
        ), f"{eid}: eventType")
        validate_evidence(doc, urls, eid)
        if doc["legalVerifiedAt"]:
            date.fromisoformat(doc["legalVerifiedAt"])
        if doc["legalStatus"] == "UNKNOWN":
            require(doc["legalReviewNotes"], f"{eid}: legalReviewNotes")
        for perspective in doc["perspectives"]:
            require(perspective["speaker"].strip() and perspective["claim"].strip(), eid)
        for item in doc["perspectives"] + doc["legalDecisions"]:
            require(item["sourceUrl"] in urls, eid)
        for ruling in doc["legalDecisions"]:
            require(ruling["subject"] and ruling["issue"] and ruling["reason"], eid)
            decided_at = date.fromisoformat(ruling["decidedAt"])
            if ruling.get("finalReportedAt"):
                require(ruling["final"] and date.fromisoformat(ruling["finalReportedAt"]) >= decided_at
                        and ruling["finalSourceUrl"] in urls, eid)
            if ruling["result"] == "CONVICTED_FINAL":
                require(ruling["final"] and ruling["sentence"], eid)
            if ruling["result"] == "ACQUITTED_FINAL":
                require(ruling["final"], eid)
            if ruling["result"] in {"1심 유죄", "TRIAL_IN_PROGRESS"}:
                require(not ruling["final"], eid)
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
