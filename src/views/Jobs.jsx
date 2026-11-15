import React, { useState } from 'react'
import { Avatar, Button, Card, Chip, Icon, Segmented, Stat, Steps } from '../components/ui.jsx'
import { FLAG_META, STAGES, flagsFor, isDone, needsYou } from '../lib/jobs.js'

export default function Jobs({ jobs, studio, openJob, go }) {
  const [filter, setFilter] = useState('all')
  const active = jobs.filter((j) => !isDone(j))
  const list = jobs.filter((j) => {
    if (filter === 'progress') return !isDone(j) && j.stage < 2
    if (filter === 'review') return !isDone(j) && j.stage === 2
    if (filter === 'you') return needsYou(j, studio)
    if (filter === 'done') return isDone(j)
    return true
  })
  return (
    <section className="view on" aria-labelledby="h-jobs">
      <div className="head">
        <div>
          <h1 id="h-jobs">Jobs</h1>
          <p className="muted">Every request runs on a playbook for its type. Open a job to work on it.</p>
        </div>
        <Button variant="primary" onClick={() => go('request')}><Icon name="plus" />New request</Button>
      </div>
      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(190px,1fr))', marginBottom: 32 }}>
        <Stat value={active.length} label="Active jobs" />
        <Stat value={active.filter((j) => j.stage < 2).length} label="In progress" />
        <Stat value={jobs.filter((j) => needsYou(j, studio)).length} label="Need you" alert />
        <Stat value={active.filter((j) => j.stage === 2).length} label="In review" />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap', marginBottom: 24 }}>
        <Segmented label="Filter jobs" value={filter} onChange={setFilter}
          options={[['all', 'All'], ['progress', 'In progress'], ['review', 'Review'], ['you', 'Needs you'], ['done', 'Delivered']]} />
        <span className="muted" style={{ fontSize: 13 }}>{list.length} of {jobs.length} jobs</span>
      </div>
      <div className="grid g-cards">
        {list.map((j) => {
          const f = FLAG_META[flagsFor(j, studio)[0]]
          return (
            <Card as="button" key={j.id} className="job" onClick={() => openJob(j)}>
              <div className="row"><Chip tone={f.tone} dot>{f.label}</Chip><Avatar>{j.owner}</Avatar></div>
              <div><h3>{j.title}</h3><div className="client">{j.client}</div></div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <Steps value={j.stage} />
                <div className="row" style={{ fontSize: 13 }}>
                  <b style={{ color: 'var(--red)' }}>{isDone(j) ? 'Delivered' : STAGES[j.stage]}</b>
                  <span className="muted">Due {j.due}</span>
                </div>
              </div>
            </Card>
          )
        })}
        {!list.length ? <Card className="panel muted">No jobs here.</Card> : null}
      </div>
    </section>
  )
}
