import React from 'react'
import { Card, Chip } from '../components/ui.jsx'
import { PLAYBOOKS } from '../lib/api.js'

export default function Library() {
  const items = [
    ['Playbooks', `${Object.keys(PLAYBOOKS).length} job types: stages, checklist, deliverables. Lives in /playbooks.`, 'Live', true],
    ['Templates', 'Deck, brandbook, storyboard, logo sheet, demo shells.', 'Next: deck'],
    ['Style presets', 'Color and type combos saved from past jobs.', 'Planned'],
    ['Fonts with Өө Үү', 'Patched with ӨҮнэм, checked for Mongolian.', 'Planned'],
    ['Past work', 'Every delivered job, searchable as reference.', 'From /jobs'],
    ['Case studies', 'Drafted at close, published to brand-on.mn.', 'Planned'],
  ]
  return (
    <section className="view on" aria-labelledby="h-library">
      <div className="head"><div><h1 id="h-library">Library</h1><p className="muted">Clients come and go. Playbooks, templates and presets stay and get better with every job.</p></div></div>
      <div className="grid g-cards">
        {items.map(([t, d, tag, hot]) => (
          <Card className="panel" key={t} style={{ minHeight: 190, justifyContent: 'space-between' }}>
            <span style={{ alignSelf: 'flex-start' }}><Chip tone={hot ? 'red' : ''}>{tag}</Chip></span>
            <div><div style={{ fontSize: 24, fontWeight: 900, letterSpacing: '-.02em' }}>{t}</div><p className="muted" style={{ fontSize: 14, lineHeight: 1.5, marginTop: 6 }}>{d}</p></div>
          </Card>
        ))}
      </div>
    </section>
  )
}
