# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ESE Companion is a full-stack web application for managing HiveMQ Enterprise Security Extension (ESE) databases. It provides a REST API (Node.js/Express) and a Vue 3 UI for administering three independent security domains: MQTT broker auth, Control Panel auth, and REST API auth.

## Commands

### Backend (root)
```bash
npm install                # Install backend dependencies
npx prisma generate        # Generate Prisma client (required after schema changes)
npm run dev                # Start backend with nodemon (HTTP:3001, HTTPS:4001)
npm start                  # Start backend without hot-reload
```

### Frontend (ui/)
```bash
cd ui && npm install       # Install frontend dependencies
cd ui && npm run dev       # Vite dev server with HMR
cd ui && npm run build     # Production build (outputs to ../public/)
cd ui && npm run lint      # ESLint fix for .ts,.js,.vue,.tsx,.jsx
cd ui && npm run typecheck # Vue TypeScript check (vue-tsc --noEmit)
```

### Full Build
```bash
npm run build-app          # Builds UI into public/, installs deps, starts server
```

### Docker
```bash
docker build -t ese-companion --platform linux/amd64 .
docker run --env=TOKEN_KEY="secret" --env=DATABASE_URL="mysql://user:pass@host:3306/hivemq" -p 3001:3001 ese-companion
```

### Environment Variables
- `DATABASE_URL` — Prisma connection string (MySQL, PostgreSQL, or MariaDB)
- `TOKEN_KEY` — JWT signing secret

## Architecture

### Backend (`src/`)
Express server with modular route registration. Each module exports `function(app)` that registers routes on the Express instance.

- **`src/index.js`** — Entry point. Sets up Express, Helmet, CORS, Morgan, static file serving, and imports all route modules.
- **`src/mqtt/`** — MQTT broker user/role/permission CRUD (routes prefixed `/api/mqtt_*`)
- **`src/cc/`** — Control Panel user/role/permission CRUD (routes prefixed `/api/cc_*`)
- **`src/rest_api/`** — REST API user/role/permission CRUD (routes prefixed `/api/rest_api_*`)
- **`src/analytics/`** — Dashboard statistics aggregation
- **`src/middleware/auth.js`** — JWT verification middleware (`x-access-token` header)
- **`src/helpers/cryptoHelper.js`** — HiveMQ ESE password hashing (PBKDF2 via Java helper JAR + Node crypto fallback)

All three domains (MQTT, CC, REST API) follow identical CRUD patterns for users, roles, permissions, and their associations.

### Frontend (`ui/src/`)
Vue 3 + Vite + Vuetify 3 + TypeScript application.

- **`pages/`** — File-based routing via `vite-plugin-pages`. Filename = route path (e.g., `mqtt-accounts.vue` → `/mqtt-accounts`).
- **`layouts/`** — Layout system via `vite-plugin-vue-layouts`
- **`plugins/`** — Vuetify, Axios (with JWT interceptor), auth helpers, web fonts
- **`router/`** — Vue Router with auth guards (redirects unauthenticated users to `/login`)
- **`@core/`**, **`@layouts/`** — Shared components and layout utilities

### Database (`prisma/`)
Prisma ORM with schema variants for different databases:
- `schema.prisma` — Active schema (copy from `.mysql` or `.postgres` variant)
- `schema.prisma.mysql` / `schema.prisma.postgres` — Database-specific schemas

Three parallel table groups (`mqtt_*`, `cc_*`, `rest_api_*`) each containing: users, roles, permissions, user_roles, role_permissions, user_permissions.

### Authentication Flow
1. `POST /api/login` validates credentials against `rest_api_users` table and checks for `eseapi_admin` role
2. Returns JWT token (2-hour expiry)
3. Frontend stores token in Pinia auth store; Axios interceptor attaches it as `x-access-token` header
4. Password hashing uses HiveMQ ESE's Java-based helper (`ese-file-helper.jar`) with Node crypto as fallback

### Build Output
The frontend builds into `public/` at the project root, which Express serves as static files. In production, the Docker image includes a JRE for the ESE password hashing helper.
