from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Exercise, WorkoutSet
from app.schemas import ExerciseCreate, ExerciseRead

router = APIRouter(prefix="/api/exercises", tags=["exercises"])


@router.get("", response_model=list[ExerciseRead])
def list_exercises(db: Session = Depends(get_db)):
    return db.scalars(select(Exercise).order_by(Exercise.name)).all()


@router.post("", response_model=ExerciseRead, status_code=status.HTTP_201_CREATED)
def create_exercise(payload: ExerciseCreate, db: Session = Depends(get_db)):
    name = payload.name.strip()
    if not name:
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_CONTENT, "Название не может быть пустым")
    if db.scalar(select(Exercise).where(Exercise.name == name)):
        raise HTTPException(status.HTTP_409_CONFLICT, "Такое упражнение уже существует")
    exercise = Exercise(name=name, muscle_group=payload.muscle_group.strip())
    db.add(exercise)
    db.commit()
    return exercise


@router.delete("/{exercise_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_exercise(exercise_id: int, db: Session = Depends(get_db)):
    exercise = db.get(Exercise, exercise_id)
    if exercise is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Упражнение не найдено")
    if db.scalar(select(WorkoutSet.id).where(WorkoutSet.exercise_id == exercise_id).limit(1)):
        raise HTTPException(
            status.HTTP_409_CONFLICT, "Упражнение используется в тренировках, удалить нельзя"
        )
    db.delete(exercise)
    db.commit()
