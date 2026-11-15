import React from 'react'
import { Button, Card, Chip, Panel, Row, Switch } from '../components/ui.jsx'
import { FLAG_META, STAGES, flagsFor, isDone } from '../lib/jobs.js'

export default function Control({ jobs, studio, openJob, setSignoff }) {
  const items = []
  jobs.forEach((j) => {
    const f = flagsFor(j, studio)
    if (f.includes('needs')) items.push({ kind: 'Approval', title: `${STAGES[j.stage]} gate waiting`, job: j })
    if (f.includes('qa')) items.push({ kind: 'QA failed', title: j.qa.find((q) => q.status === 'fail').note, job: j })
    if (f.includes('over')) items.push({ kind: 'Over quote', title: `Round ${j.rounds.used} of ${j.rounds.quoted}`, job: j })
  })
  return (
    <section className="view on" aria-labelledby="h-control">
      <div className="head"><div><h1 id="h-control">Control</h1><p className="muted">Everything that needs you. Nothing that doesn't.</p></div></div>
      <div className="grid g-cards" style={{ marginBottom: 32 }}>
        {items.length ? items.map((x, i) => (
          <Card className="panel" key={i}>
            <span style={{ alignSelf: 'flex-start' }}><Chip tone="red" dot>{x.kind}</Chip></span>
            <div><div style={{ fontSize: 20, fontWeight: 800 }}>{x.title}</div><div className="muted" style={{ fontSize: 14, marginTop: 4 }}>{x.job.title}, {x.job.client}</div></div>
            <div><Button onClick={() => openJob(x.job)}>Open job</Button></div>
          </Card>
        )) : <Card className="panel muted">Nothing needs you right now.</Card>}
      </div>
      <Panel title="All jobs" style={{ marginBottom: 32 }}>
        <div style={{ overflowX: 'auto', margin: '0 -10px' }}>
          <table style={{ minWidth: 760 }}>
            <thead><tr><th>Job</th><th>Owner</th><th>Stage</th><th>Gate</th><th>Rounds</th><th>Hours</th><th>Flag</th></tr></thead>
            <tbody>
              {jobs.map((j) => {
                const f = FLAG_META[flagsFor(j, studio)[0]]
                return (
                  <tr key={j.id}>
                    <td><button onClick={() => openJob(j)} style={{ textAlign: 'left', minHeight: 44 }}><b>{j.title}</b><br /><span className="muted">{j.client}</span></button></td>
                    <td>{j.owner}</td>
                    <td>{isDone(j) ? 'Delivered' : STAGES[j.stage]}</td>
                    <td>{isDone(j) ? 'Closed' : studio.signoff?.[STAGES[j.stage]] ? 'You' : 'Team'}</td>
                    <td>{j.rounds.used} of {j.rounds.quoted}</td>
                    <td>{j.hours.used} / {j.hours.budget}h</td>
                    <td><Chip tone={f.tone} dot>{f.label}</Chip></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Panel>
      <Panel title="Freedom settings">
        <p className="muted" style={{ fontSize: 14 }}>Who signs off each gate. You still see everything and can step in anywhere. Saved to studio.json.</p>
        <div className="list">
          {STAGES.map((s) => (
            <Row key={s} title={`${s} gate`} sub={studio.signoff?.[s] ? 'You sign off' : 'Team signs off'}>
              <Switch checked={!!studio.signoff?.[s]} onChange={(v) => setSignoff(s, v)} label={`I sign off the ${s} gate`} />
            </Row>
          ))}
        </div>
      </Panel>
    </section>
  )
}
