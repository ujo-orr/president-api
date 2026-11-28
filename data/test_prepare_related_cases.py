import copy
import json
import unittest

from prepare_related_cases import DIRECTORY, prepare

CASES = json.loads((DIRECTORY / "president-related-cases.json").read_text(encoding="utf-8-sig"))
PUBLIC = json.loads((DIRECTORY / "public-events.chapter-09.json").read_text(encoding="utf-8"))


class RelatedCasesValidationTest(unittest.TestCase):
    def test_rejects_duplicate_case_id(self):
        with self.assertRaises(ValueError):
            prepare([*CASES, CASES[0]], PUBLIC)

    def test_rejects_unrelated_decision_subject(self):
        records = copy.deepcopy(CASES)
        records[0]["legalDecisions"][0]["personName"] = "테스트 대상"
        with self.assertRaises(ValueError):
            prepare(records, PUBLIC)

    def test_rejects_incorrect_date_precision(self):
        records = copy.deepcopy(CASES)
        records[0]["occurredFrom"] = "1959"
        with self.assertRaises(ValueError):
            prepare(records, PUBLIC)

    def test_rejects_unlinked_involvement_evidence(self):
        records = copy.deepcopy(CASES)
        record = next(row for row in records if row["presidentInvolvement"])
        record["presidentInvolvement"]["sourceIds"] = ["missing-source"]
        with self.assertRaises(ValueError):
            prepare(records, PUBLIC)
