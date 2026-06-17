# Booktracker Frontend

Angular frontend for Booktracker.

## Tech stack

- Angular 20
- TypeScript
- Bootstrap 5

## Main areas

- Authentication (`/login`, `/register`, password reset)
- Book catalog and book details
- Personal library and user libraries
- Social dashboard, recommendations, friends, and notifications
- Admin pages (`/admin/*`)

## Prerequisites

- Node.js 20+
- npm 10+

## Install

```bash
cd frontend
npm install
```

## Run (development)

```bash
cd frontend
npm start
```

App URL: `http://localhost:4200`

## Build and test

```bash
cd frontend
npm run build
npm test -- --watch=false --browsers=ChromeHeadless
```

The frontend expects the backend API at `http://localhost:8080/api` (see `src/environments/environment.ts`).
