def make_workout(client, exercise_id, **overrides):
    payload = {
        "date": "2026-10-10",
        "title": "Тренировка",
        "notes": "",
        "sets": [
            {"exercise_id": exercise_id, "reps": 10, "weight": 60},
            {"exercise_id": exercise_id, "reps": 8, "weight": 70},
        ],
    }
    payload.update(overrides)
    return client.post("/api/workouts", json=payload)


def test_create_workout(client, bench):
    response = make_workout(client, bench["id"])
    assert response.status_code == 201
    data = response.json()
    assert data["title"] == "Тренировка"
    assert len(data["sets"]) == 2
    assert data["sets"][0]["exercise_name"] == "Жим лёжа"
    assert data["total_volume"] == 10 * 60 + 8 * 70


def test_list_sorted_by_date_desc(client, bench):
    make_workout(client, bench["id"], date="2026-10-01", title="Старая")
    make_workout(client, bench["id"], date="2026-10-05", title="Новая")
    titles = [w["title"] for w in client.get("/api/workouts").json()]
    assert titles == ["Новая", "Старая"]


def test_get_workout(client, bench):
    workout_id = make_workout(client, bench["id"]).json()["id"]
    response = client.get(f"/api/workouts/{workout_id}")
    assert response.status_code == 200
    assert response.json()["id"] == workout_id


def test_get_missing_workout(client):
    assert client.get("/api/workouts/999").status_code == 404


def test_unknown_exercise_rejected(client):
    response = client.post(
        "/api/workouts",
        json={"date": "2026-10-10", "title": "X", "sets": [{"exercise_id": 42, "reps": 5}]},
    )
    assert response.status_code == 422


def test_invalid_reps_rejected(client, bench):
    response = client.post(
        "/api/workouts",
        json={
            "date": "2026-10-10",
            "title": "X",
            "sets": [{"exercise_id": bench["id"], "reps": 0}],
        },
    )
    assert response.status_code == 422


def test_update_workout_replaces_sets(client, bench, squat):
    workout_id = make_workout(client, bench["id"]).json()["id"]
    response = client.put(
        f"/api/workouts/{workout_id}",
        json={
            "date": "2026-10-11",
            "title": "Ноги",
            "notes": "тяжело",
            "sets": [{"exercise_id": squat["id"], "reps": 5, "weight": 100}],
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert data["title"] == "Ноги"
    assert data["notes"] == "тяжело"
    assert [s["exercise_name"] for s in data["sets"]] == ["Присед"]
    assert data["total_volume"] == 500


def test_delete_workout(client, bench):
    workout_id = make_workout(client, bench["id"]).json()["id"]
    assert client.delete(f"/api/workouts/{workout_id}").status_code == 204
    assert client.get("/api/workouts").json() == []
