import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { CommandPalette, Sidebar, ToastProvider, TopBar, useToast } from './components/Shell.jsx'
import { createJob, loadAll, patchJob, patchStudio } from './lib/api.js'
import { STAGES, STAGE_IDS, flagsFor, isDone, needsYou } from './lib/jobs.js'
import Jobs from './views/Jobs.jsx'
import Workspace from './views/Workspace.jsx'
import Control from './views/Control.jsx'
import NewRequest from './views/NewRequest.jsx'
import Library from './views/Library.jsx'
import UISystem from './views/UISystem.jsx'

function readTheme() {
  try { return localStorage.getItem('bo-theme') === 'dark' } catch { return false }
}

function Studio() {
  const toast = useToast()
  const [data, setData] = useState({ jobs: [], studio: {}, live: false, loaded: false })
  const [view, setView] = useState('jobs')
  const [jobId, setJobId] = useState(null)
  const [stage, setStage] = useState('brief')
  const [dark, setDarkState] = useState(readTheme)
  const [palette, setPalette] = useState(false)

  useEffect(() => { loadAll().then((d) => setData({ ...d, loaded: true })) }, [])
  useEffect(() => {
    document.body.classList.toggle('dark', dark)
    try { localStorage.setItem('bo-theme', dark ? 'dark' : 'light') } catch { /* storage unavailable */ }
  }, [dark])
  useEffect(() => {
    const onKey = (e) => { if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); setPalette((p) => !p) } }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  const { jobs, studio, live } = data
  const job = jobs.find((j) => j.id === jobId)
  const go = useCallback((v) => { setView(v); window.scrollTo({ top: 0 }) }, [])
  const openJob = useCallback((j) => { setJobId(j.id); setStage(STAGE_IDS[j.stage]); go('work') }, [go])

  const replaceJob = (updated) => setData((d) => ({ ...d, jobs: d.jobs.map((j) => (j.id === updated.id ? updated : j)) }))
  const update = async (patch) => replaceJob(await patchJob(job.id, patch))
  const onCreate = async (input) => {
    const created = await createJob(input)
    setData((d) => ({ ...d, jobs: [created, ...d.jobs] }))
    openJob(created)
    toast(live ? `Job folder created: jobs/${created.id}` : 'Job created (preview mode, not saved)')
  }
  const setSignoff = async (stageName, value) => {
    const studioNext = await patchStudio({ signoff: { ...studio.signoff, [stageName]: value } })
    setData((d) => ({ ...d, studio: studioNext }))
  }

  const notifications = useMemo(() => {
    const out = []
    jobs.forEach((j) => {
      const f = flagsFor(j, studio)
      const sub = `${j.title}, ${j.client}`
      if (f.includes('needs')) out.push({ title: `${STAGES[j.stage]} gate waiting`, sub, job: j })
      if (f.includes('qa')) out.push({ title: 'QA failed', sub, job: j })
      if (f.includes('over')) out.push({ title: 'Over quote', sub, job: j })
      if (f.includes('client')) out.push({ title: 'Waiting on client', sub, job: j })
    })
    return out
  }, [jobs, studio])

  const actions = useMemo(() => [
    { label: 'New request', run: () => go('request') },
    { label: 'Open Control', run: () => go('control') },
    { label: 'Open Library', run: () => go('library') },
    { label: 'Switch theme', run: () => setDarkState((d) => !d) },
    { label: 'UI system', run: () => go('system') },
  ], [go])

  const user = (studio.team || [])[0] || { id: 'BO', name: 'BrandOn', role: 'Owner' }
  const needsCount = jobs.filter((j) => needsYou(j, studio)).length

  return (
    <div className="app">
      <Sidebar view={view} go={go} needsCount={needsCount} user={user} />
      <main className="main">
        <TopBar dark={dark} setDark={setDarkState} onSearch={() => setPalette(true)} notifications={notifications} openJob={openJob} live={live} />
        {!data.loaded ? <p className="muted">Loading jobs…</p> : <>
          {view === 'jobs' && <Jobs jobs={jobs} studio={studio} openJob={openJob} go={go} />}
          {view === 'work' && <Workspace job={job} studio={studio} stage={stage} setStage={setStage} update={update} />}
          {view === 'control' && <Control jobs={jobs} studio={studio} openJob={openJob} setSignoff={setSignoff} />}
          {view === 'request' && <NewRequest onCreate={onCreate} />}
          {view === 'library' && <Library />}
          {view === 'system' && <UISystem dark={dark} />}
        </>}
      </main>
      <CommandPalette open={palette} onClose={() => setPalette(false)} jobs={jobs.filter((j) => !isDone(j))} actions={actions} openJob={openJob} />
    </div>
  )
}

export default function App() {
  return <ToastProvider><Studio /></ToastProvider>
}
