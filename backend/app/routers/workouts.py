from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.database import get_db
from app.models import Exercise, Workout, WorkoutSet
from app.schemas import SetCreate, SetRead, WorkoutCreate, WorkoutRead

router = APIRouter(prefix="/api/workouts", tags=["workouts"])


def to_read(workout: Workout) -> WorkoutRead:
    return WorkoutRead(
        id=workout.id,
        date=workout.date,
        title=workout.title,
        notes=workout.notes,
        sets=[
            SetRead(
                id=s.id,
                exercise_id=s.exercise_id,
                exercise_name=s.exercise.name,
                reps=s.reps,
                weight=s.weight,
            )
            for s in workout.sets
        ],
        total_volume=sum(s.reps * s.weight for s in workout.sets),
    )


def build_sets(db: Session, sets: list[SetCreate]) -> list[WorkoutSet]:
    ids = {s.exercise_id for s in sets}
    found = set(db.scalars(select(Exercise.id).where(Exercise.id.in_(ids)))) if ids else set()
    missing = ids - found
    if missing:
        raise HTTPException(
            status.HTTP_422_UNPROCESSABLE_CONTENT,
            f"Неизвестные упражнения: {sorted(missing)}",
        )
    return [WorkoutSet(exercise_id=s.exercise_id, reps=s.reps, weight=s.weight) for s in sets]


def get_or_404(db: Session, workout_id: int) -> Workout:
    workout = db.scalar(
        select(Workout)
        .where(Workout.id == workout_id)
        .options(selectinload(Workout.sets).selectinload(WorkoutSet.exercise))
    )
    if workout is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Тренировка не найдена")
    return workout


@router.get("", response_model=list[WorkoutRead])
def list_workouts(db: Session = Depends(get_db)):
    workouts = db.scalars(
        select(Workout)
        .options(selectinload(Workout.sets).selectinload(WorkoutSet.exercise))
        .order_by(Workout.date.desc(), Workout.id.desc())
    ).all()
    return [to_read(w) for w in workouts]


@router.get("/{workout_id}", response_model=WorkoutRead)
def get_workout(workout_id: int, db: Session = Depends(get_db)):
    return to_read(get_or_404(db, workout_id))


@router.post("", response_model=WorkoutRead, status_code=status.HTTP_201_CREATED)
def create_workout(payload: WorkoutCreate, db: Session = Depends(get_db)):
    workout = Workout(
        date=payload.date,
        title=payload.title.strip(),
        notes=payload.notes,
        sets=build_sets(db, payload.sets),
    )
    db.add(workout)
    db.commit()
    db.expire_all()
    return to_read(get_or_404(db, workout.id))


@router.put("/{workout_id}", response_model=WorkoutRead)
def update_workout(workout_id: int, payload: WorkoutCreate, db: Session = Depends(get_db)):
    workout = get_or_404(db, workout_id)
    workout.date = payload.date
    workout.title = payload.title.strip()
    workout.notes = payload.notes
    workout.sets = build_sets(db, payload.sets)
    db.commit()
    db.expire_all()
    return to_read(get_or_404(db, workout_id))


@router.delete("/{workout_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_workout(workout_id: int, db: Session = Depends(get_db)):
    db.delete(get_or_404(db, workout_id))
    db.commit()
