import argparse
import json
from collections import defaultdict
from datetime import date
from decimal import Decimal
from pathlib import Path
from statistics import mean, median
from urllib.parse import urlsplit


DIRECTORY = Path(__file__).resolve().parent
SCORE_ADJUSTMENT_CONSTANT = 5
TERMS = (
    ("syngman-rhee", "이승만", "1948-07", "1960-04"),
    ("yun-po-sun", "윤보선", "1960-08", "1962-03"),
    ("park-chung-hee", "박정희", "1963-12", "1979-10"),
    ("choi-kyu-hah", "최규하", "1979-12", "1980-08"),
    ("chun-doo-hwan", "전두환", "1980-09", "1988-02"),
    ("roh-tae-woo", "노태우", "1988-02", "1993-02"),
    ("kim-young-sam", "김영삼", "1993-02", "1998-02"),
    ("kim-dae-jung", "김대중", "1998-02", "2003-02"),
    ("roh-moo-hyun", "노무현", "2003-02", "2008-02"),
    ("lee-myung-bak", "이명박", "2008-02", "2013-02"),
    ("park-geun-hye", "박근혜", "2013-02", "2017-03"),
    ("moon-jae-in", "문재인", "2017-05", "2022-05"),
    ("yoon-suk-yeol", "윤석열", "2022-05", "2025-04"),
)
AXIS_IDS = ("economy", "foreignRelations", "laborSocial", "securityDefense", "democracyRuleOfLaw", "culture")
RESEARCH_TYPES = {"OFFICIAL_STATISTICS", "HISTORICAL_RECORDS", "NEWS"}


def require(condition, message):
    if not condition:
        raise ValueError(message)


def key_by(rows, field):
    keyed = {row[field]: row for row in rows}
    require(len(keyed) == len(rows), f"중복 식별자: {field}")
    return keyed


def rounded_score(positive, negative):
    total = positive + negative + SCORE_ADJUSTMENT_CONSTANT
    # 정수 비율의 절반 올림
    return (20 * positive + total) // (2 * total)


def collect_assessments(raw, events, candidates, categories):
    policy = raw["whitePaperPolicy"]
    require(policy["wordingRemovalAloneIsNegative"] is False, "표현 삭제만으로 감점할 수 없음")
    criteria = key_by(policy["approvedCriteria"], "id")
    reviewed = defaultdict(list)
    pending = set()
    impacts = set()
    for item in raw["assessments"]:
        event = events[item["eventId"]]
        category = categories[item["axisId"]]
        slot = (event["president"], item["axisId"])
        require(event["id"] in candidates[slot], f"사건 분야 불일치: {event['id']} / {category}")
        label = item["classification"]
        if label == "UNASSESSED":
            require(item.get("weight") is None, "미평가 가중치는 null")
            key = (slot, event["id"])
            require(key not in pending, f"중복 미평가: {event['id']}")
            pending.add(key)
            continue

        weight = item.get("weight")
        require(label in ("POSITIVE", "NEGATIVE"), f"지원되지 않는 분류: {label}")
        require(type(weight) is int and 1 <= weight <= 5, f"가중치 범위 오류: {event['id']}")
        impact_id = item["impactId"].strip().casefold()
        require(impact_id and item["rationale"].strip(), f"영향 식별자 또는 판단 근거 누락: {event['id']}")
        require((slot, impact_id) not in impacts, f"동일 분야의 중복 영향: {slot} / {impact_id}")
        evidence = item["findingIndexes"]
        require(evidence and len(evidence) == len(set(evidence)) and all(
            type(index) is int and 0 <= index < len(event["findings"]) for index in evidence
        ), f"원본 근거 인덱스 오류: {event['id']}")
        if "whitePaper" in event:
            rule = criteria[item["criterionId"]]
            basis = rule["basis"]
            require(rule["description"].strip() and rule["classification"] == label
                    and basis in {"WORDING_ADDED_OR_RETAINED", "WORDING_REMOVAL_ONLY", "OTHER_DOCUMENTED_IMPACT"}
                    and (basis != "WORDING_REMOVAL_ONLY" or label != "NEGATIVE"), "국방백서 기준 불일치")
        impacts.add((slot, impact_id))
        reviewed[slot].append(item)
    return reviewed, pending


def confirmed_absences(raw, candidates, reviewed):
    names = {name for _, name, _, _ in TERMS}
    absences = {}
    for item in raw["confirmedAbsences"]:
        slot = (item["president"], item["axisId"])
        require(slot[0] in names and slot[1] in AXIS_IDS and slot not in absences, "자료 부재 범위 오류")
        require(item["finding"] == "NO_EVALUABLE_EVIDENCE" and item["rationale"].strip(), "자료 부재 판단 근거 누락")
        require(date.fromisoformat(item["reviewedOn"]) and item["reviewedBy"].strip(), "자료 부재 검토 기록 누락")
        reviews = key_by(item["research"], "type")
        require(set(reviews) == RESEARCH_TYPES, "공식 통계·역사 기록·신문 조사 기록 필요")
        for review in reviews.values():
            require(review["scope"].strip() and review["result"].strip() and review["sources"] and all(
                urlsplit(url).scheme in {"http", "https"} and urlsplit(url).netloc for url in review["sources"]
            ), "조사 범위·결과·확인 경로 누락")
        require(set(item["reviewedEventIds"]) == candidates[slot] and not reviewed[slot],
                f"후보 검토가 누락됐거나 확정 평가와 충돌하는 자료 부재: {slot}")
        absences[slot] = item
    return absences


def summarize_axis(event_ids, items, pending_event_ids, absence):
    positive = sum(item["weight"] for item in items if item["classification"] == "POSITIVE")
    negative = sum(item["weight"] for item in items if item["classification"] == "NEGATIVE")
    if positive + negative:
        score, status = rounded_score(positive, negative), "CALCULATED"
    elif absence:
        score, status = 0, "NO_EVALUABLE_EVIDENCE"
    else:
        score, status = None, "UNASSESSED" if event_ids else "RESEARCH_PENDING"
    assessed_event_ids = {item["eventId"] for item in items}
    awaiting = (event_ids - assessed_event_ids) | pending_event_ids
    return {
        "score": score,
        "status": status,
        "eventCount": len(event_ids),
        "assessedEventCount": len(assessed_event_ids),
        "pendingEventCount": 0 if absence else len(awaiting),
        "assessedImpactCount": len(items),
        "positiveWeight": positive,
        "negativeWeight": negative,
    }


def summarize_statistics(facts, start, end):
    years = range(int(start[:4]) + 1, int(end[:4]))
    annual = facts["annualContext"]
    growth = facts["growthContext"]
    series = [
        (name, unit, source, annual["rows"], column)
        for column, (name, unit, source) in enumerate(annual["columns"][1:], start=1)
    ]
    series.append(("growthRate", growth["unit"], growth["source"], growth["rows"], 1))
    summaries = {}
    for name, unit, source, rows, column in series:
        observed = [(row[0], row[column]) for row in rows if row[0] in years and row[column] is not None]
        values = [Decimal(str(value)) for _, value in observed]
        summaries[name] = {
            "unit": unit,
            "source": source,
            "eligibleYearCount": len(years),
            "observationCount": len(values),
            "observedYears": [year for year, _ in observed],
            "mean": float(mean(values)) if values else None,
            "median": float(median(values)) if values else None,
        }
    return summaries


def calculate(facts, raw):
    require(facts["stage"] == 1 and raw["stage"] == 2 and raw["schemaVersion"] == 1
            and raw["defaultAssessment"] == "UNASSESSED", "지원되지 않는 입력 형식")
    categories = dict(zip(AXIS_IDS, facts["categories"], strict=True))
    events = key_by(facts["events"], "id")
    term_dates = {name: (start, end) for _, name, start, end in TERMS}
    candidates = defaultdict(set)
    axis_by_name = {name: key for key, name in categories.items()}
    for event in events.values():
        start, end = term_dates[event["president"]]
        month = event["date"][:7]
        require(start[:len(month)] <= month <= end[:len(month)], f"재임 범위 밖 사건: {event['id']}")
        for name in event["categories"]:
            candidates[event["president"], axis_by_name[name]].add(event["id"])
    reviewed, pending = collect_assessments(raw, events, candidates, categories)
    pending_by_slot = defaultdict(set)
    for slot, event_id in pending:
        pending_by_slot[slot].add(event_id)
    absences = confirmed_absences(raw, candidates, reviewed)

    presidents = {}
    statistics = {}
    for president_id, name, start, end in TERMS:
        axes = {}
        for axis in categories:
            slot = (name, axis)
            axes[axis] = summarize_axis(candidates[slot], reviewed[slot], pending_by_slot[slot], absences.get(slot))
        presidents[president_id] = {"name": name, "axes": axes}
        statistics[president_id] = summarize_statistics(facts, start, end)
    scores = {
        "schemaVersion": 1,
        "scoreAdjustmentConstant": SCORE_ADJUSTMENT_CONSTANT,
        "categories": categories,
        "presidents": presidents,
    }
    if "evaluationMetadata" in raw:
        scores["evaluationMetadata"] = raw["evaluationMetadata"]
    return scores, statistics


def main():
    parser = argparse.ArgumentParser(description="대통령 평가 환산과 재임 기간 통계 요약")
    parser.add_argument("--check", action="store_true", help="저장된 결과와 재계산 결과 대조")
    args = parser.parse_args()
    facts = json.loads((DIRECTORY / "historical-events.stage-1.json").read_text(encoding="utf-8"))
    raw = json.loads((DIRECTORY / "presidency-assessments.stage-2.json").read_text(encoding="utf-8"))
    scores, statistics = calculate(facts, raw)
    for filename, result in (
        ("presidency-scores.stage-2.json", scores),
        ("presidency-statistics.stage-2.json", statistics),
    ):
        path = DIRECTORY / filename
        expected = json.dumps(result, ensure_ascii=False, indent=2, allow_nan=False) + "\n"
        if args.check:
            require(path.read_text(encoding="utf-8") == expected, f"재계산 결과와 불일치: {path.name}")
        else:
            path.write_text(expected, encoding="utf-8", newline="\n")


if __name__ == "__main__":
    main()
