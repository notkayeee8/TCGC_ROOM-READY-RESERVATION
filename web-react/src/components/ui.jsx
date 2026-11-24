import { useEffect } from 'react'
import Icon from './Icon'

export function Alert({ tone = 'info', children }) {
  return <div className={`alert alert-${tone}`} role={tone === 'error' ? 'alert' : 'status'}><Icon name={tone === 'error' ? 'alert' : 'info'} size={16} /><span>{children}</span></div>
}

export function Loading({ label = 'Loading…' }) {
  return (
    <div className="loading-block" role="status" aria-label={label}>
      <div className="skeleton" style={{ width: '42%', height: 26 }} />
      <div className="skeleton" style={{ width: '100%', height: 60 }} />
      <div className="skeleton" style={{ width: '92%', height: 60 }} />
      <div className="skeleton" style={{ width: '70%', height: 60 }} />
    </div>
  )
}

export function EmptyState({ title, message, icon = 'list' }) {
  return (
    <div className="empty">
      <div style={{ color: 'var(--text-subtle)', marginBottom: 10 }}><Icon name={icon} size={26} /></div>
      <strong>{title}</strong>
      <span>{message}</span>
    </div>
  )
}

export function StatusPill({ status, children }) {
  const styles = {
    available: { color: 'var(--success)', background: 'var(--success-soft)' },
    approved: { color: 'var(--success)', background: 'var(--success-soft)' },
    occupied: { color: 'var(--danger)', background: 'var(--danger-soft)' },
    rejected: { color: 'var(--danger)', background: 'var(--danger-soft)' },
    reserved: { color: 'var(--warning)', background: 'var(--warning-soft)' },
    pending: { color: 'var(--warning)', background: 'var(--warning-soft)' },
  }
  const style = styles[status] ?? { color: 'var(--text-subtle)', background: 'var(--surface-alt)' }
  return <span className="status-pill" style={style}><span className="status-dot" />{children}</span>
}

export function Field({ label, hint, error, children }) {
  return (
    <label className="field">
      <span className="field-label">{label}</span>
      {children}
      {error ? <span className="field-error">{error}</span> : hint ? <span className="field-hint">{hint}</span> : null}
    </label>
  )
}

export function Modal({ title, onClose, children, actions }) {
  useEffect(() => {
    const onKeyDown = (event) => { if (event.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  return (
    <div className="modal-backdrop" onClick={(event) => { if (event.target === event.currentTarget) onClose() }}>
      <div className="modal" role="dialog" aria-modal="true" aria-label={title}>
        <div className="modal-head row-between">
          {title}
          <button type="button" className="icon-button" onClick={onClose} aria-label="Close"><Icon name="x" size={18} /></button>
        </div>
        <div className="modal-body">{children}</div>
        <div className="modal-actions">{actions}</div>
      </div>
    </div>
  )
}

export function KpiBand({ stats }) {
  const items = [
    [stats.total, 'Total rooms', 'var(--text)'],
    [stats.available, 'Available', 'var(--success)'],
    [stats.reserved, 'Reserved', 'var(--warning)'],
    [stats.occupied, 'Occupied', 'var(--danger)'],
  ]
  return (
    <div className="kpi-band">
      {items.map(([value, label, color]) => (
        <div className="kpi" key={label}>
          <div className="kpi-value num" style={{ color }}>{value}</div>
          <div className="kpi-label">{label}</div>
        </div>
      ))}
    </div>
  )
}
