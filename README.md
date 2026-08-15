# quill-base-09ce — Quill EnvGuard

Review your `.env` location and contents **before** killing processes, then copy secrets into your password manager.

## Getting started

```bash
cp .env.example .env
node src/index.js
```

Open `http://localhost:3000`.

- `GET /` — EnvGuard UI (path, secrets, process shutdown gate)
- `GET /health` — `{ "ok": true }`
- `GET /api/env` — env path + contents
- `PUT /api/env` — update env file
- `GET|POST /api/processes` — list / start demo workers
- `DELETE /api/processes/:id` — kill one (requires confirmation)
- `POST /api/processes/kill-all` — kill all (requires confirmation)
