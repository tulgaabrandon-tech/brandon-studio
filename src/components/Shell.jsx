// App chrome: sidebar, glass top bar, notifications, command palette, toast.
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { Avatar, Icon, IconButton, Logo, Switch } from './ui.jsx'
import { STAGES } from '../lib/jobs.js'

const ToastCtx = createContext(() => {})
export const useToast = () => useContext(ToastCtx)

export function ToastProvider({ children }) {
  const [msg, setMsg] = useState('')
  const [on, setOn] = useState(false)
  const timer = useRef()
  const show = useCallback((m) => {
    setMsg(m); setOn(true); clearTimeout(timer.current)
    timer.current = setTimeout(() => setOn(false), 2200)
  }, [])
  return (
    <ToastCtx.Provider value={show}>
      {children}
      <div className={`toast ${on ? 'on' : ''}`} role="status" aria-live="polite">{msg}</div>
    </ToastCtx.Provider>
  )
}

export const NAV = [['jobs', 'Jobs'], ['control', 'Control'], ['request', 'New request'], ['library', 'Library'], ['system', 'UI system']]

export function Sidebar({ view, go, needsCount, user }) {
  return (
    <aside className="side" aria-label="Main">
      <div className="brand">
        <div className="mark"><Logo /></div>
        <b>BrandOn <span>Studio</span></b>
      </div>
      <nav className="nav">
        {NAV.map(([id, label]) => {
          const current = view === id || (view === 'work' && id === 'jobs')
          return (
            <button key={id} onClick={() => go(id)} aria-current={current ? 'page' : undefined}>
              <Icon name={id} /><span className="txt">{label}</span>
              {id === 'control' && needsCount ? <span className="count">{needsCount}</span> : null}
            </button>
          )
        })}
      </nav>
      <div className="foot">
        <Avatar>{user.id}</Avatar>
        <div><div style={{ fontSize: 14, fontWeight: 700 }}>{user.name}</div><div className="muted" style={{ fontSize: 12 }}>{user.role}</div></div>
      </div>
    </aside>
  )
}

export function TopBar({ dark, setDark, onSearch, notifications, openJob, live }) {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const popRef = useRef()
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  useEffect(() => {
    if (!open) return
    const close = (e) => { if (!popRef.current?.contains(e.target)) setOpen(false) }
    const esc = (e) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('mousedown', close); document.addEventListener('keydown', esc)
    return () => { document.removeEventListener('mousedown', close); document.removeEventListener('keydown', esc) }
  }, [open])
  return (
    <div className={`top ${scrolled ? 'scrolled' : ''}`}>
      <button className="searchbtn" onClick={onSearch} aria-label="Search and commands">
        <Icon name="search" />Search jobs, clients, actions<kbd>⌘K</kbd>
      </button>
      <div className="right" style={{ position: 'relative' }} ref={popRef}>
        {!live ? <span className="chip warn" title="No local server: changes are not saved">Preview mode</span> : null}
        <span className="muted" style={{ fontSize: 13, fontWeight: 600 }}>{dark ? 'Dark' : 'Light'}</span>
        <Switch checked={dark} onChange={setDark} label="Dark mode" />
        <IconButton label="Notifications" icon="bell" badge={notifications.length > 0} onClick={() => setOpen((o) => !o)} aria-expanded={open} />
        <div className={`pop glass ${open ? 'on' : ''}`} role="dialog" aria-label="Notifications">
          <div className="label" style={{ padding: '8px 12px 6px' }}>Notifications</div>
          {notifications.length ? notifications.map((n, i) => (
            <button key={i} onClick={() => { setOpen(false); openJob(n.job) }}>
              <span className="dot" style={{ color: 'var(--red)', marginTop: 6 }} />
              <span><span style={{ display: 'block', fontSize: 14, fontWeight: 700 }}>{n.title}</span><span className="muted" style={{ fontSize: 13 }}>{n.sub}</span></span>
            </button>
          )) : <div className="muted" style={{ padding: 12, fontSize: 14 }}>All clear.</div>}
        </div>
      </div>
    </div>
  )
}

export function CommandPalette({ open, onClose, jobs, actions, openJob }) {
  const [q, setQ] = useState('')
  const [sel, setSel] = useState(0)
  const input = useRef()
  useEffect(() => { if (open) { setQ(''); setSel(0); setTimeout(() => input.current?.focus(), 20) } }, [open])
  const items = useMemo(() => {
    const ql = q.toLowerCase()
    const js = jobs.filter((j) => `${j.title} ${j.client}`.toLowerCase().includes(ql))
      .map((j) => ({ group: 'Jobs', label: `${j.title}, ${j.client}`, meta: STAGES[j.stage], run: () => openJob(j) }))
    const as = actions.filter((a) => a.label.toLowerCase().includes(ql)).map((a) => ({ group: 'Actions', ...a }))
    return [...js, ...as]
  }, [q, jobs, actions, openJob])
  const run = (i) => { const it = items[i]; if (!it) return; onClose(); it.run() }
  const onKey = (e) => {
    if (e.key === 'Escape') onClose()
    if (e.key === 'ArrowDown') { e.preventDefault(); setSel((s) => Math.min(items.length - 1, s + 1)) }
    if (e.key === 'ArrowUp') { e.preventDefault(); setSel((s) => Math.max(0, s - 1)) }
    if (e.key === 'Enter') { e.preventDefault(); run(sel) }
  }
  if (!open) return null
  let lastGroup = null
  return (
    <div className="overlay on" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className="palette glass" role="dialog" aria-modal="true" aria-label="Command palette" onKeyDown={onKey}>
        <div className="pin">
          <Icon name="search" />
          <label className="sr" htmlFor="pq">Search</label>
          <input id="pq" ref={input} value={q} onChange={(e) => { setQ(e.target.value); setSel(0) }} placeholder="Search jobs or type a command" autoComplete="off" />
          <kbd>Esc</kbd>
        </div>
        <div className="res" role="listbox">
          {items.length ? items.map((it, i) => {
            const head = it.group !== lastGroup ? <div className="label grp">{it.group}</div> : null
            lastGroup = it.group
            return (
              <React.Fragment key={i}>
                {head}
                <button role="option" aria-selected={i === sel} onMouseEnter={() => setSel(i)} onClick={() => run(i)}>
                  <span className="dot" style={{ color: it.group === 'Jobs' ? 'var(--red)' : 'transparent' }} />
                  <span style={{ flex: 1 }}>{it.label}</span>
                  {it.meta ? <span className="chip">{it.meta}</span> : null}
                </button>
              </React.Fragment>
            )
          }) : <div className="muted" style={{ padding: 16 }}>No results</div>}
        </div>
      </div>
    </div>
  )
}
