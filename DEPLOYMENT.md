# Deployment Guide — Aqar Mudar (عقار مدر)

Aqar Mudar is a Next.js 14 (App Router) + TypeScript real-estate investment platform
for the Saudi market, backed by PostgreSQL via Prisma. It ships as a multi-stage
Docker image and a `docker-compose.yml` that runs the app alongside its database.

This guide covers: prerequisites, environment configuration, the full Docker image
lifecycle (build / save / load / run), running it with Docker Compose, database
migrations and seeding, verifying a successful deployment, and notes on issues that
were found and fixed while validating this flow end‑to‑end.

---

## 1. Prerequisites

- Docker Engine + Docker Compose v2 (Docker Desktop on Windows/Mac, or `docker` +
  `docker-compose-plugin` on Linux)
- Node.js 20.x and npm — only needed for local (non-Docker) development
- A free TCP port for the app (default `3000`) and one for Postgres (default `5432`)

> **Windows note:** if you already run a native PostgreSQL service, or another
> project's containers, on port `5432`/`3000`, `localhost` port resolution can become
> ambiguous and route to the wrong service. Symptom: `P1000: Authentication failed`
> even though the credentials are correct. Fix: pick different host ports — see
> `DB_PORT` / `APP_PORT` in step 2.

---

## 2. Environment configuration

```bash
cp .env.example .env
```

Generate a strong secret and set it in `.env`:

```bash
openssl rand -base64 32
# paste the result into NEXTAUTH_SECRET="..."
```

Minimum required variables for a working deployment:

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | Postgres connection string |
| `NEXTAUTH_URL` | Public URL of the app (e.g. `http://localhost:3000`) |
| `NEXTAUTH_SECRET` | Session/JWT signing secret (`openssl rand -base64 32`) |

Everything else in `.env.example` (S3, Resend, Twilio, Moyasar, Stripe, Sentry, GA4,
Nafath) is optional — those integrations degrade to safe no-op/console drivers when
unset, which is fine for a first deployment.

Two extra variables control the **host** ports used by `docker-compose.yml` (added
during this hardening pass so the stack doesn't collide with anything else already
using 3000/5432 on the host):

```
APP_PORT=3000   # host port -> container's 3000
DB_PORT=5432    # host port -> container's 5432
```

Change these if those ports are already taken on your machine.

---

## 3. Docker image lifecycle

### 3.1 Remove any existing image for this project

Always start from a clean slate so you know exactly what you're deploying:

```bash
# stop/remove any running containers first
docker compose down

# find and remove old image(s)
docker images --filter=reference='*aqar-mudar*'
docker rmi aqar-mudar:latest   # repeat for any other tags/IDs found
```

### 3.2 Build the new image

```bash
docker build -t aqar-mudar:latest .
```

This is a 3-stage build (`deps` → `builder` → `runner`):
- `deps`: installs npm dependencies with `npm ci` (requires `package-lock.json`)
- `builder`: runs `prisma generate` + `next build`
- `runner`: copies only the built output into a slim `node:20-alpine` runtime,
  running as the non-root `nextjs` user

### 3.3 Save the image to a tar file

Useful for transferring the image to a server without a registry, or for backups:

```bash
mkdir -p dist
docker save -o dist/aqar-mudar.tar aqar-mudar:latest
```

### 3.4 Load it elsewhere

On the target machine:

```bash
docker load -i aqar-mudar.tar
```

---

## 4. Running the stack (Docker Compose — recommended)

`docker-compose.yml` runs Postgres 16 and the app together, with the app waiting for
the database's healthcheck before starting.

```bash
docker compose up --build -d
```

On first boot the app container automatically runs:

```
npx prisma migrate deploy && next start
```

which applies every migration in `prisma/migrations/` to create the schema. Check
progress with:

```bash
docker compose logs -f app
```

Verify it's healthy:

```bash
curl http://localhost:${APP_PORT:-3000}/api/health
# {"status":"ok","checks":{"db":true},...}
```

### Seeding demo data (optional, recommended for a first look)

```bash
docker compose exec app npx tsx prisma/seed.ts
```

Creates demo accounts (password `Password123!` for all):

| Role | Email |
|---|---|
| Admin | admin@aqarmudar.sa |
| Owner | owner@aqarmudar.sa |
| Investor | investor@aqarmudar.sa |
| Engineer | engineer@aqarmudar.sa |

### Stopping / cleaning up

```bash
docker compose down          # stop, keep data volumes
docker compose down -v       # stop and delete DB/upload volumes (full reset)
```

---

## 5. Running the image standalone (no Compose)

If you already have a Postgres instance elsewhere:

```bash
docker network create aqar-net   # optional, only if Postgres is also a container

docker run -d --name aqar-mudar-app \
  -p 3000:3000 \
  -e DATABASE_URL="postgresql://user:pass@your-db-host:5432/aqarmudar" \
  -e NEXTAUTH_URL="https://your-domain.example" \
  -e NEXTAUTH_SECRET="$(openssl rand -base64 32)" \
  aqar-mudar:latest
```

The container's entrypoint runs `prisma migrate deploy` before starting the server,
so the target database's schema is created/updated automatically — no manual `psql`
step required, as long as `prisma/migrations/` is present in the image (it is, by
default, since it's copied in during the build).

---

## 6. Production considerations

- **Database**: use a managed Postgres (RDS, Cloud SQL, Neon, Supabase, etc.) with
  automated backups. Never rely on the `docker-compose` Postgres container in
  production.
- **File storage**: set `STORAGE_DRIVER=s3` and the `S3_*` variables — the default
  `local` driver writes to `public/uploads` inside the container, which is ephemeral
  unless you mount a persistent volume (compose already does this via the `uploads`
  volume, but it won't survive a redeploy to a different host).
- **Secrets**: never bake real secrets into the image. `NEXTAUTH_SECRET`,
  `DATABASE_URL`, API keys, etc. must be injected at **runtime** (env vars, a
  secrets manager, or your platform's env var UI) — not at build time.
- **TLS**: put the app behind a reverse proxy (nginx, Caddy, or your cloud LB) that
  terminates TLS; `NEXTAUTH_URL` must be the public HTTPS URL.
- **Migrations**: always commit `prisma/migrations/` to git and let `prisma migrate
  deploy` (already wired into the container's start command) apply them. Do **not**
  use `prisma db push` against a production database — it has no migration history
  and can silently drop data on schema drift.
- **Reviewed but out of scope of the code**: real business licensing (real-estate
  brokerage license, CMA/SPV structuring for fractional sale), a live Moyasar
  merchant account, Nafath production API keys, ZATCA e-invoicing, and a security
  penetration test are all prerequisites for a real commercial launch — see the
  Arabic README's "المتطلبات الخارجية" section.

---

## 7. Issues found and fixed during this deployment pass

While validating the build and a full clean-database deployment, the following
real, blocking issues were found and fixed:

1. **Missing `package-lock.json`** — the Dockerfile's `deps` stage runs `npm ci`,
   which hard-requires a lockfile. It wasn't committed, so every Docker build
   failed immediately. Fixed by generating and committing `package-lock.json`.

2. **TypeScript build failures** (`npm run build` failed under `next build`'s type
   checking):
   - `app/api/payments/create-intent/route.ts` wrote to a non-existent
     `stripePaymentIntentId` field; the schema's actual field is `providerRef`
     (the convention already used by every other payment route).
   - `lib/auth.ts` had an unsound direct cast from `User | AdapterUser` to a custom
     type; changed to cast through `unknown` first.
   - `lib/stripe.ts` pinned an API version string (`2024-09-30.acacia`) that no
     longer matches the installed `stripe` SDK's expected literal type; bumped to
     `2025-02-24.acacia`.

3. **Build-time environment validation crash** — `lib/env.ts` validates
   `DATABASE_URL`/`NEXTAUTH_URL`/`NEXTAUTH_SECRET` with Zod at module load time,
   and throws under `NODE_ENV=production` (which `next build` sets automatically).
   Next's "Collecting page data" step imports API routes, which triggered this
   during the Docker build with no env vars present. Fixed by supplying build-time
   placeholder values via Dockerfile `ARG`s — safe because none of these are
   `NEXT_PUBLIC_*`, so they never reach the client bundle; real values are supplied
   at container runtime and fully override the placeholders.

4. **No database schema was ever created** (the most serious issue) — the
   repository had no `prisma/migrations/` directory. The Dockerfile's start command,
   `npx prisma migrate deploy`, silently no-ops when there are no migration files
   ("No migration found... No pending migrations to apply") — it does **not** fail,
   it just does nothing. The container would start and report itself healthy while
   every page touching the database (`/properties`, `/api/properties`, etc.) threw
   a 500 error, because the tables never existed. Fixed by generating a real initial
   migration (`prisma migrate dev --name init`) against a live Postgres instance and
   committing `prisma/migrations/20260827152900_init/` — `migrate deploy` now
   correctly creates the full schema on first boot against any fresh database.

5. **Fixed host ports in `docker-compose.yml`** — `5432:5432` and `3000:3000` were
   hardcoded, which collides with any other Postgres/app already using those ports
   on the host (this is what caused the `P1000` authentication errors during
   testing — a native Postgres service and Docker's own port-forwarder were both
   bound to the same ports, so `localhost` connections landed on the wrong server).
   Made both configurable via `${APP_PORT:-3000}` / `${DB_PORT:-5432}` env vars.

After these fixes, a full clean-slate deployment (`docker compose down -v` then
`docker compose up --build -d`) was verified to: build successfully, apply the
migration automatically, pass `/api/health`, and serve `/properties` and
`/api/properties` without errors, both empty and after seeding.
