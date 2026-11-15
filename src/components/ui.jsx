// BrandOn Studio UI kit.
// Layers: flat for reading (Card, lists, inputs), soft for touching
// (Switch, Segmented, Tile, IconButton, Stat), glass for what floats
// (see Shell.jsx: top bar, popovers, palette, action bar, toast).
import React from 'react'

const PATHS = {
  jobs: <><path d="M4 7h16v12H4z" /><path d="M9 7V5h6v2" /></>,
  control: <><path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12" /><circle cx="16" cy="6" r="2" /><circle cx="10" cy="12" r="2" /><circle cx="18" cy="18" r="2" /></>,
  request: <path d="M12 5v14M5 12h14" />,
  plus: <path d="M12 5v14M5 12h14" />,
  library: <><path d="M5 4h4v16H5zM11 4h4v16h-4z" /><path d="M17 5l3 1-3 14-3-1z" /></>,
  system: <><circle cx="12" cy="12" r="3" /><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4L7 17M17 7l1.4-1.4" /></>,
  search: <><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" /></>,
  bell: <><path d="M6 8a6 6 0 1112 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10 21a2 2 0 004 0" /></>,
}

export function Icon({ name, size = 20 }) {
  return (
    <svg className="i" viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">{PATHS[name]}</svg>
  )
}

export function Logo({ size = 26 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" aria-hidden="true">
      <path d="M71.2 36.8 A30 30 0 1 1 28.8 36.8" fill="none" stroke="#DA1F34" strokeWidth="17" />
      <path d="M37.3 30.8 A30 30 0 0 1 62.7 30.8" fill="none" stroke="#DA1F34" strokeWidth="17" />
    </svg>
  )
}

export function Button({ variant, pressed, className = '', children, ...rest }) {
  const cls = ['btn', variant, pressed ? 'pressed' : '', className].filter(Boolean).join(' ')
  return <button className={cls} {...rest}>{children}</button>
}

export function IconButton({ label, icon, badge, ...rest }) {
  return (
    <button className="icon-btn" aria-label={label} {...rest}>
      {badge ? <span className="badge" /> : null}
      <Icon name={icon} />
    </button>
  )
}

export function Chip({ tone, dot, children }) {
  return <span className={`chip ${tone || ''}`}>{dot ? <span className="dot" /> : null}{children}</span>
}

export function Switch({ checked, onChange, label }) {
  return <button className="switch" role="switch" aria-checked={!!checked} aria-label={label} onClick={() => onChange(!checked)} />
}

export function Segmented({ options, value, onChange, label }) {
  return (
    <div className="seg" role="tablist" aria-label={label}>
      {options.map(([v, text]) => (
        <button key={v} role="tab" aria-selected={value === v} onClick={() => onChange(v)}>{text}</button>
      ))}
    </div>
  )
}

export function Steps({ value, total = 4 }) {
  return (
    <div className="steps" role="img" aria-label={`Step ${value + 1} of ${total}`}>
      {Array.from({ length: total }, (_, i) => <span key={i} className={i <= value ? 'on' : ''} />)}
    </div>
  )
}

export function Avatar({ children }) {
  return <span className="avatar">{children}</span>
}

export function Card({ as: Tag = 'div', className = '', children, ...rest }) {
  return <Tag className={`card ${className}`} {...rest}>{children}</Tag>
}

export function Panel({ title, aside, className = '', children, ...rest }) {
  return (
    <Card className={`panel ${className}`} {...rest}>
      {title || aside ? (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          {title ? <h2>{title}</h2> : <span />}{aside}
        </div>
      ) : null}
      {children}
    </Card>
  )
}

export function Stat({ value, label, alert }) {
  return <div className={`soft stat ${alert ? 'alert' : ''}`}><b>{value}</b><span>{label}</span></div>
}

export function Field({ id, label, textarea, ...rest }) {
  const Tag = textarea ? 'textarea' : 'input'
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <Tag id={id} className="input" {...rest} />
    </div>
  )
}

export function Tile({ selected, title, sub, ...rest }) {
  return (
    <button className="tile" aria-pressed={!!selected} {...rest}>
      <b>{title}</b><span>{sub}</span>
    </button>
  )
}

export function Row({ title, sub, children, strike }) {
  return (
    <div className="li">
      <div>
        {title ? <div className="t" style={strike ? { textDecoration: 'line-through', color: 'var(--faint)' } : null}>{title}</div> : null}
        {sub ? <div className="s">{sub}</div> : null}
      </div>
      {children}
    </div>
  )
}
