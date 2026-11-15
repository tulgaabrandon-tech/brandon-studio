import React, { useState } from 'react'
import { Button, Chip, Field, Icon, Panel, Segmented, Steps, Switch } from '../components/ui.jsx'

const SWATCHES = {
  light: [['Page', '#E9ECF1'], ['Card', '#F7F8FA'], ['Line', '#DCE0E7'], ['Text', '#1B1D22'], ['Muted', '#575D6A'], ['Red', '#DA1F34']],
  dark: [['Page', '#17191D'], ['Card', '#1F2227'], ['Line', '#30343C'], ['Text', '#ECEDEF'], ['Muted', '#A5A9B2'], ['Red', '#E8273D']],
}
const box = { height: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700 }

export default function UISystem({ dark }) {
  const [sw, setSw] = useState(true)
  const [seg, setSeg] = useState('brief')
  return (
    <section className="view on" aria-labelledby="h-system">
      <div className="head"><div><h1 id="h-system">UI system</h1><p className="muted">Built on the BrandOn brandbook. Flat for reading, soft for touching, glass for what floats, red only where action happens.</p></div></div>
      <div className="grid" style={{ gap: 28 }}>
        <Panel title="Color">
          <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill,minmax(140px,1fr))', gap: 18 }}>
            {SWATCHES[dark ? 'dark' : 'light'].map(([n, c]) => (
              <div key={n} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div className="swatch" style={{ background: c }} />
                <div style={{ fontSize: 13, fontWeight: 700 }}>{n}</div><div className="muted" style={{ fontSize: 12 }}>{c}</div>
              </div>
            ))}
          </div>
        </Panel>
        <div className="panel" style={{ padding: '8px 4px' }}>
          <h2>Soft depth <span className="muted" style={{ fontSize: 14, fontWeight: 400, marginLeft: 8 }}>Used only on tactile controls</span></h2>
          <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill,minmax(150px,1fr))', gap: 26 }}>
            <div className="soft-1" style={box}>Raise 1</div><div className="soft" style={box}>Raise 2</div><div className="soft-3" style={box}>Raise 3</div>
            <div className="soft-in" style={box}>Inset</div><div className="soft-deep" style={box}>Inset deep</div>
          </div>
        </div>
        <Panel title={<>Glass <span className="muted" style={{ fontSize: 14, fontWeight: 400, marginLeft: 8 }}>Used only on layers that float above content</span></>}>
          <div className="glass-demo">
            <div className="blob" style={{ width: 220, height: 220, left: '8%', top: -30, background: '#DA1F34' }} />
            <div className="blob" style={{ width: 180, height: 180, right: '12%', bottom: -40, background: '#F2A5AE' }} />
            <div className="blob" style={{ width: 120, height: 120, left: '46%', top: 40, background: '#1B1D22' }} />
            <div className="glass" style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%,-50%)', width: 'min(380px,80%)', padding: '20px 22px', borderRadius: 22 }}>
              <div style={{ fontSize: 16, fontWeight: 800 }}>Floating layer</div>
              <div className="muted" style={{ fontSize: 13, marginTop: 4 }}>Blur 20, saturation 170%, hairline highlight. Falls back to a solid card when blur is not supported.</div>
            </div>
          </div>
        </Panel>
        <Panel title="Type">
          <div style={{ fontSize: 44, fontWeight: 900, letterSpacing: '-.03em' }}>Display 44 Black</div>
          <div style={{ fontSize: 22, fontWeight: 800 }}>Heading 22 ExtraBold</div>
          <div style={{ fontSize: 16, fontWeight: 300 }}>Body 16 Light: Өө Үү монгол бичвэр зөв харагдана.</div>
          <div className="label">Label 12 caps</div>
        </Panel>
        <Panel title="Controls">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 18, alignItems: 'center' }}>
            <Button variant="primary">Primary</Button><Button>Secondary</Button><Button variant="ghost">Ghost</Button><Button disabled>Disabled</Button>
            <button className="icon-btn" aria-label="Add"><Icon name="plus" /></button>
            <Switch checked={sw} onChange={setSw} label="Example switch" />
            <Chip tone="red" dot>Needs you</Chip><Chip tone="ok" dot>Pass</Chip><Chip tone="warn" dot>Waiting</Chip>
          </div>
          <Segmented label="Example" value={seg} onChange={setSeg} options={[['brief', 'Brief'], ['draft', 'Draft'], ['review', 'Review']]} />
          <div style={{ maxWidth: 420 }}><Field id="ex" label="Input" placeholder="Type here" /></div>
          <div style={{ maxWidth: 320 }}><Steps value={1} /></div>
        </Panel>
        <Panel title="Where each layer is used">
          <div className="list" style={{ fontSize: 14, lineHeight: 1.6 }}>
            <div className="li"><span><b>Soft: things you touch.</b> Switches, segmented tabs, choice tiles, icon buttons, the active nav item and the overview numbers. Raised means press it, sunken means it is on.</span></div>
            <div className="li"><span><b>Flat: things you read.</b> Job cards, tables, lists, comments, previews and forms, with a hairline border so text stays crisp.</span></div>
            <div className="li"><span><b>Glass: things that float.</b> Sticky top bar, notifications, the ⌘K palette, the job action bar, labels on previews, toasts and the mobile nav. Never on a plain surface, never for long text.</span></div>
            <div className="li"><span><b>Inputs are flat on purpose.</b> Fields get a real border and a red focus ring, because sunken fields are hard to spot.</span></div>
            <div className="li"><span><b>Red is action.</b> Primary buttons, the active icon, progress, alerts and focus. The primary button is solid, never soft.</span></div>
          </div>
        </Panel>
      </div>
    </section>
  )
}
