import datetime as dt

from sqlalchemy import Date, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Exercise(Base):
    __tablename__ = "exercises"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(100), unique=True, index=True)
    muscle_group: Mapped[str] = mapped_column(String(50), default="")


class Workout(Base):
    __tablename__ = "workouts"

    id: Mapped[int] = mapped_column(primary_key=True)
    date: Mapped[dt.date] = mapped_column(Date, index=True)
    title: Mapped[str] = mapped_column(String(100))
    notes: Mapped[str] = mapped_column(Text, default="")

    sets: Mapped[list["WorkoutSet"]] = relationship(
        back_populates="workout",
        cascade="all, delete-orphan",
        order_by="WorkoutSet.id",
    )


class WorkoutSet(Base):
    __tablename__ = "workout_sets"

    id: Mapped[int] = mapped_column(primary_key=True)
    workout_id: Mapped[int] = mapped_column(ForeignKey("workouts.id", ondelete="CASCADE"))
    exercise_id: Mapped[int] = mapped_column(ForeignKey("exercises.id"))
    reps: Mapped[int] = mapped_column(Integer)
    weight: Mapped[float] = mapped_column(Float, default=0)

    workout: Mapped[Workout] = relationship(back_populates="sets")
    exercise: Mapped[Exercise] = relationship()
