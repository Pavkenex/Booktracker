# Booktracker

Booktracker is a full-stack application for tracking books, managing personal libraries, and social reading interactions.

## Repository structure

- `frontend/` — Angular client application
- `backend/` — Spring Boot REST API
- `package.json` — placeholder root npm manifest (workspace commands are not defined)

## Quick start

### 1) Backend

See `backend/README.md` for complete backend setup.

### 2) Frontend

See `frontend/README.md` for complete frontend setup.

## Running locally

1. Start the backend (`http://localhost:8080`).
2. Start the frontend (`http://localhost:4200`).
3. Open `http://localhost:4200` in your browser.

## Notes

- Frontend calls the API at `http://localhost:8080/api` by default.
- Configure local secrets (database, JWT, email credentials) before running in non-demo environments.
