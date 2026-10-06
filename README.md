# Test Case Repository

A small local web app for manual test cases across several projects — one per
country — with a Pass / Fail run status on every case and an overview dashboard.
Cases live in SQLite and can be written in the app or imported from Patrol tests.

## Run it

```bash
cd ~/Desktop/crocobet-test-cases
npm start                 # → http://localhost:8787
```

No `npm install`: there are no dependencies. SQLite comes from `node:sqlite`,
built into Node 22.5+.

First time only, to load the seed data:

```bash
npm run seed
```

> The app needs the server. Opening `index.html` over `file://` shows a message
> instead of the app, because the cases are in the database, not in the page.

## Projects

| Project | Cases | Source |
|---|---|---|
| 🇬🇪 Crocobet Georgia | 148 | written from the Patrol tests in `crocobet-mobile-app/integration_test` |
| 🇵🇱 Crocobet Poland | 3 | skeleton to build on |

The project is picked from the menu next to the logo. The choice goes into the
URL (`?project=crocobet-pl`), so a view can be bookmarked or shared, and is
remembered for next time. **All projects** in that menu opens the dashboard;
**New project** creates one.

## Features

- **Pass / Fail per case** — the control on each case row. Clicking the active
  one clears it back to *Not run*. Stored per project in SQLite and shared by
  every browser that opens the app.
- **Writing cases in the app** — `+` on a group header opens the case form
  (ref, title, tags, precondition, and a step list with *Step* / *Expected
  result* rows that can be added, removed and reordered). The pencil on a case
  edits or deletes it. Suites and groups have their own forms in the sidebar.
- **Overview dashboard** — one card per project with totals, Passed / Failed /
  Not run, a progress bar and when it last changed.
- full-text search over ref, title, tags, preconditions, steps and expected
  results (`/` focuses it, `Esc` clears)
- filters: all / Passed / Failed / Not run / Smoke (`FAV-SMOKE`)
- dark and light theme, print stylesheet (`Cmd+P` gives a clean PDF)

`FAV-BUG` and `FAILED-TEST` are plain tags shown on the card. They never decide
a case's Pass / Fail status — that is set by hand.

## Structure

```
crocobet-test-cases/
├── index.html
├── server.js                  static files + /api/* routing
├── package.json               npm start / seed / import:patrol
├── api/
│   ├── projects.js            projects, and the render tree
│   ├── cases.js               cases, suites, groups
│   ├── statuses.js            Pass / Fail
│   ├── overview.js            dashboard counters
│   └── _respond.js            shared JSON helpers
├── lib/
│   ├── db.js                  schema, migrations, connection
│   └── store.js               all data access
├── scripts/
│   ├── seed-from-data.js      seeds/*  → database
│   └── import-patrol.js       *_test.dart → database
├── seeds/
│   ├── crocobet-ge/           the 148 Georgian cases, with steps
│   └── crocobet-pl/           skeleton
├── db/crocobet.db             created on first run, git-ignored
└── assets/
    ├── css/style.css
    └── js/{app,editor,overview}.js
```

## Database

One SQLite file, `db/crocobet.db`, in WAL mode with every write in a transaction
(verified with 60 parallel writes).

```sql
projects   (id, name, name_ka, country, flag, platform, framework, position)
suites     (project_id, id, name, name_ka, summary, icon, position)
groups     (project_id, id, suite_id, name, file, precondition, position)
cases      (id, project_id, group_id, ref, title, tags, merged,
            precondition, steps, source, position, created_at, updated_at)
statuses   (project_id, case_id, status, at)
status_log (id, project_id, case_id, ref, status, at)
```

`tags`, `merged` and `steps` are JSON columns. Statuses key on `case_id`, so
renaming a case's ref does not orphan its result, while `status_log` also keeps
the ref so history survives a deleted case. `(project_id, ref)` is unique, which
means Georgia and Poland can use the same ref with no interference.

Reading the history of a project:

```bash
node -e "const s=require('./lib/store');console.table(s.statuses.history('crocobet-ge', 20))"
```

## API

```
GET    /api/projects                      list with case counts
GET    /api/projects?id=&tree=1           suites + groups + cases, ready to render
POST   /api/projects                      create   { id, name, flag, … }
PUT    /api/projects?id=                  edit
DELETE /api/projects?id=                  delete, cascading

POST   /api/cases?kind=case&project=      create   { groupId, ref, title, tags, steps, … }
PUT    /api/cases?kind=case&id=           edit
DELETE /api/cases?kind=case&id=           delete
         kind=suite | group behave the same, with &project= and a string id

GET    /api/statuses?project=             { statuses: { ref: { status, at } } }
GET    /api/statuses?project=&history=1   recent changes
PUT    /api/statuses?project=             { ref, status }   passed | failed | untested

GET    /api/overview                      per-project counters
```

Validation lives in `lib/store.js`: ref and title are required, a case needs at
least one complete step, and a duplicate ref inside a project is rejected with
409.

## Adding cases

**By hand** — `+` on a group header. This is the normal path for a new country.

**From Patrol tests:**

```bash
npm run import:patrol -- ~/Desktop/GitLab/crocobet-mobile-app/integration_test \
  --project crocobet-ge --dry      # list what would be imported
npm run import:patrol -- ~/path/to/integration_test --project <id>
```

It maps one directory to a suite and one `*_test.dart` file to a group, and
reads the ref, title and tags out of each `patrolTest(...)`. Re-running it is
safe: existing cases are matched by ref, keep their steps and are never moved to
another group.

**Limitation worth knowing:** steps and expected results cannot be derived from
dart source — they come from reading the page objects. Imported cases therefore
arrive with an empty step list, and the script prints which refs need filling in
the app. The 147 Georgian cases already have theirs because they were written by
hand into `seeds/crocobet-ge/`.

**From the seed files** — `npm run seed` loads every folder under `seeds/`, or
`npm run seed crocobet-pl` for one. Idempotent, matched on `(project_id, ref)`.

## Do the statuses survive closing the page?

Yes. They are rows in `db/crocobet.db` on your machine, not browser storage, so
they are shared by every browser and every person who opens the app. The browser
also keeps a copy in `localStorage` purely as a safety net: if a write cannot
reach the server a warning strip appears and the value is kept locally until the
server is back.

To back them up, copy `db/crocobet.db`.

## Hosting it elsewhere

`server.js` is for running locally. Vercel's filesystem is read-only and
ephemeral, so `db/crocobet.db` would not survive there; a hosted SQL store such
as Turso (serverless SQLite, same SQL) is the natural fit, and only `lib/db.js`
would need to change. Nothing in this repo is deployed.


  Docker-ზე გაშვება

  1. შექმენი Dockerfile:

  FROM node:18-alpine
  WORKDIR /app
  COPY package.json ./
  RUN npm install --production
  COPY . .
  EXPOSE 8787
  CMD ["node", "server.js"]

  2. აბილდე იმიჯი:

  docker build -t crocobet-dashboard .

  3. გაუშვი კონტეინერი:

  docker run -d -p 8787:8787 --name crocobet crocobet-dashboard

  4. გახსენი ბრაუზერში:

  http://localhost:8787

  ---
  სასარგებლო ბრძანებები:

  - გაჩერება: docker stop crocobet
  - წაშლა: docker rm crocobet
  - ლოგები: docker logs crocobet
  - რესტარტი: docker restart crocobet