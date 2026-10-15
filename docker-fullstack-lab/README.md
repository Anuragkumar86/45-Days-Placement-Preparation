# Docker Full-Stack Practical Lab

A small, production-oriented teaching project: **Next.js frontend + Node.js/Express API + PostgreSQL**, managed by Docker Compose.

The goal is to practise Docker images, multi-stage builds, `.dockerignore`, service discovery, network isolation, secret files, health checks, startup ordering, one-shot migrations, non-root application containers, logs, container lifecycle, resource inspection, and PostgreSQL volume persistence.

> This is a learning lab, not a hardened production deployment. It demonstrates good defaults, but real deployments still need a protected secret store, backups and restore tests, image scanning, TLS/reverse proxy configuration, an explicit release process, and environment-specific hardening.

## Architecture

- **Frontend**: Next.js standalone server on container port `3000`; published only to host loopback by default.
- **API**: Express on container port `4000`; not published directly to the host.
- **Database**: PostgreSQL 17; not published to the host. A named volume stores database files.
- **Networks**: `web` connects the frontend and API. `data` connects API, migration task, and PostgreSQL, and is marked internal. The frontend is not attached to the database network.
- **Secrets**: PostgreSQL administrator password and application-role password are mounted as files. The API receives only the application-role password.
- **Migrations**: A one-shot `migrate` service waits for PostgreSQL to be healthy and exits after applying unapplied SQL migrations. The API waits for the migration service to complete successfully.

The frontend browser code calls the same-origin `/api/notes` route. That Next.js route handler calls `http://api:4000` from inside the frontend container, so the browser does not need to resolve Docker-only DNS names.

## Prerequisites

- Docker Desktop running on Windows with Linux containers/WSL 2 enabled.
- Node.js and npm available in PowerShell to generate the project lockfiles.
- Internet connectivity on the first run to download npm packages and container images.

## Step 1 — Prepare local configuration and secrets (PowerShell)

Open PowerShell in the extracted `docker-fullstack-lab` directory:

```powershell
Copy-Item .env.example .env
New-Item -ItemType Directory -Force secrets | Out-Null
Set-Content -NoNewline -Path .\secrets\postgres_admin_password.txt -Value 'LocalOnly_Admin_ChangeMe_2026!'
Set-Content -NoNewline -Path .\secrets\app_db_password.txt -Value 'LocalOnly_App_ChangeMe_2026!'
```

These are development-only sample values. Do not reuse them in a real deployment. The `.gitignore` excludes `.env` and the two secret files.

## Step 2 — Generate lockfiles

The archive intentionally leaves `package-lock.json` out so npm can generate it for the current package metadata and platform. Run:

```powershell
Push-Location .\backend
npm install
Pop-Location

Push-Location .\frontend
npm install
Pop-Location
```

This produces `backend/package-lock.json` and `frontend/package-lock.json`. The Dockerfiles use `npm ci`, which requires a lockfile. Host `node_modules` directories are excluded by each `.dockerignore` and won't be copied into the images.

## Step 3 — Validate the Compose configuration

```powershell
docker compose config
```

This checks and renders the Compose configuration. Review its output before sharing it because effective configurations may include sensitive values in other projects.

## Step 4 — Build and start the stack

```powershell
docker compose up --build -d
```

Compose builds the frontend and backend images, starts PostgreSQL, waits for the database health check, runs the one-shot migration container, waits for migration success, starts the API, waits for API health, and then starts the frontend.

The first run can take several minutes because base images and npm dependencies must be downloaded. Subsequent builds can reuse cached layers.

Check all service states, including the exited one-shot migration container:

```powershell
docker compose ps -a
```

Inspect logs:

```powershell
docker compose logs --tail 100 postgres
docker compose logs --tail 100 migrate
docker compose logs --tail 100 api
docker compose logs --tail 100 frontend
```

Open **http://localhost:3000**. Add a note through the form. The UI calls the Next.js route handler, which forwards the request to the API through Docker's internal service DNS name `api`; the API writes to PostgreSQL.

## Step 5 — Observe the important Docker behaviors

### A. Verify service discovery and network boundaries

```powershell
docker compose exec api node -e "require('node:dns').lookup('postgres', (e, a) => { if (e) { console.error(e); process.exit(1) } console.log(a) })"
docker compose exec api node -e "require('node:dns').lookup('frontend', (e, a) => { console.log(e ? 'frontend is not on the data/web network expected by this container' : a) })"
```

The API is attached to both `web` and `data`, so `frontend` will normally resolve from API because it shares `web`. The frontend is not on `data`; test the intended boundary from the frontend instead:

```powershell
docker compose exec frontend node -e "require('node:dns').lookup('postgres', (e, a) => { if (e) { console.log('Expected: frontend cannot resolve postgres on its web-only network') } else { console.log('Unexpected database name resolution:', a) } })"
```

DNS resolution is not the same as permission to connect to a service. Confirm the configured network memberships with:

```powershell
docker network ls
docker network inspect docker-fullstack-lab_web
docker network inspect docker-fullstack-lab_data
```

Compose may label network names differently if the project name is changed.

### B. Inspect health and resource use

```powershell
docker compose ps
docker inspect docker-fullstack-lab-api-1
docker stats
```

Container names depend on Compose's project naming. Prefer service-scoped commands where possible, such as `docker compose logs api` and `docker compose exec api sh` (if a shell exists).

### C. Verify the API is not publicly published

```powershell
docker compose port api 4000
```

No published host port is configured for the API, so this should not show a host mapping. The API remains reachable to authorized peer services on the shared `web` network.

### D. Verify the PostgreSQL volume

```powershell
docker volume ls
docker volume inspect docker-fullstack-lab_postgres_data
```

The volume name may include your Compose project name. Use the exact name printed by `docker volume ls`.

### E. Stop and start without losing data

```powershell
docker compose down
docker compose up -d
```

Add another note in the UI and repeat the sequence. The named volume is preserved by `docker compose down`, so the database records should remain.

**Do not run `docker compose down -v` until you intentionally want to delete this lab's named database volume.** Removing the volume destroys the database files stored there.

## Step 6 — Controlled experiments

Perform these after the stack works:

1. **Container recreation:** `docker compose up -d --force-recreate api`. Confirm the notes remain because data belongs to the database volume, not the API container.
2. **Image rebuild and cache:** change a visible UI string in `frontend/app/page.js`, then run `docker compose up --build -d frontend`. Observe which build steps are cached.
3. **Wrong hostname:** temporarily change `DB_HOST` for the API from `postgres` to `localhost` in `compose.yaml`, recreate the API, and watch `docker compose logs api`. Restore the correct service name afterwards. The app should fail readiness or API requests because `localhost` is the API container itself.
4. **Health check behavior:** temporarily change the API health-check URL to a nonexistent path, then recreate the API. Observe its `unhealthy` status. Restore `/ready`. Remember that standalone Docker's restart policy does not automatically restart a merely unhealthy container.
5. **Migration behavior:** add a new, numbered `.sql` migration in `backend/migrations`. Rebuild and recreate the `migrate` service through `docker compose up --build -d`; verify `docker compose logs migrate` and then verify the app still works. Do not edit an already-applied migration; create a new one.
6. **Secret handling:** inspect the Compose configuration and verify that secret file contents are not written in the YAML file or Dockerfile. Do not paste secret file contents into terminal transcripts or public logs.

## Step 7 — Troubleshooting guide

- **Compose says a secret file is missing:** complete Step 1 and check the path exactly.
- **`npm ci` fails about a missing lockfile:** complete Step 2 in both app directories.
- **Next.js build fails:** inspect `docker compose build frontend`; confirm `output: "standalone"` and that `public/` exists.
- **Database initialization fails:** inspect `docker compose logs postgres`. For this learning lab, if you changed database-init scripts after a volume was already initialized, remember that official PostgreSQL init scripts run only when the data directory is empty. Do not delete the volume without understanding the data-loss consequences.
- **Migration exits unsuccessfully:** inspect `docker compose logs migrate`, ensure PostgreSQL is healthy, and check that the application role has schema permissions.
- **API is unhealthy:** inspect `docker compose logs api`; confirm migrations succeeded, the secret file is mounted, and `DB_HOST=postgres`.
- **Frontend returns a 502:** inspect `docker compose logs frontend` and `docker compose logs api`; the internal `API_INTERNAL_URL` must be `http://api:4000`.
- **Port 3000 is already occupied:** set `FRONTEND_PORT=3001` in `.env`, then recreate the frontend with `docker compose up -d --force-recreate frontend`.
- **The app cannot reach the database from the browser:** browser code should call the same-origin frontend route `/api/notes`, not the Docker-only hostname `postgres` or `api`.

## Step 8 — Stop the application safely

```powershell
docker compose down
```

This removes the application's containers and networks while keeping the named database volume. To reset all data, you may explicitly remove the volume only after deciding that the database records are disposable. Avoid using `down -v` on any deployment that contains data you need.

## What this lab demonstrates

- Multi-stage Dockerfiles and non-root application processes.
- `.dockerignore` and npm lockfiles.
- Compose services, build contexts, health checks, and dependency conditions.
- One-shot, versioned database migrations.
- User-defined networks and service-name DNS.
- An internal database network and no public DB/API ports.
- File-mounted secrets and least-privilege application DB user.
- Named volume persistence.
- Logging, inspection, resource monitoring, health checks, failure reproduction, and rollback thinking.

## Important production caveats

This project keeps its scope small for training. A production system should also use a proper secrets manager and credential-rotation workflow; keep images up to date and scan them; use HTTPS and a suitable reverse proxy/public ingress; test database backup restoration; establish a migration rollback/forward-fix plan; apply least-privilege schema permissions (including separating migration and runtime DB roles where appropriate); and select resource limits and monitoring thresholds based on measurements. The local loopback port binding is intentional for the lab, not a public production ingress configuration.
