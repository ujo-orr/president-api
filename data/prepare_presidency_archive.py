import argparse
import json
import re
from collections import defaultdict
from datetime import date
from decimal import Decimal
from hashlib import sha256
from pathlib import Path
from urllib.parse import urlsplit

from calculate_presidency_scores import DIRECTORY, TERMS, calculate, key_by, require


FACTS_FILE = "historical-events.stage-1.json"
ASSESSMENTS_FILE = "presidency-assessments.stage-2.json"
SCORES_FILE = "presidency-scores.stage-2.json"
STATISTICS_FILE = "presidency-statistics.stage-2.json"
SUPPLEMENT_FILE = "annual-context-supplement.chapter-09.json"
DECIMAL_STEP = Decimal("0.0000000001")


def source_url(value):
    url = urlsplit(value)
    return url.scheme in {"http", "https"} and bool(url.hostname)


def validate_events(events):
    for event in events:
        event_id = event["id"]
        value = event["date"]
        require(re.fullmatch(r"[0-9]{4}(?:-[0-9]{2}(?:-[0-9]{2})?)?", value), f"사건 날짜 형식 오류: {event_id}")
        date.fromisoformat((value + "-01-01")[:10])
        require(event["findings"] and all(item.strip() for item in event["findings"]), f"사건 근거 누락: {event_id}")
        sources = event["sources"]
        require(sources and len(sources) == len(set(sources)) and all(map(source_url, sources)),
                f"사건 출처 누락·중복 또는 형식 오류: {event_id}")
        categories = event["categories"]
        require(categories and len(categories) == len(set(categories)), f"사건 분야 누락·중복: {event_id}")
        if "whitePaper" in event:
            require(int(value[:4]) == event["whitePaper"]["publicationYear"], f"국방백서 발간 연도 불일치: {event_id}")


def observation_rows(series_id, rows):
    years = set()
    for year, value in rows:
        require(type(year) is int and 1 <= year <= 9999 and year not in years, f"관측 연도 오류 또는 중복: {series_id} / {year}")
        years.add(year)
        if value is not None:
            require(type(value) in {int, float}, f"관측값 형식 오류: {series_id} / {year}")
            value = Decimal(str(value))
            require(value.is_finite() and abs(value) < 10**14 and value == value.quantize(DECIMAL_STEP),
                    f"저장 정밀도 범위 밖 관측값: {series_id} / {year}")
        yield series_id, year, value


def statistic_rows(facts, supplement):
    annual = facts["annualContext"]
    growth = facts["growthContext"]
    series = []
    rows = []
    units = {}
    for column, (metric, unit, source) in enumerate(annual["columns"][1:], start=1):
        units[metric] = unit
        series.append((metric, metric, "ORIGINAL", {"unit": unit, "source": source, "country": annual["country"]}))
        rows.extend(observation_rows(metric, ((row[0], row[column]) for row in annual["rows"])))
    require(len(units) == len(annual["columns"]) - 1 and "growthRate" not in units, "기존 연간 통계 지표 중복")
    units["growthRate"] = growth["unit"]
    series.append(("growthRate", "growthRate", "ORIGINAL", {key: value for key, value in growth.items() if key != "rows"}))
    rows.extend(observation_rows("growthRate", growth["rows"]))

    original_observed = {(metric, year) for metric, year, value in rows if value is not None}
    supplemented = set()
    for item in key_by(supplement["series"], "id").values():
        metric = item["metricId"]
        require(item["id"] not in units and units[metric] == item["unit"] and source_url(item["source"]),
                f"보완 계열의 식별자·단위·출처 오류: {item['id']}")
        metadata = {key: value for key, value in item.items() if key not in {"id", "metricId", "rows"}}
        series.append((item["id"], metric, "SUPPLEMENT", {"verifiedOn": supplement["verifiedOn"], **metadata}))
        for series_id, year, value in observation_rows(item["id"], item["rows"]):
            key = (metric, year)
            require(value is not None and key not in original_observed and key not in supplemented,
                    f"기존 통계 또는 보완 관측과 중복: {metric} / {year}")
            supplemented.add(key)
            rows.append((series_id, year, value))
    return series, rows


def prepare_tables():
    filenames = (FACTS_FILE, ASSESSMENTS_FILE, SCORES_FILE, STATISTICS_FILE, SUPPLEMENT_FILE)
    content = {name: (DIRECTORY / name).read_bytes() for name in filenames}
    facts, raw, scores, statistics, supplement = map(json.loads, content.values())

    # 원본 평가 산식과 저장 결과의 대조
    unchanged_scores, unchanged_statistics = calculate(facts, raw)
    require(unchanged_scores == scores, "기존 평가 점수와 재계산 결과 불일치")
    require(unchanged_statistics == statistics, "기존 통계 요약과 재계산 결과 불일치")
    validate_events(facts["events"])

    president_ids = {name: president_id for president_id, name, _, _ in TERMS}
    category_ids = {label: key for key, label in scores["categories"].items()}
    series, observations = statistic_rows(facts, supplement)
    arrays = {
        FACTS_FILE: {"events", "annualContext", "growthContext"},
        ASSESSMENTS_FILE: {"assessments"},
        SCORES_FILE: {"presidents", "categories"},
        STATISTICS_FILE: set(statistics),
        SUPPLEMENT_FILE: {"series"},
    }

    return {
        "archive_category": ("id, label", list(scores["categories"].items())),
        "archive_event": ("id, president_id, event_date, payload", [
            (event["id"], president_ids[event["president"]], event["date"], event) for event in facts["events"]
        ]),
        "archive_event_category": ("event_id, category_id", [
            (event["id"], category_ids[label]) for event in facts["events"] for label in event["categories"]
        ]),
        "archive_assessment": ("source_order, event_id, category_id, classification, weight, payload", [
            (index, item["eventId"], item["axisId"], item["classification"], item["weight"], item)
            for index, item in enumerate(raw["assessments"], start=1)
        ]),
        "archive_score": ("president_id, category_id, score, status, payload", [
            (president_id, axis, result["score"], result["status"], result)
            for president_id, person in scores["presidents"].items() for axis, result in person["axes"].items()
        ]),
        "archive_statistic_series": ("id, metric_id, kind, metadata", series),
        "archive_annual_observation": ("series_id, observation_year, observation_value", observations),
        "archive_term_statistic": ("president_id, series_id, payload", [
            (president_id, series_id, summary)
            for president_id, metrics in statistics.items() for series_id, summary in metrics.items()
        ]),
        "archive_source_snapshot": ("filename, sha256, metadata", [
            (name, sha256(content[name]).hexdigest(), {key: value for key, value in document.items() if key not in arrays[name]})
            for name, document in zip(filenames, (facts, raw, scores, statistics, supplement), strict=True)
        ]),
    }


def sql_value(value):
    if value is None:
        return "NULL"
    if isinstance(value, (int, Decimal)):
        return str(value)
    if not isinstance(value, str):
        value = json.dumps(value, ensure_ascii=False, allow_nan=False, separators=(",", ":"))
    return f"CONVERT(X'{value.encode('utf-8').hex()}' USING utf8mb4)"


def migration_sql(tables):
    # 검증된 자료 전용 테이블의 원자적 갱신
    statements = ["START TRANSACTION;"]
    statements.extend(f"DELETE FROM {table};" for table in reversed(tables))
    for table, (columns, rows) in tables.items():
        if rows:
            values = ",\n".join("(" + ", ".join(map(sql_value, row)) + ")" for row in rows)
            statements.append(f"INSERT INTO {table} ({columns}) VALUES\n{values};")
    statements.append("COMMIT;")
    return "\n".join(statements) + "\n"


def verify_database(tables, export):
    actual = defaultdict(list)
    with export.open(encoding="utf-8") as rows:
        for line in rows:
            table, payload = line.rstrip("\n").split("\t", maxsplit=1)
            require(table in tables, f"예상하지 못한 테이블: {table}")
            actual[table].append(tuple(json.loads(payload)))
    for name, (_, expected) in tables.items():
        order = lambda row: row[:2]
        comparable = [tuple(float(value) if isinstance(value, Decimal) else value for value in row) for row in expected]
        require(sorted(actual[name], key=order) == sorted(comparable, key=order), f"MySQL 저장 결과 불일치: {name}")


def main():
    parser = argparse.ArgumentParser(description="대통령 아카이브 정합성 검증과 MySQL 적재 준비")
    actions = parser.add_mutually_exclusive_group()
    actions.add_argument("--sql", type=Path, help="Flyway 반복 마이그레이션 저장 경로")
    actions.add_argument("--export-query", action="store_true", help="MySQL 대조용 읽기 쿼리 출력")
    actions.add_argument("--verify", type=Path, help="MySQL 탭 구분 출력과 원본 대조")
    args = parser.parse_args()
    tables = prepare_tables()
    if args.sql:
        args.sql.write_text(migration_sql(tables), encoding="ascii", newline="\n")
    elif args.export_query:
        for name, (columns, _) in tables.items():
            print(f"SELECT '{name}', JSON_ARRAY({columns}) FROM {name};")
        return
    elif args.verify:
        verify_database(tables, args.verify)
    for name, (_, rows) in tables.items():
        print(f"{name}: {len(rows)}")


if __name__ == "__main__":
    main()
