import React, { useState } from 'react'
import { Button, Chip, Field, Panel, Tile } from '../components/ui.jsx'
import { PLAYBOOKS } from '../lib/api.js'

const ORDER = ['deck', 'logo', 'branding', 'system', 'storyboard', 'demo']

export default function NewRequest({ onCreate }) {
  const [client, setClient] = useState('')
  const [brief, setBrief] = useState('')
  const [type, setType] = useState('deck')
  const [busy, setBusy] = useState(false)
  const pb = PLAYBOOKS[type]
  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    try { await onCreate({ client: client.trim(), brief: brief.trim(), type }) } finally { setBusy(false) }
  }
  return (
    <section className="view on" aria-labelledby="h-request">
      <div className="head"><div><h1 id="h-request">New request</h1><p className="muted">Paste the brief. A client is just a name on the job.</p></div></div>
      <div className="two">
        <form onSubmit={submit}>
          <Panel style={{ gap: 26 }}>
            <Field id="client" label="Client" placeholder="Brand or company name" value={client} onChange={(e) => setClient(e.target.value)} />
            <Field id="brief" label="Brief" textarea placeholder="Paste the brief or the client's message" value={brief} onChange={(e) => setBrief(e.target.value)} />
            <div className="field">
              <span style={{ fontSize: 13, fontWeight: 700 }}>What do they need?</span>
              <div className="tilegrid" role="group" aria-label="Job type">
                {ORDER.map((k) => <Tile key={k} type="button" selected={type === k} title={PLAYBOOKS[k].label} sub={PLAYBOOKS[k].short} onClick={() => setType(k)} />)}
              </div>
            </div>
            <div><Button variant="primary" type="submit" disabled={busy}>{busy ? 'Creating…' : 'Start job'}</Button></div>
          </Panel>
        </form>
        <Panel>
          <span className="label">Playbook</span>
          <div style={{ fontSize: 32, fontWeight: 900, letterSpacing: '-.02em' }}>{pb.label}</div>
          <div className="list">
            {pb.stages.map((s, i) => (
              <div className="li" key={s} style={{ justifyContent: 'flex-start' }}>
                <b style={{ color: 'var(--red)', minWidth: 26 }}>0{i + 1}</b><span style={{ fontSize: 14 }}>{s}</span>
              </div>
            ))}
          </div>
          <div>
            <div className="label" style={{ marginBottom: 10 }}>Delivers</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>{pb.files.map((f) => <Chip key={f}>{f}</Chip>)}</div>
          </div>
          <div className="muted" style={{ fontSize: 13 }}>Starts from library/{pb.template} · {pb.defaultDays} days · {pb.rounds} review rounds</div>
        </Panel>
      </div>
    </section>
  )
}
