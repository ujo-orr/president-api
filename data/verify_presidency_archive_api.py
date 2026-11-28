import argparse
from collections import defaultdict

from calculate_presidency_scores import TERMS, require
from prepare_presidency_archive import prepare_tables
from verify_public_events_api import get
from urllib.error import HTTPError


def verify(base):
    # 원본 적재 행과 대통령별 응답의 대조
    tables = prepare_tables()
    labels = dict(tables["archive_category"][1])
    snapshots = {name: metadata for name, _, metadata in tables["archive_source_snapshot"][1]}
    adjustment = snapshots["presidency-scores.stage-2.json"]["scoreAdjustmentConstant"]
    weights = defaultdict(int)
    for _, event_id, _, classification, weight, _ in tables["archive_assessment"][1]:
        if weight is not None:
            weights[event_id, classification] += weight
    limit = max([1, *weights.values()])
    for president_id, *_ in TERMS:
        profile_url = f"{base}/{president_id}"
        record = get(f"{profile_url}/archive")
        events = sorted(
            [(when, event_id, event) for event_id, owner, when, event in tables["archive_event"][1]
             if owner == president_id]
        )
        event_ids = {event_id for _, event_id, _ in events}
        scores = [
            {"id": axis, "label": labels[axis], "score": score, "status": status}
            for owner, axis, score, status, _ in tables["archive_score"][1] if owner == president_id
        ]
        require(record == {
            "person": get(profile_url),
            "scores": sorted(scores, key=lambda row: row["id"]),
            "events": [event for _, _, event in events],
            "assessments": [row[-1] for row in tables["archive_assessment"][1] if row[1] in event_ids],
            "scoreAdjustmentConstant": adjustment,
            "timelineWeightLimit": limit,
        }, f"{president_id}: archive API mismatch")

    try:
        get(f"{base}/unknown/archive")
    except HTTPError as error:
        require(error.code == 404, "unknown president")
    else:
        raise AssertionError("unknown president")
    print(f"profiles={len(TERMS)} scores={len(tables['archive_score'][1])} "
          f"events={len(tables['archive_event'][1])} assessments={len(tables['archive_assessment'][1])} OK")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("base", nargs="?", default="http://localhost:8080/api/presidents")
    verify(parser.parse_args().base.rstrip("/"))
