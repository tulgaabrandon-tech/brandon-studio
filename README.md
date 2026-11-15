# BrandOn Studio

Internal studio tool for Brand On Creative House. Jobs and playbooks for decks, logos, branding, design systems, storyboards and web demos.

## Start

```
npm install
npm run dev
```

Open http://localhost:5173. In dev mode the tool reads and writes the real job folders in `/jobs`, so the tool and Claude work on the same files.

`npm run build` makes a static site in `/dist`. Hosted without the dev server, it shows the bundled jobs as a read-only preview.

See `CLAUDE.md` for structure, job format and UI rules.
