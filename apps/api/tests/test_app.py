from fastapi.testclient import TestClient

from apps.api.main import app


def test_health_root():
    client = TestClient(app)
    r = client.get("/")
    assert r.status_code == 200
    assert r.json().get("status") == "ok"

