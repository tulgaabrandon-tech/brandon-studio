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

The studio app (`workspace/`) follows **Adobe Spectrum 2**, both in how it works and how it looks. Styles: `workspace/src/style.css`, then `workspace/src/spectrum.css` on top (spectrum.css wins).

- **Look:** Spectrum 2 gray scale (canvas gray-75, chrome gray-50, cards white; dark theme uses Spectrum's dark grays), font Source Sans 3 (Adobe's open sibling of Adobe Clean, covers Өө Үү), body 14px, sentence-case headings with no letter-spacing.
- **Components:** pill buttons with bold labels. Default buttons use the gray "secondary fill" and the main call to action is solid BrandOn red `#DA1F34` (dark `#E8273D`). Action buttons are quiet with 8px corners. Fields have a 2px border and 8px corners. Badges have 7px corners and a subtle fill. Cards are flat with a 1px gray-200 border and 12px corners. Popovers, dialogs and bars are solid with Spectrum shadows: no glass, no neumorphism, no springy shape morphs. Component heights are 24, 32, 40 and 48px.
- **Colour meaning:** red is for the main action, urgency and loss. Spectrum blue is for selection, focus and information. Green means money in or done, orange means waiting or owed. Selected toggles use the dark neutral fill.
- **Frame:** workspaces (Today, Review, Production, Planning, Money), a tools rail, a left panel, the canvas, the inspector and a status bar. Click selects, double-click or Enter opens.

Text contrast must be at least 4.5:1 in both modes. Every state has a text label, not just a colour. Respect `prefers-reduced-motion`.
