# BrandOn Studio

Internal tool for Brand On Creative House (brand-on.mn). The agency gets 3 to 4 new clients a month asking for decks, logos, branding, design systems, storyboards and web demos. The tool is organised around **jobs and playbooks, not clients**: every request is a job that runs on the playbook for its type.

## Run

```
npm install
npm run dev      # http://localhost:5173, reads and writes /jobs through the local API
npm run build    # static build in /dist, read-only preview of the bundled jobs
```

## Structure

- `jobs/<id>/` one folder per job, the source of truth
  - `job.json` type, title, client, owner, created, due, stage (0 to 3), approved, waitingOn, rounds, hours, preview, comments, qa
  - `brief.md` the brief
  - `rules.md` client-specific rules that QA enforces, one per line
  - `decisions.md` dated log of decisions; append, never rewrite
  - `work/` the actual deliverable files
- `playbooks/<type>.json` stages, deliverable files, template, default days, rounds, hours, QA checks
- `studio.json` studio settings: who signs off each gate, team
- `server/jobsApi.js` Vite dev middleware: `GET/POST /api/jobs`, `GET/PATCH /api/jobs/:id`, `GET/PATCH /api/studio`
- `src/lib/api.js` data layer, falls back to bundled files when no server (hosted preview)
- `src/lib/jobs.js` stages, flags (qa, needs, over, client, done, ok)
- `src/components/ui.jsx` UI kit, `src/components/Shell.jsx` app chrome
- `src/views/` Jobs, Workspace, Control, NewRequest, Library, UISystem
- `src/styles/app.css` tokens and all styles

Job ids: `YYYY-MM-<client-slug>-<type>`. Stages: Brief, Draft, Review, Deliver. Approving a gate moves the job to the next stage and appends to `decisions.md`. Approving Deliver sets `approved: true` and closes the job.

## Working on jobs as Claude

When asked to start or work on a job:
1. Read `jobs/<id>/brief.md`, `rules.md`, `decisions.md` and the playbook for its type.
2. Put deliverables in `jobs/<id>/work/`.
3. Update `job.json` (stage, qa, preview) and append a line to `decisions.md` for every decision.
4. Never break a rule in `rules.md`.

## Copy rules (all output: UI copy, job files, deliverables, commits)

- **Never use em dashes.** Use colons, commas or periods.
- Mongolian copy must read as written natively, not translated.
- Fonts must cover Mongolian Cyrillic including Өө Үү.

## UI rules

Brand: red `#DA1F34` (dark mode `#E8273D`), near-black and white, font Onest (stand-in for Gramatika, which needs a web license). Light and dark mode.

Three layers, each with one job:
- **Flat for reading**: cards, job cards, tables, lists, comments, previews, forms. Hairline border, subtle lift on hover.
- **Soft (neumorphism) for touching**: switches, segmented tabs, choice tiles, icon buttons, active nav item, overview stats. Raised means pressable, sunken means on or selected. Soft shadows only work on a matching surface, so `.card` recomputes its own shadow colors.
- **Glass for what floats**: sticky top bar, notifications popover, command palette, job action bar, labels on previews, toasts, mobile nav. Never on a plain surface, never for long text. Has a solid fallback.

Also: inputs are flat with a real border and a red focus ring. The primary button is solid red, never soft. Red is only for action, alerts, progress and focus. Text contrast at least 4.5:1 in both modes; every state has a text label, not just a color or shadow. Respect `prefers-reduced-motion`.
