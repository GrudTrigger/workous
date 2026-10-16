def test_list_empty(client):
    assert client.get("/api/exercises").json() == []


def test_create_and_list(client):
    response = client.post("/api/exercises", json={"name": "  Тяга  ", "muscle_group": "Спина"})
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Тяга"
    assert data["muscle_group"] == "Спина"

    names = [e["name"] for e in client.get("/api/exercises").json()]
    assert names == ["Тяга"]


def test_duplicate_name_conflict(client, bench):
    response = client.post("/api/exercises", json={"name": bench["name"]})
    assert response.status_code == 409


def test_empty_name_rejected(client):
    assert client.post("/api/exercises", json={"name": ""}).status_code == 422
    assert client.post("/api/exercises", json={"name": "   "}).status_code == 422


def test_delete(client, bench):
    assert client.delete(f"/api/exercises/{bench['id']}").status_code == 204
    assert client.get("/api/exercises").json() == []


def test_delete_missing(client):
    assert client.delete("/api/exercises/999").status_code == 404


def test_cannot_delete_used_exercise(client, bench):
    client.post(
        "/api/workouts",
        json={
            "date": "2026-10-01",
            "title": "Грудь",
            "sets": [{"exercise_id": bench["id"], "reps": 5, "weight": 80}],
        },
    )
    assert client.delete(f"/api/exercises/{bench['id']}").status_code == 409
