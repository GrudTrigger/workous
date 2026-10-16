import datetime as dt

from pydantic import BaseModel, ConfigDict, Field


class ExerciseCreate(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    muscle_group: str = Field(default="", max_length=50)


class ExerciseRead(ExerciseCreate):
    model_config = ConfigDict(from_attributes=True)

    id: int


class SetCreate(BaseModel):
    exercise_id: int
    reps: int = Field(gt=0, le=1000)
    weight: float = Field(default=0, ge=0, le=1000)


class SetRead(SetCreate):
    id: int
    exercise_name: str


class WorkoutCreate(BaseModel):
    date: dt.date
    title: str = Field(min_length=1, max_length=100)
    notes: str = ""
    sets: list[SetCreate] = Field(default_factory=list)


class WorkoutRead(BaseModel):
    id: int
    date: dt.date
    title: str
    notes: str
    sets: list[SetRead]
    total_volume: float


class ExerciseRecord(BaseModel):
    exercise_id: int
    exercise_name: str
    max_weight: float
    total_sets: int


class Stats(BaseModel):
    total_workouts: int
    total_sets: int
    total_volume: float
    workouts_last_7_days: int
    records: list[ExerciseRecord]
