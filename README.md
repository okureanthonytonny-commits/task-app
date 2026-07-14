# task-app

A full-stack task management app with user authentication and priority levels — built as a standalone project to demonstrate React + FastAPI + PostgreSQL integration.

## Tech stack
- **Frontend**: React (Vite), Bootstrap
- **Backend**: FastAPI (Python), Docker
- **Database**: PostgreSQL
- **Deployment**: Vercel (frontend), Render (backend) — **currently offline**

## Architecture summary
```
task-app/
├── frontend/          # React (Vite) application
├── backend/           # FastAPI service + Docker config
├── docker-compose.yml # Services orchestration
└── .gitignore
```
Simple separation of frontend and backend, with Docker Compose for local development.

## Setup / run
1. **Clone**:
   ```bash
   git clone https://github.com/okureanthonytonny-commits/task-app.git
   cd task-app
   ```
2. **With Docker Compose**:
   ```bash
   docker-compose up
   ```
3. **Or manually**:
   - Backend: `cd backend`, set up venv, install dependencies, run `uvicorn main:app --reload`
   - Frontend: `cd frontend`, `npm install`, `npm run dev`

## What's implemented vs in-progress
- **Implemented**: Task CRUD with priority levels, user authentication, full-stack integration.
- **In-progress / offline**: Live deployments (Vercel + Render) are no longer available.

> **Note**: This is a **standalone project** — not part of the marketplace iteration series.