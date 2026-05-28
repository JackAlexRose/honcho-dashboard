# Honcho Memory Dashboard

Terminal-styled observability dashboard for a self-hosted [Honcho](https://github.com/plastic-labs/honcho) memory server.

## What it shows

- **Peer cards** — what Honcho has learned about each peer (facts extracted from conversations)
- **Conclusions** — derived insights from the deriver background worker
- **Deriver queue** — pending, in-progress, and completed work units
- **Sessions** — conversation sessions tracked by Honcho
- **Peer detail pages** — deep dive per peer with card, representation, and conclusion history

## Stack

- Next.js 16 (App Router, TypeScript)
- Tailwind CSS v4
- Departure Mono font
- Dark terminal aesthetic (#3C3C3C background, green/amber/red status)

## Running locally

```bash
npm install
npm run dev -- -p 3001
```

The dashboard expects a Honcho API at `http://localhost:8000`. Configure the workspace in `src/lib/honcho.ts`.

## Production

```bash
npm run build
npm start -- -p 3001
```

A systemd service file is included (`honcho-dashboard.service`).
