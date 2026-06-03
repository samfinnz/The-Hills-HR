# HR Project — The Hills System (staff section)

A focused, runnable implementation of the **staff section** of The Hills System — M03 Employee Registry + the M17 HR overlay (foreign-employee compliance, certifications, departments, positions). Built on the **same stack as `../thehills-app/`** (NestJS + Prisma + PostgreSQL) so it can later **merge into the shared Option C backend** as the HR module.

What you get the moment it boots:

- A **unified The Hills System console** at `http://localhost:3001/system`, built from the full design-document set: 21 modules, 6 layers, 9 v1 apps, G1/G2/G3 build gates, integrations, and document inventory.
- An **HR dashboard** at `http://localhost:3001/dashboard`, with renewal queues, evaluations due, probation endings, contractor payments, roster status, and document-checklist gaps.
- A **bilingual TH/EN staff directory** at `http://localhost:3001/staff`, with departments, HOD flags, employment status, certifications, and a **renewal-alerts panel** for any passport / visa / work-permit / certification expiring in the next 60 days.
- A clean **REST API** at `/api/...` covering employees, departments, positions, certifications, compliance, expiring-doc alerts, and stats.
- **Seed data shaped by the real facility** — 25+ employees across all 17 SharePoint department codes (Admin, HR, AC, PU, SM, NU, CN, SU, HK, FB, TE, GA, SE, **HO**, **FI**, **CO**, **AM**), including foreign counselors with visa/work-permit expiry dates that intentionally fall inside the 60-day alert window.

> **Context:** the HR forms (`FO-HR-001..033+`), SOPs (`SOP-HR-001..005`), and Memos (`ME-HR-001..048+`) already exist on the facility's SharePoint — see `../Findings-SharePoint-Review.md` §2. This project is the **runnable model** of what the design's `../Data-HR.md` describes, not a replacement for HumanSoft (which the design treats as an external system the API overlays).

---

## What you need first

- **Docker Desktop** (https://www.docker.com/products/docker-desktop) — runs the whole stack.
- **VS Code** (https://code.visualstudio.com) — to open and edit.
- *(Optional)* **Node 20+** if you want to run the API outside Docker.

Node is **not required** to run it — Docker handles everything.

---

## Run it (one command)

```bash
# 1. from this folder, create your local env file
cp .env.example .env

# 2. build + start the stack (Postgres + API; seed runs automatically on first boot)
docker compose up --build
```

Then open:

| URL | What |
|---|---|
| http://localhost:3001/system | **The unified system console** — 21 modules, 9 apps, build gates, integration spine, and source docs |
| http://localhost:3001/system/apps | The 9 app workspaces |
| http://localhost:3001/system/modules | The 21 module catalogue |
| http://localhost:3001/system/workflows | Cross-module operational workflows |
| http://localhost:3001/system/integrations | External systems and integration boundaries |
| http://localhost:3001/system/roadmap | G1/G2/G3 build roadmap |
| http://localhost:3001/system/documents | Source design-document inventory |
| http://localhost:3001/dashboard | **The HR Dashboard** — queues for renewals, evaluations, probation, contractors, rosters, and documents |
| http://localhost:3001/staff | **The Staff Directory** — bilingual TH/EN, grouped by department, with renewal-alerts panel |
| http://localhost:3001/api/health | Liveness + dependency checks |
| http://localhost:3001/api/system | Unified system overview as JSON |
| http://localhost:3001/api/system/modules | Unified module manifest |
| http://localhost:3001/api/system/apps | Unified app manifest |
| http://localhost:3001/api/system/workflows | Cross-module workflow manifest |
| http://localhost:3001/api/system/integrations | Integration manifest |
| http://localhost:3001/api/employees | List of all employees (JSON) |
| http://localhost:3001/api/employees/stats | Headcount stats by status / term / department |
| http://localhost:3001/api/employees/expiring?days=60 | Renewal alerts (default 60 days) |
| http://localhost:3001/api/departments | The 17 department codes (AD, HR, AC, …) |
| http://localhost:3001/api/positions | All positions, optionally filtered by `?departmentId=…` |
| http://localhost:3001/api/certifications | All certifications, optionally `?employeeId=…` |
| http://localhost:3001/api/compliance/foreign | Foreign-employee compliance records |
| http://localhost:3001/api/rosters | HOD roster authoring records + HumanSoft CSV export |
| http://localhost:3001/api/evaluations | Performance evaluations with KPI/core/functional weighting |
| http://localhost:3001/api/contractors | Contractor registry and service-session payment tracking |
| http://localhost:3001/api/document-checklist | Required personnel-file document checklist |
| http://localhost:3001/api/compliance/annual | Social security, group insurance, and health-checkup compliance |
| http://localhost:3001/api/hr-dashboard | HR dashboard queue: renewals, evaluations, probation, contractors, rosters |

Postgres is published on `localhost:5433` (`5433` not `5432`, to avoid clashing with `../thehills-app/`'s db).

To stop: `Ctrl-C`, then `docker compose down` (add `-v` to also wipe the database volume and re-seed on next boot).

---

## Working in VS Code

```bash
code .
```

Open the folder. To iterate against the running Postgres without Docker:

```bash
cp .env.example .env       # the local DATABASE_URL points at localhost:5433
docker compose up -d hr-db # run only Postgres in the background
npm install
npm run prisma:generate
npm run prisma:push        # create tables from the schema
npm run seed               # populate sample data
npm run start:dev          # hot-reload API on :3001
```

---

## Project layout

```
hr-project/
├── docker-compose.yml         # Postgres + the HR API
├── Dockerfile                 # multi-stage build for the API
├── docker-entrypoint.sh       # prisma db push + seed (if empty) + start
├── .env.example
├── prisma/
│   ├── schema.prisma          # M03 Employee + Dept + Position + Compliance + Certification
│   └── seed.ts                # realistic Hills-shaped sample data
└── src/
    ├── main.ts                # bootstrap (global /api prefix; /staff serves HTML)
    ├── app.module.ts
    ├── prisma/                # PrismaModule + PrismaService
    ├── health/                # GET /api/health
    ├── departments/           # GET /api/departments (+ :id)
    ├── positions/             # GET /api/positions
    ├── employees/             # CRUD + /api/employees/stats + /expiring
    ├── certifications/        # GET /api/certifications
    ├── compliance/            # GET /api/compliance/foreign
    ├── annual-compliance/     # GET /api/compliance/annual
    ├── document-checklist/    # GET /api/document-checklist
    ├── rosters/               # GET/POST /api/rosters + HumanSoft CSV export
    ├── evaluations/           # GET/POST /api/evaluations
    ├── contractors/           # GET/POST /api/contractors + sessions
    ├── dashboard/             # GET /api/hr-dashboard
    └── ui/                    # GET /staff — server-rendered HTML directory
```

---

## How this maps to the design

| Design doc | In this scaffold |
|---|---|
| `../Data-HR.md` (M03 Employee Registry + M17 overlay) | The Prisma schema — Employee with personal info + employment terms + manager chain · ForeignEmployeeCompliance (passport / visa / work permit) · Certification with `isRequiredForRole` |
| `../Findings-SharePoint-Review.md` §2 (the 17 dept codes) | The `Department` table is seeded with all 17 codes (AD/HR/AC/PU/SM/NU/CN/SU/HK/FB/TE/GA/SE/HO/FI/CO/AM), each with TH + EN names |
| `../Data-Administration.md` (renewal-alert pattern, default 60-day lead) | `/api/employees/expiring?days=60` returns every certification + passport/visa/work-permit expiring within the window; the Staff page shows them in a red/amber band |
| `../Integration-Bilingual-Translation.md` (TH/EN as first-class) | Both the schema (`*Th` fields) and the UI (`data-en` / `data-th` attributes with a 🌐 toggle) treat TH and EN as equal |
| `../Architecture-Decision-Monolith-vs-MultiApp.md` (Option C) | Same stack as `../thehills-app/`. Folders are independent so this can later **merge into the shared backend as the HR module**, or stay as the HR Console's own service. |
| `../Modules-Index.md` M17 HR + M18 alerts | The alert pattern, the foreign-employee compliance sub-record, the contractor employment term are all present |

---

## Put it on GitHub

> **One cleanup first:** delete the `.git_BROKEN_…/` folder if you see one — the sandbox can't initialise git on its mounted view of your machine; your local git works fine. *(There is no such folder here unless you copied one in.)*

```bash
git init
git add -A
git commit -m "feat(hr-project): staff section scaffold — NestJS + Prisma + bilingual directory"
```

Then publish — **with the GitHub CLI:**

```bash
gh repo create hr-project --private --source=. --remote=origin --push
```

**Or manually** (after creating an empty repo at github.com/<you>/hr-project):

```bash
git branch -M main
git remote add origin https://github.com/<you>/hr-project.git
git push -u origin main
```

`.env` is git-ignored, so no secrets are committed.

---

## Next steps (when you / IT pick it up)

1. **Reconcile with IT** — confirm whether this should live as a standalone HR Console (per `../Architecture-App-Partition.md`) or merge into `../thehills-app/` as the HR module. Either way, the data model and APIs port directly.
2. **HumanSoft integration** — the design treats HumanSoft as the external HR system this overlays (per `../Data-HR.md`). Add a one-way export endpoint that produces the rosters HumanSoft expects.
3. **More HR forms** — the SharePoint registry lists 33+ HR forms (`FO-HR-001..033+`). The schema covers the master record + compliance + certifications; the rest (Job Description, Training Record, Performance Evaluation, etc.) plug in as related models.
4. **Auth + RBAC** — currently open. Wire `@thehills/rbac` (or Auth.js) when promoting to the shared backend, so the Staff tier (`Architecture-App-Partition.md` §2.3) is enforced.
5. **Renewal-alert delivery** — the data exists; pipe to Telegram / email through n8n (`../Integration-n8n.md`).
6. **`heard_about_us` / `salary_deduction`** and the **DAR change-control workflow** flagged in `Findings-SharePoint-Review.md` §6 — natural next additions.

---

*Generated 2026-05-22 from the design folder. Same stack as `../thehills-app/`, focused on the staff section. Coordinate with IT before going far — this is a foundation for the HR Console (or the HR module of the shared backend).*
