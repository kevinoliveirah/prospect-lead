# Mapa B2B

Starter monorepo with frontend (Next.js + Tailwind) and backend (Express + TypeScript).

## Quick start

Backend:
```sh
cd backend
npm install
npm run dev
```

Frontend:
```sh
cd frontend
npm install
npm run dev
```

## Environment

Copy the example env files and fill values:
- backend\.env.example -> backend\.env
- frontend\.env.example -> frontend\.env

Frontend routes:
- / (landing)
- /login
- /register
- /dashboard
- /mapa
- /crm

API endpoints (base http://localhost:4000):
- GET /health
- POST /auth/register
- POST /auth/login
- GET /auth/me
- GET /companies/search
- GET /leads
- POST /leads
- PATCH /leads/:id
- GET /leads/:id/notes
- POST /leads/:id/notes
- GET /dashboard/summary
- POST /ai/prospect

## Database

PostgreSQL schema is in database\schema.sql.
