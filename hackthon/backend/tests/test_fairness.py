"""Unit tests for fairness scoring and allocation engine."""

import pytest

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app import fairness_score, explain


class TestFairnessScore:
    def _make_zone(
        self,
        population=100000,
        hospitals=0,
        demand_factor=0.7,
        wastage=0.1,
        low_income_index=0.3,
        past_usage=0.5,
        tank_level=0.6,
    ):
        return {
            "population": population,
            "hospitals": hospitals,
            "demand_factor": demand_factor,
            "wastage": wastage,
            "low_income_index": low_income_index,
            "past_usage": past_usage,
            "tank_level": tank_level,
        }

    def test_positive_score(self):
        zone_data = self._make_zone()
        score = fairness_score(zone_data, 0.35)
        assert score > 0

    def test_minimum_score(self):
        # Even with extreme negative penalties, score shouldn't go below 0.1
        zone_data = self._make_zone(
            population=1000,
            hospitals=0,
            demand_factor=0.01,
            wastage=1.0,
            low_income_index=0.0,
            past_usage=1.0,
            tank_level=1.0,
        )
        score = fairness_score(zone_data, 0.0)
        assert score >= 0.1

    def test_hospitals_increase_score(self):
        zone_no_hospital = self._make_zone(hospitals=0)
        zone_with_hospital = self._make_zone(hospitals=3)
        score_no = fairness_score(zone_no_hospital, 0.35)
        score_with = fairness_score(zone_with_hospital, 0.35)
        assert score_with > score_no

    def test_higher_drought_increases_score(self):
        zone_data = self._make_zone()
        score_low = fairness_score(zone_data, 0.1)
        score_high = fairness_score(zone_data, 0.9)
        assert score_high > score_low

    def test_emergency_boost_increases_score(self):
        zone_data = self._make_zone()
        score_normal = fairness_score(zone_data, 0.35, emergency_boost=0)
        score_emergency = fairness_score(zone_data, 0.35, emergency_boost=4.5)
        assert score_emergency > score_normal
        assert score_emergency - score_normal == pytest.approx(4.5)

    def test_low_income_increases_score(self):
        zone_low = self._make_zone(low_income_index=0.1)
        zone_high = self._make_zone(low_income_index=0.9)
        assert fairness_score(zone_high, 0.35) > fairness_score(zone_low, 0.35)

    def test_hoarding_penalty(self):
        # past_usage > 0.75 incurs penalty
        zone_normal = self._make_zone(past_usage=0.5)
        zone_hoarding = self._make_zone(past_usage=0.95)
        assert fairness_score(zone_normal, 0.35) > fairness_score(zone_hoarding, 0.35)

    def test_wastage_penalty(self):
        zone_low_waste = self._make_zone(wastage=0.05)
        zone_high_waste = self._make_zone(wastage=0.5)
        assert fairness_score(zone_low_waste, 0.35) > fairness_score(zone_high_waste, 0.35)

    def test_low_tank_level_increases_need(self):
        zone_full_tank = self._make_zone(tank_level=0.9)
        zone_empty_tank = self._make_zone(tank_level=0.1)
        assert fairness_score(zone_empty_tank, 0.35) > fairness_score(zone_full_tank, 0.35)

    def test_larger_population_increases_score(self):
        zone_small = self._make_zone(population=10000)
        zone_large = self._make_zone(population=500000)
        assert fairness_score(zone_large, 0.35) > fairness_score(zone_small, 0.35)


class TestExplain:
    def _make_zone(self, zone_id="zone-a", name="Test Zone", hospitals=0, low_income_index=0.3, wastage=0.1):
        return {
            "id": zone_id,
            "name": name,
            "hospitals": hospitals,
            "low_income_index": low_income_index,
            "wastage": wastage,
        }

    def test_emergency_zone_explanation(self):
        item = self._make_zone(zone_id="zone-a")
        result = explain(item, 500, 400, "zone-a", "fire")
        assert "emergency" in result.lower()
        assert "fire" in result
        assert "Test Zone" in result

    def test_hospital_priority(self):
        item = self._make_zone(hospitals=2)
        result = explain(item, 500, 400, None, None)
        assert "hospital" in result.lower()
        assert "priority" in result.lower()

    def test_low_income_equity(self):
        item = self._make_zone(hospitals=0, low_income_index=0.7)
        result = explain(item, 500, 400, None, None)
        assert "equity" in result.lower() or "low-income" in result.lower()

    def test_high_wastage_capped(self):
        item = self._make_zone(hospitals=0, low_income_index=0.3, wastage=0.4)
        result = explain(item, 500, 400, None, None)
        assert "hoarding" in result.lower() or "capped" in result.lower()

    def test_full_demand_coverage(self):
        item = self._make_zone(hospitals=0, low_income_index=0.3, wastage=0.1)
        result = explain(item, 500, 400, None, None)
        assert "full demand" in result.lower()

    def test_proportional_supply(self):
        item = self._make_zone(hospitals=0, low_income_index=0.3, wastage=0.1)
        result = explain(item, 300, 400, None, None)
        assert "proportional" in result.lower()
