export const STAGES = ['Brief', 'Draft', 'Review', 'Deliver']
export const STAGE_IDS = ['brief', 'draft', 'review', 'deliver']

export const FLAG_META = {
  qa: { label: 'QA failed', tone: 'red' },
  needs: { label: 'Needs you', tone: 'red' },
  over: { label: 'Over quote', tone: 'warn' },
  client: { label: 'Waiting on client', tone: 'warn' },
  done: { label: 'Delivered', tone: 'ok' },
  ok: { label: 'On track', tone: 'ok' },
}

export const isDone = (job) => job.stage === 3 && job.approved
export const gateIsYours = (job, studio) => !!studio?.signoff?.[STAGES[job.stage]]

export function flagsFor(job, studio) {
  if (isDone(job)) return ['done']
  const f = []
  if (job.qa?.some((q) => q.status === 'fail')) f.push('qa')
  if (!job.approved && gateIsYours(job, studio) && job.waitingOn !== 'client') f.push('needs')
  if (job.rounds && job.rounds.used > job.rounds.quoted) f.push('over')
  if (job.waitingOn === 'client') f.push('client')
  return f.length ? f : ['ok']
}

export const needsYou = (job, studio) => {
  const f = flagsFor(job, studio)
  return f.includes('qa') || f.includes('needs') || f.includes('over')
}

export function stripTitle(md = '') {
  return md.replace(/^#.*\n+/, '').trim()
}
