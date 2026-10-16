from datetime import date, timedelta

from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Exercise, Workout, WorkoutSet
from app.schemas import ExerciseRecord, Stats

router = APIRouter(prefix="/api/stats", tags=["stats"])


@router.get("", response_model=Stats)
def get_stats(db: Session = Depends(get_db)):
    total_workouts = db.scalar(select(func.count(Workout.id))) or 0
    total_sets = db.scalar(select(func.count(WorkoutSet.id))) or 0
    total_volume = db.scalar(select(func.sum(WorkoutSet.reps * WorkoutSet.weight))) or 0
    week_ago = date.today() - timedelta(days=6)
    last_7 = db.scalar(select(func.count(Workout.id)).where(Workout.date >= week_ago)) or 0

    rows = db.execute(
        select(
            Exercise.id,
            Exercise.name,
            func.max(WorkoutSet.weight),
            func.count(WorkoutSet.id),
        )
        .join(WorkoutSet, WorkoutSet.exercise_id == Exercise.id)
        .group_by(Exercise.id, Exercise.name)
        .order_by(Exercise.name)
    ).all()

    return Stats(
        total_workouts=total_workouts,
        total_sets=total_sets,
        total_volume=float(total_volume),
        workouts_last_7_days=last_7,
        records=[
            ExerciseRecord(exercise_id=r[0], exercise_name=r[1], max_weight=r[2], total_sets=r[3])
            for r in rows
        ],
    )
