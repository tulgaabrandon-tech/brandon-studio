// Local API for the studio. Runs inside `npm run dev` and reads/writes the
// real job folders in /jobs, so the tool and Claude work on the same files.
import fs from 'node:fs'
import path from 'node:path'

const ROOT = process.cwd()
const JOBS = path.join(ROOT, 'jobs')
const STUDIO = path.join(ROOT, 'studio.json')
const PLAYBOOKS = path.join(ROOT, 'playbooks')
const DOCS = ['brief.md', 'rules.md', 'decisions.md']

const readJSON = (p, fallback) => { try { return JSON.parse(fs.readFileSync(p, 'utf8')) } catch { return fallback } }
const writeJSON = (p, data) => fs.writeFileSync(p, JSON.stringify(data, null, 2) + '\n')
const readText = (p) => { try { return fs.readFileSync(p, 'utf8') } catch { return '' } }
const safeId = (id) => /^[a-z0-9][a-z0-9-]{0,80}$/.test(id)

function slugify(s) {
  const base = String(s).toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  return base || 'job'
}

function listJobs() {
  if (!fs.existsSync(JOBS)) return []
  return fs.readdirSync(JOBS, { withFileTypes: true })
    .filter((d) => d.isDirectory() && fs.existsSync(path.join(JOBS, d.name, 'job.json')))
    .map((d) => readJob(d.name))
    .sort((a, b) => String(b.created || '').localeCompare(String(a.created || '')))
}

function readJob(id) {
  const dir = path.join(JOBS, id)
  const job = readJSON(path.join(dir, 'job.json'), null)
  if (!job) return null
  const docs = {}
  for (const f of DOCS) docs[f.replace('.md', '')] = readText(path.join(dir, f))
  return { ...job, id, docs }
}

function createJob({ client, type, brief, owner }) {
  const playbook = readJSON(path.join(PLAYBOOKS, `${type}.json`), null)
  if (!playbook) throw new Error(`Unknown job type: ${type}`)
  const date = new Date()
  const stamp = date.toISOString().slice(0, 7)
  let id = `${stamp}-${slugify(client || 'new-client')}-${type}`
  let n = 2
  while (fs.existsSync(path.join(JOBS, id))) id = `${stamp}-${slugify(client || 'new-client')}-${type}-${n++}`
  const dir = path.join(JOBS, id)
  fs.mkdirSync(path.join(dir, 'work'), { recursive: true })
  const due = new Date(date.getTime() + (playbook.defaultDays || 10) * 864e5).toISOString().slice(0, 10)
  const job = {
    type,
    title: playbook.label,
    client: client || '[New client]',
    owner: owner || 'BO',
    created: date.toISOString(),
    due,
    stage: 0,
    approved: false,
    waitingOn: null,
    rounds: { used: 0, quoted: playbook.rounds || 2 },
    hours: { used: 0, budget: playbook.hours || 12 },
    preview: { color: '#DA1F34', title: 'Шинэ төслийн танилцуулга', subtitle: '' },
    comments: [],
    qa: playbook.qa.map((name) => ({ name, status: 'pending', note: 'Not run yet' })),
  }
  writeJSON(path.join(dir, 'job.json'), job)
  fs.writeFileSync(path.join(dir, 'brief.md'), `# Brief\n\n${brief || 'Paste the brief here.'}\n`)
  fs.writeFileSync(path.join(dir, 'rules.md'), `# Rules for this job\n\nClient-specific rules that QA enforces. One per line.\n\n- No em dashes in any copy.\n`)
  fs.writeFileSync(path.join(dir, 'decisions.md'), `# Decisions\n\n- ${date.toISOString().slice(0, 10)}: Job started from the ${playbook.label} playbook.\n`)
  return readJob(id)
}

function patchJob(id, patch) {
  const file = path.join(JOBS, id, 'job.json')
  const job = readJSON(file, null)
  if (!job) throw new Error('Job not found')
  const allowed = ['stage', 'approved', 'waitingOn', 'comments', 'qa', 'owner', 'due', 'rounds', 'hours', 'preview']
  for (const k of Object.keys(patch)) if (allowed.includes(k)) job[k] = patch[k]
  writeJSON(file, job)
  if (patch.decision) {
    const dfile = path.join(JOBS, id, 'decisions.md')
    fs.appendFileSync(dfile, `- ${new Date().toISOString().slice(0, 10)}: ${String(patch.decision).replace(/\n/g, ' ')}\n`)
  }
  return readJob(id)
}

function body(req) {
  return new Promise((resolve, reject) => {
    let data = ''
    req.on('data', (c) => { data += c; if (data.length > 1e6) reject(new Error('Too large')) })
    req.on('end', () => { try { resolve(data ? JSON.parse(data) : {}) } catch (e) { reject(e) } })
  })
}

export function jobsApi() {
  return {
    name: 'brandon-studio-jobs-api',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url.startsWith('/api/')) return next()
        const send = (code, data) => { res.statusCode = code; res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify(data)) }
        try {
          const url = new URL(req.url, 'http://local')
          const parts = url.pathname.split('/').filter(Boolean) // ['api', 'jobs', id]
          if (parts[1] === 'jobs' && parts.length === 2 && req.method === 'GET') return send(200, listJobs())
          if (parts[1] === 'jobs' && parts.length === 2 && req.method === 'POST') return send(201, createJob(await body(req)))
          if (parts[1] === 'jobs' && parts.length === 3) {
            if (!safeId(parts[2])) return send(400, { error: 'Bad id' })
            if (req.method === 'GET') { const j = readJob(parts[2]); return j ? send(200, j) : send(404, { error: 'Not found' }) }
            if (req.method === 'PATCH') return send(200, patchJob(parts[2], await body(req)))
          }
          if (parts[1] === 'studio' && req.method === 'GET') return send(200, readJSON(STUDIO, {}))
          if (parts[1] === 'studio' && req.method === 'PATCH') {
            const cur = readJSON(STUDIO, {}); const next = { ...cur, ...(await body(req)) }; writeJSON(STUDIO, next); return send(200, next)
          }
          return send(404, { error: 'Unknown endpoint' })
        } catch (e) {
          return send(500, { error: e.message })
        }
      })
    },
  }
}
