# Дневник тренировок

Учебный full-stack проект для практики CI/CD.

- **backend/** — Python 3.12+ · FastAPI · SQLAlchemy · SQLite (локально) / PostgreSQL (в Docker)
- **frontend/** — React 19 · TypeScript · Vite
- **docker-compose.yml** — Postgres + backend + frontend (nginx)

Что умеет приложение: справочник упражнений, запись тренировок с подходами (повторы × вес),
история тренировок, статистика (тоннаж, количество тренировок за неделю, рекорды по весу).

## Структура

```
workout_app/
├── backend/
│   ├── app/
│   │   ├── main.py          # точка входа FastAPI, /api/health
│   │   ├── config.py        # настройки из переменных окружения
│   │   ├── database.py      # подключение к БД
│   │   ├── models.py        # таблицы SQLAlchemy
│   │   ├── schemas.py       # Pydantic-схемы запросов/ответов
│   │   └── routers/         # exercises, workouts, stats
│   ├── tests/               # pytest
│   ├── requirements.txt     # зависимости для прода
│   ├── requirements-dev.txt # + pytest, ruff
│   ├── pyproject.toml       # настройки ruff и pytest
│   └── Dockerfile
├── frontend/
│   ├── src/                 # компоненты, api-клиент, тесты (*.test.tsx)
│   ├── nginx.conf           # раздача статики + прокси /api → backend
│   └── Dockerfile           # multi-stage: node → nginx
└── docker-compose.yml
```

## Локальный запуск (без Docker)

**Backend** (http://localhost:8000, Swagger: http://localhost:8000/docs):

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate            # Linux/macOS: source .venv/bin/activate
pip install -r requirements-dev.txt
uvicorn app.main:app --reload
```

**Frontend** (http://localhost:5173, запросы `/api` проксируются на :8000):

```bash
cd frontend
npm install
npm run dev
```

## Запуск в Docker

```bash
docker compose up --build
```

- приложение: http://localhost:8080
- API напрямую: http://localhost:8000/docs

Остановить и удалить данные: `docker compose down -v`.

## Команды, которые должен запускать CI

| Что            | Backend (`cd backend`)      | Frontend (`cd frontend`) |
|----------------|-----------------------------|--------------------------|
| Установка      | `pip install -r requirements-dev.txt` | `npm ci`       |
| Линтер         | `ruff check .`              | `npm run lint`           |
| Форматирование | `ruff format --check .`     | —                        |
| Типы           | —                           | `npm run typecheck`      |
| Тесты          | `pytest`                    | `npm test`               |
| Сборка         | `docker build -t workout-backend .` | `npm run build` / `docker build -t workout-frontend .` |

Все команды возвращают ненулевой код при ошибке — то, что нужно для CI.

## API

| Метод  | Путь                    | Описание                                   |
|--------|-------------------------|--------------------------------------------|
| GET    | `/api/health`           | проверка живости (для healthcheck/smoke-тестов) |
| GET    | `/api/exercises`        | список упражнений                          |
| POST   | `/api/exercises`        | создать `{name, muscle_group}`             |
| DELETE | `/api/exercises/{id}`   | удалить (409, если используется)           |
| GET    | `/api/workouts`         | список тренировок (новые сверху)           |
| POST   | `/api/workouts`         | создать `{date, title, notes, sets: [{exercise_id, reps, weight}]}` |
| GET    | `/api/workouts/{id}`    | одна тренировка                            |
| PUT    | `/api/workouts/{id}`    | обновить (подходы заменяются целиком)      |
| DELETE | `/api/workouts/{id}`    | удалить                                    |
| GET    | `/api/stats`            | статистика и рекорды                       |

Настройки backend (переменные окружения, см. `backend/.env.example`):
`DATABASE_URL`, `CORS_ORIGINS`.

---

## Задания по CI — от простого к сложному

CI-конфигов в проекте специально нет — их предстоит написать вам.
Примеры ниже для GitHub Actions (`.github/workflows/*.yml`), но всё то же самое
можно сделать в GitLab CI (`.gitlab-ci.yml`).

### Уровень 1 — первый пайплайн
1. Залейте проект в репозиторий на GitHub/GitLab.
2. Workflow на `push` и `pull_request`: job **backend** — установить Python,
   зависимости, `ruff check`, `pytest`.
3. Job **frontend** — Node, `npm ci`, `lint`, `typecheck`, `test`, `build`.
4. Сломайте тест специально и убедитесь, что пайплайн краснеет.

### Уровень 2 — ускорение и удобство
5. Кэш зависимостей (`actions/setup-python` с `cache: pip`, `actions/setup-node` с `cache: npm`).
6. `paths`-фильтры: backend-job запускается только при изменениях в `backend/**`.
7. Matrix: прогоните backend-тесты на Python 3.12 и 3.13.
8. Отчёт о покрытии: `pytest-cov` / `vitest --coverage`, загрузите как artifact.
9. Защита ветки `main`: merge только при зелёном CI.

### Уровень 3 — Docker
10. Сборка обоих Docker-образов в CI (`docker/build-push-action`).
11. Кэш слоёв Docker (`cache-from: type=gha`).
12. Публикация образов в GitHub Container Registry (ghcr.io) только из `main`;
    теги — `latest` и короткий SHA коммита.
13. Сборка образа при git-теге `v*.*.*` с тегом версии.

### Уровень 4 — интеграционные проверки
14. Backend-тесты против настоящего PostgreSQL через `services:` в job'е
    (подсказка: тестам нужна переменная `DATABASE_URL` — доработайте `conftest.py`).
15. Smoke-тест: `docker compose up -d`, дождаться `/api/health`, создать упражнение
    через `curl`, проверить, что фронтенд отдаёт 200 на `http://localhost:8080`.
16. Добавьте Alembic-миграции вместо `create_all` и проверку
    «миграции применяются на чистую БД» в CI.

### Уровень 5 — безопасность и качество
17. Сканирование образов Trivy, падение на уязвимостях HIGH/CRITICAL.
18. `pip-audit` и `npm audit` для зависимостей.
19. Dependabot / Renovate для автообновления зависимостей.
20. pre-commit хуки (ruff, eslint) — и та же проверка в CI.

### Уровень 6 — CD
21. Деплой на сервер/VPS по SSH после успешной сборки в `main` (environment с ручным approve).
22. Отдельные окружения staging/production, секреты через GitHub Environments.
23. Откат на предыдущую версию образа.

Удачи! 💪
