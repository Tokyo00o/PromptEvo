"""
tests/test_batch4_api_endpoints.py
───────────────────────────────────
Integration tests for new promptevo API endpoints.

NOTE: These tests require the full backend environment with LangGraph compiled.
They will skip if ``core.graph`` cannot be imported (e.g. CI without config).

Endpoints covered:
- GET /api/v1/findings
- GET /api/v1/sessions/{session_id}/detail
- GET /api/v1/sessions/{session_id}/findings
- GET /api/v1/reports
- GET /api/v1/reports/{session_id}
- GET /api/v1/reports/{session_id}/{report_name}
- GET /api/v1/memory
- GET /api/v1/agents/metrics
- GET /api/v1/sessions/{session_id}/routing
"""

from __future__ import annotations

import os
import json
import pytest
from fastapi.testclient import TestClient


def get_clean_app(dry_run="true"):
    import sys
    old_keys = os.environ.get("PROMPTEVO_API_KEYS")
    old_dev = os.environ.get("PROMPTEVO_DEV_DISABLE_AUTH")
    old_dry_run = os.environ.get("DRY_RUN")

    os.environ["PROMPTEVO_API_KEYS"] = "test-key"
    os.environ["PROMPTEVO_DEV_DISABLE_AUTH"] = "true"
    os.environ["DRY_RUN"] = dry_run

    try:
        if "infra.security" in sys.modules:
            del sys.modules["infra.security"]
        if "api" in sys.modules:
            del sys.modules["api"]
        import api
        return TestClient(api.app)
    except ImportError:
        pytest.skip("Full backend environment required (config/graph not available)")
    finally:
        if old_keys is not None:
            os.environ["PROMPTEVO_API_KEYS"] = old_keys
        elif "PROMPTEVO_API_KEYS" in os.environ:
            del os.environ["PROMPTEVO_API_KEYS"]
        if old_dev is not None:
            os.environ["PROMPTEVO_DEV_DISABLE_AUTH"] = old_dev
        elif "PROMPTEVO_DEV_DISABLE_AUTH" in os.environ:
            del os.environ["PROMPTEVO_DEV_DISABLE_AUTH"]
        if old_dry_run is not None:
            os.environ["DRY_RUN"] = old_dry_run
        elif "DRY_RUN" in os.environ:
            del os.environ["DRY_RUN"]


class TestFindingsEndpoint:
    def test_findings_returns_list(self):
        client = get_clean_app()
        res = client.get("/api/v1/findings")
        assert res.status_code == 200
        data = res.json()
        assert "findings" in data
        assert "total" in data
        assert isinstance(data["findings"], list)
        assert isinstance(data["total"], int)

    def test_findings_structure(self):
        client = get_clean_app()
        data = client.get("/api/v1/findings").json()
        if data["findings"]:
            f = data["findings"][0]
            for key in ("id", "severity", "model", "session_id", "confidence", "status", "evaluator"):
                assert key in f, f"Missing key: {key}"


class TestSessionDetailEndpoint:
    def test_session_detail_not_found(self):
        client = get_clean_app()
        res = client.get("/api/v1/sessions/nonexistent-id/detail")
        assert res.status_code == 404

    def test_session_detail_structure(self):
        client = get_clean_app()
        # Try with a known session from reports directory
        reports_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "reports")
        if os.path.isdir(reports_dir):
            sessions = [d for d in os.listdir(reports_dir) if os.path.isdir(os.path.join(reports_dir, d))]
            if sessions:
                sid = sessions[0]
                res = client.get(f"/api/v1/sessions/{sid}/detail")
                if res.status_code == 200:
                    data = res.json()
                    assert "session_id" in data
                    assert "turns" in data
                    assert "findings" in data
                    assert "report_files" in data


class TestSessionFindingsEndpoint:
    def test_session_findings(self):
        client = get_clean_app()
        res = client.get("/api/v1/sessions/nonexistent/findings")
        assert res.status_code == 200
        data = res.json()
        assert "findings" in data
        assert data["total"] == 0


class TestReportsEndpoint:
    def test_reports_list(self):
        client = get_clean_app()
        res = client.get("/api/v1/reports")
        assert res.status_code == 200
        data = res.json()
        assert "reports" in data
        assert "total" in data
        assert isinstance(data["reports"], list)

    def test_reports_report_files_have_keys(self):
        client = get_clean_app()
        data = client.get("/api/v1/reports").json()
        if data["reports"]:
            r = data["reports"][0]
            for key in ("name", "type", "size", "session_id"):
                assert key in r

    def test_session_reports_not_found(self):
        client = get_clean_app()
        res = client.get("/api/v1/reports/nonexistent-session")
        assert res.status_code == 404

    def test_session_reports_structure(self):
        client = get_clean_app()
        reports_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "reports")
        if os.path.isdir(reports_dir):
            sessions = [d for d in os.listdir(reports_dir) if os.path.isdir(os.path.join(reports_dir, d))]
            if sessions:
                sid = sessions[0]
                res = client.get(f"/api/v1/reports/{sid}")
                if res.status_code == 200:
                    data = res.json()
                    assert "session_id" in data
                    assert "files" in data

    def test_get_report_content_txt(self):
        client = get_clean_app()
        reports_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "reports")
        if os.path.isdir(reports_dir):
            for d in os.listdir(reports_dir):
                sdir = os.path.join(reports_dir, d)
                if not os.path.isdir(sdir):
                    continue
                for fname in os.listdir(sdir):
                    if fname.endswith(".md"):
                        res = client.get(f"/api/v1/reports/{d}/{fname}")
                        assert res.status_code == 200
                        return

    def test_get_report_path_traversal_blocked(self):
        client = get_clean_app()
        res = client.get("/api/v1/reports/session1/../../etc/passwd")
        assert res.status_code in (400, 404)


class TestMemoryEndpoint:
    def test_memory_returns_structure(self):
        client = get_clean_app()
        res = client.get("/api/v1/memory")
        assert res.status_code == 200
        data = res.json()
        for key in ("entries", "total", "working", "session", "long_term"):
            assert key in data, f"Missing key: {key}"
        assert isinstance(data["entries"], list)


class TestAgentMetricsEndpoint:
    def test_agent_metrics_structure(self):
        client = get_clean_app()
        res = client.get("/api/v1/agents/metrics")
        assert res.status_code == 200
        data = res.json()
        assert "agents" in data
        assert "total_sessions" in data
        assert "total_llm_calls" in data


class TestSessionRoutingEndpoint:
    def test_routing_structure(self):
        client = get_clean_app()
        res = client.get("/api/v1/sessions/test-session-id/routing")
        assert res.status_code == 200
        data = res.json()
        assert "session_id" in data
        assert "routing" in data
        assert "total" in data
