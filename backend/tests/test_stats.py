from datetime import date, timedelta


def test_stats_empty(client):
    data = client.get("/api/stats").json()
    assert data == {
        "total_workouts": 0,
        "total_sets": 0,
        "total_volume": 0,
        "workouts_last_7_days": 0,
        "records": [],
    }


def test_stats(client, bench, squat):
    today = date.today()
    client.post(
        "/api/workouts",
        json={
            "date": today.isoformat(),
            "title": "Сегодня",
            "sets": [
                {"exercise_id": bench["id"], "reps": 5, "weight": 80},
                {"exercise_id": bench["id"], "reps": 3, "weight": 90},
            ],
        },
    )
    client.post(
        "/api/workouts",
        json={
            "date": (today - timedelta(days=30)).isoformat(),
            "title": "Месяц назад",
            "sets": [{"exercise_id": squat["id"], "reps": 5, "weight": 100}],
        },
    )

    data = client.get("/api/stats").json()
    assert data["total_workouts"] == 2
    assert data["total_sets"] == 3
    assert data["total_volume"] == 5 * 80 + 3 * 90 + 5 * 100
    assert data["workouts_last_7_days"] == 1
    records = {r["exercise_name"]: r for r in data["records"]}
    assert records["Жим лёжа"]["max_weight"] == 90
    assert records["Жим лёжа"]["total_sets"] == 2
    assert records["Присед"]["max_weight"] == 100
