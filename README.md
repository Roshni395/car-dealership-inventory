# Car Dealership Inventory System

A full-stack inventory management application built with FastAPI, SQLAlchemy, SQLite, React, Vite, and Tailwind CSS.

## Features

- User registration and login using signed JWT access tokens.
- Argon2 password hashing.
- Role-based authorization (`customer` and `admin`).
- Vehicle listing, search by make/model/category, and price filtering.
- Admin-only create, update, delete, and restock operations.
- Authenticated vehicle purchase with stock validation and transaction locking.
- Backend pytest suite and frontend Vitest/React Testing Library setup.
- Responsive React SPA.

## Requirements

- Python 3.11+
- Node.js 20+
- npm
- Git

## Run the backend

```bash
cd backend
python -m venv .venv
# Windows PowerShell:
.venv\Scripts\Activate.ps1
# macOS/Linux:
# source .venv/bin/activate

pip install -r requirements.txt
copy .env.example .env
uvicorn app.main:app --reload
```

On macOS/Linux, use `cp .env.example .env` instead of `copy`.
API docs: http://127.0.0.1:8000/docs

The SQLite database is created automatically at `backend/dealership.db`.
For production, set a strong `JWT_SECRET_KEY`, configure PostgreSQL, use HTTPS, and apply a formal migration workflow.

### Bootstrap an admin

Set `ADMIN_EMAIL` and `ADMIN_PASSWORD` in `backend/.env` before starting the API. If both are set, the application creates that admin account if it does not already exist. Do not use the example credentials in a public deployment.

## Run the frontend

In a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Open the URL printed by Vite (usually http://localhost:5173). The frontend expects the API at `http://127.0.0.1:8000`; override with `VITE_API_URL` if necessary.

## Run tests

Backend:

```bash
cd backend
pytest -v
```

Frontend:

```bash
cd frontend
npm test
```

Coverage (backend):

```bash
cd backend
pytest --cov=app --cov-report=term-missing
```

Run these commands yourself and record the real results in your submission. Do not claim a coverage percentage or test report until you've run the tests in your environment.

## API overview

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Register customer |
| POST | `/api/auth/login` | Public | Login and receive JWT |
| GET | `/api/vehicles` | Public | List vehicles |
| GET | `/api/vehicles/search` | Public | Search/filter vehicles |
| POST | `/api/vehicles` | Admin | Create vehicle |
| PUT | `/api/vehicles/{id}` | Admin | Update vehicle |
| DELETE | `/api/vehicles/{id}` | Admin | Delete vehicle |
| POST | `/api/vehicles/{id}/purchase` | Authenticated | Purchase one unit |
| POST | `/api/vehicles/{id}/restock` | Admin | Increase stock |

Search example: `/api/vehicles/search?make=Toyota&min_price=10000&max_price=30000`

## TDD workflow

For a genuine TDD submission, write one failing test first, run it to see RED, implement the smallest change to make it pass (GREEN), then refactor and rerun tests. Commit each meaningful stage. The tests included here are a useful starting suite, but the starter code alone cannot prove that you followed TDD; your own Git history should demonstrate it.

Suggested commit sequence:
1. `test: add registration validation tests`
2. `feat: implement user registration`
3. `test: cover login and token authorization`
4. `feat: implement JWT authentication`
5. `test: cover vehicle CRUD and search`
6. `feat: implement vehicle inventory endpoints`
7. `test: cover purchase stock and admin restrictions`
8. `feat: implement transactional purchase and restock`
9. `test: add frontend component tests`
10. `feat: build inventory dashboard`

## AI usage and raw prompts

This project package was prepared with AI assistance. Review, run, understand, and adapt the code before submission. Update the **My AI Usage** section below to describe your actual use of ChatGPT or other tools, including which suggestions you accepted, changed, or rejected.

### My AI Usage

- **Tools used:** ChatGPT (OpenAI).
- **How I used them:** I used ChatGPT to plan the application architecture, scaffold API and UI code, propose validation and authorization cases, and prepare a starting test suite. I reviewed the generated structure and used the tests and API documentation to understand the behavior.
- **My review and changes:** Replace this paragraph with the actual changes you personally made, bugs you found, and decisions you changed. Do not claim work you did not do.
- **Reflection:** AI helped me move faster through repetitive scaffolding and think through edge cases. I still need to verify behavior by running tests, inspect security-sensitive code, and be able to explain the implementation.

## Screenshots

After running the app, capture screenshots of:
- Login/register screen
- Vehicle inventory with search filters
- Admin create/edit controls
- A successful purchase and a sold-out vehicle

Save screenshots in `docs/screenshots/` and embed them here, for example:
`![Inventory dashboard](docs/screenshots/inventory.png)`

## Test report

Run the backend and frontend test commands above and paste the actual command output here. The test report must reflect tests executed in your environment.

## Security notes / production improvements

- Set a long random JWT secret through environment variables.
- Use HTTPS and restrictive CORS origins in production.
- Use PostgreSQL for multi-user deployment; SQLite is intended as a simple local persistent database.
- Add database migrations, refresh-token rotation, rate limiting, audit logs, and deployment secrets management before production use.
- Purchases currently represent a single unit and do not implement payment processing.
