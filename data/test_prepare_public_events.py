import copy
import json
import unittest

from prepare_public_events import DIRECTORY, prepare


class PublicEventsValidationTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.events = json.loads((DIRECTORY / "public-events.chapter-09.json").read_text(encoding="utf-8"))

    def event(self, event_id):
        return copy.deepcopy(next(event for event in self.events if event["id"] == event_id))

    def test_fact_verification_is_independent_of_legal_status(self):
        event = self.event("park-jong-cheol")
        self.assertEqual(event["verificationStatus"], "VERIFIED")
        self.assertEqual(event["legalStatus"], "UNKNOWN")
        prepare([event])

    def test_incomplete_verification_requires_notes(self):
        event = self.event("nuclear-plan-briefing")
        event["verificationNotes"] = None
        with self.assertRaisesRegex(ValueError, "verificationNotes"):
            prepare([event])

    def test_constitutional_cases_cannot_have_policy_effects(self):
        event = self.event("yushin")
        event["negativeImpacts"] = [event["factSources"][0]]
        with self.assertRaisesRegex(ValueError, "policy effects"):
            prepare([event])

    def test_related_statement_requires_registered_source(self):
        event = self.event("four-rivers-ceremony")
        self.assertIsNone(event["quote"])
        event["relatedStatements"][0]["sourceUrl"] = "https://example.com/unregistered"
        with self.assertRaisesRegex(ValueError, "relatedStatements"):
            prepare([event])

    def test_first_instance_decision_cannot_be_final(self):
        event = self.event("martial-law")
        ruling = next(item for item in event["legalDecisions"] if item["result"] == "1심 유죄")
        ruling["final"] = True
        with self.assertRaisesRegex(ValueError, "martial-law"):
            prepare([event])

    def test_president_association_is_unique_for_each_record(self):
        event = self.event("fta-statement")
        event["links"].append(copy.deepcopy(event["links"][0]))
        with self.assertRaises(ValueError):
            prepare([event])


if __name__ == "__main__":
    unittest.main()
