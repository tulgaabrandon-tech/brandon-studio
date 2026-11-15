// Data layer. In `npm run dev` it talks to the local API (server/jobsApi.js),
// which reads and writes the real folders in /jobs. When the built site is
// hosted, there is no server, so it falls back to the job files bundled at
// build time and keeps changes in memory (read-only preview).
import studioBundled from '../../studio.json'

const jobFiles = import.meta.glob('/jobs/*/job.json', { eager: true, import: 'default' })
const docFiles = import.meta.glob('/jobs/*/*.md', { eager: true, query: '?raw', import: 'default' })
const playbookFiles = import.meta.glob('/playbooks/*.json', { eager: true, import: 'default' })

export const PLAYBOOKS = Object.fromEntries(
  Object.entries(playbookFiles).map(([p, v]) => [p.split('/').pop().replace('.json', ''), v])
)

function bundledJobs() {
  return Object.entries(jobFiles).map(([p, job]) => {
    const id = p.split('/')[2]
    const doc = (name) => docFiles[`/jobs/${id}/${name}.md`] || ''
    return { ...structuredClone(job), id, docs: { brief: doc('brief'), rules: doc('rules'), decisions: doc('decisions') } }
  }).sort((a, b) => String(b.created || '').localeCompare(String(a.created || '')))
}

let live = false
let memory = { jobs: [], studio: {} }

async function call(method, url, data) {
  const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: data ? JSON.stringify(data) : undefined })
  if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || res.statusText)
  return res.json()
}

export async function loadAll() {
  try {
    const [jobs, studio] = await Promise.all([call('GET', '/api/jobs'), call('GET', '/api/studio')])
    live = true
    return { jobs, studio, live }
  } catch {
    live = false
    memory = { jobs: bundledJobs(), studio: structuredClone(studioBundled) }
    return { ...memory, live }
  }
}

export async function createJob({ client, type, brief }) {
  if (live) return call('POST', '/api/jobs', { client, type, brief })
  const pb = PLAYBOOKS[type]
  const job = {
    id: `local-${Date.now()}`, type, title: pb.label, client: client || '[New client]', owner: 'BO',
    created: new Date().toISOString(), due: new Date(Date.now() + (pb.defaultDays || 10) * 864e5).toISOString().slice(0, 10),
    stage: 0, approved: false, waitingOn: null, rounds: { used: 0, quoted: pb.rounds || 2 }, hours: { used: 0, budget: pb.hours || 12 },
    preview: { color: '#DA1F34', title: 'Шинэ төслийн танилцуулга', subtitle: '' }, comments: [],
    qa: pb.qa.map((name) => ({ name, status: 'pending', note: 'Not run yet' })),
    docs: { brief: `# Brief\n\n${brief || ''}\n`, rules: '# Rules for this job\n\n- No em dashes in any copy.\n', decisions: '# Decisions\n' },
  }
  memory.jobs.unshift(job)
  return job
}

export async function patchJob(id, patch) {
  if (live) return call('PATCH', `/api/jobs/${id}`, patch)
  const job = memory.jobs.find((j) => j.id === id)
  Object.assign(job, patch)
  if (patch.decision) job.docs.decisions += `- ${new Date().toISOString().slice(0, 10)}: ${patch.decision}\n`
  delete job.decision
  return structuredClone(job)
}

export async function patchStudio(patch) {
  if (live) return call('PATCH', '/api/studio', patch)
  memory.studio = { ...memory.studio, ...patch }
  return memory.studio
}
