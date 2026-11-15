import React from 'react'
import { Button, Chip, Panel, Row, Segmented } from '../components/ui.jsx'
import { PLAYBOOKS } from '../lib/api.js'
import { STAGES, STAGE_IDS, gateIsYours, isDone, stripTitle } from '../lib/jobs.js'
import { useToast } from '../components/Shell.jsx'

export default function Workspace({ job, studio, stage, setStage, update }) {
  const toast = useToast()
  if (!job) return null
  const pb = PLAYBOOKS[job.type]
  const done = isDone(job)
  const gate = STAGES[job.stage]
  const yours = gateIsYours(job, studio)
  const failing = job.qa.filter((q) => q.status === 'fail')

  const approve = async () => {
    if (job.stage < 3) {
      await update({ stage: job.stage + 1, approved: false, decision: `${gate} gate approved by BrandOn.` })
      setStage(STAGE_IDS[job.stage + 1])
      toast(`${gate} approved. Moved to ${STAGES[job.stage + 1]}.`)
    } else {
      await update({ approved: true, decision: 'Delivered and closed.' })
      toast('Job delivered.')
    }
  }
  const fixQa = (name) => update({
    qa: job.qa.map((q) => (q.name === name ? { ...q, status: 'pass', note: 'Fixed' } : q)),
    decision: `QA: ${name} fixed.`,
  })
  const toggleComment = (i) => update({ comments: job.comments.map((c, k) => (k === i ? { ...c, done: !c.done } : c)) })

  return (
    <section className="view on" aria-labelledby="h-work">
      <div className="head">
        <div><span className="label">{job.client}</span><h1 id="h-work" style={{ marginTop: 8 }}>{job.title}</h1></div>
        <Segmented label="Stages" value={stage} onChange={setStage} options={STAGE_IDS.map((id, i) => [id, STAGES[i]])} />
      </div>
      <div className="two">
        <div className="grid" style={{ gap: 20 }}>
          {stage === 'brief' && <>
            <Panel>
              <span className="label">Brief</span>
              <p style={{ fontSize: 21, fontWeight: 700, lineHeight: 1.4, whiteSpace: 'pre-wrap' }}>{stripTitle(job.docs.brief) || 'No brief yet.'}</p>
              <p className="muted" style={{ fontSize: 13 }}>From jobs/{job.id}/brief.md</p>
            </Panel>
            <Panel title="Rules for this job">
              <p style={{ fontSize: 14, lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{stripTitle(job.docs.rules)}</p>
            </Panel>
            <Panel title="Starts from the library">
              <div className="list">
                <Row title={`library/${pb.template}`}><Chip>Template</Chip></Row>
                <Row title="Style preset"><Chip>Pick one</Chip></Row>
              </div>
            </Panel>
          </>}
          {stage === 'draft' && (
            <Panel title="Preview" aside={<div style={{ display: 'flex', gap: 10 }}><Button variant="ghost" onClick={() => toast(`Source: jobs/${job.id}/work`)}>Open source</Button></div>}>
              <div className="preview" style={{ background: job.preview.color }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 14, fontWeight: 700 }}>{job.client}</span>
                  <span style={{ display: 'flex', gap: 8 }}><span className="glass-chip">{pb.label}</span><span className="glass-chip">Draft</span></span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <span className="big">{job.preview.title}</span>
                  {job.preview.subtitle ? <span style={{ fontSize: 17, fontWeight: 300 }}>{job.preview.subtitle}</span> : null}
                </div>
              </div>
              <p className="muted" style={{ fontSize: 13 }}>The real draft lives in jobs/{job.id}/work. Previews of actual files come with the deck playbook.</p>
            </Panel>
          )}
          {stage === 'review' && (
            <Panel title="Client comments" aside={<Chip tone={job.rounds.used > job.rounds.quoted ? 'red' : ''}>Round {job.rounds.used} of {job.rounds.quoted}</Chip>}>
              <div className="list">
                {job.comments.length ? job.comments.map((c, i) => (
                  <div className="li" key={i}>
                    <div><div className="s">{c.where}</div><div className="t" style={{ fontWeight: 500, ...(c.done ? { textDecoration: 'line-through', color: 'var(--faint)' } : {}) }}>{c.text}</div></div>
                    <Button pressed={c.done} onClick={() => toggleComment(i)}>{c.done ? 'Done' : 'Resolve'}</Button>
                  </div>
                )) : <p className="muted" style={{ fontSize: 14 }}>No comments yet.</p>}
              </div>
            </Panel>
          )}
          {stage === 'deliver' && <>
            <Panel title="Handover">
              <p style={{ fontSize: 26, fontWeight: 900, letterSpacing: '-.02em' }}>One link. Every file.</p>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>{pb.files.map((f) => <Chip key={f}>{f}</Chip>)}</div>
            </Panel>
            <Panel title="Decisions">
              <p style={{ fontSize: 14, lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{stripTitle(job.docs.decisions)}</p>
            </Panel>
          </>}
        </div>
        <div className="grid" style={{ gap: 20 }}>
          <Panel title="Gates">
            <div className="list">
              {STAGES.map((name, i) => {
                const passed = i < job.stage || (i === job.stage && job.approved)
                const pending = i === job.stage && !job.approved
                const mine = !!studio.signoff?.[name]
                return (
                  <Row key={name} title={name} sub={mine ? 'You sign off' : 'Team signs off'}>
                    {passed ? <Chip tone="ok">Approved</Chip> : pending ? <Chip tone="red">Pending</Chip> : <Chip>Locked</Chip>}
                  </Row>
                )
              })}
            </div>
          </Panel>
          <Panel title="QA">
            <div className="list">
              {job.qa.map((q) => (
                <Row key={q.name} title={q.name} sub={q.note}>
                  {q.status === 'fail'
                    ? <Button onClick={() => fixQa(q.name)}>Mark fixed</Button>
                    : <Chip tone={q.status === 'pass' ? 'ok' : ''} dot>{q.status === 'pass' ? 'Pass' : 'Not run'}</Chip>}
                </Row>
              ))}
            </div>
          </Panel>
        </div>
      </div>
      <div className="actionbar glass">
        <span className="dot" style={{ color: done ? 'var(--ok)' : 'var(--red)' }} />
        <span style={{ fontSize: 14 }}>
          <b>{done ? 'Delivered' : `${gate} gate`}</b>{' '}
          <span className="muted">{done ? 'job closed' : yours ? 'waiting for you' : 'with the team'}{failing.length ? ` · ${failing.length} QA issue${failing.length > 1 ? 's' : ''}` : ''}</span>
        </span>
        <div className="sp">
          {!done && (
            <Button variant="primary" onClick={approve} disabled={failing.length > 0} title={failing.length ? 'Fix QA first' : undefined}>
              {job.stage < 3 ? `Approve ${gate.toLowerCase()}` : 'Deliver'}
            </Button>
          )}
        </div>
      </div>
    </section>
  )
}
