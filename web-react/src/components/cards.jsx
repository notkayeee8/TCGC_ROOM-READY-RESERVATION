import { BUILDING_COLORS, occupancyLabel, STATUS_COLORS } from '../data/constants'
import { formatDate } from '../utils/format'
import Icon from './Icon'
import { StatusPill } from './ui'

export function BuildingRow({ building, rooms, onClick }) {
  const buildingRooms = rooms.filter((room) => room.building === building)
  const available = buildingRooms.filter((room) => room.status === 'available').length
  const percentage = buildingRooms.length ? (available / buildingRooms.length) * 100 : 0

  return (
    <button type="button" className="data-row" onClick={onClick}>
      <span className="row-icon" style={{ background: `${BUILDING_COLORS[building]}18`, color: BUILDING_COLORS[building] }}>
        <Icon name="building" size={19} />
      </span>
      <span className="row-main">
        <strong>{building} Building</strong>
        <span>{available} of {buildingRooms.length} rooms available</span>
        <span className="progress" style={{ display: 'block', padding: 0, background: 'var(--surface-alt)', height: 6, marginTop: 8 }}>
          <span style={{ width: `${percentage}%`, background: BUILDING_COLORS[building] }} />
        </span>
      </span>
      <span className="row-meta num muted small">{Math.round(percentage)}%</span>
      <Icon name="chevronRight" size={16} className="muted" />
    </button>
  )
}

export function RoomRow({ room, onClick, trailing }) {
  return (
    <button type="button" className="data-row" onClick={onClick}>
      <span className="row-icon" style={{ background: 'var(--primary-soft)', color: 'var(--primary)' }}>
        <Icon name="home" size={18} />
      </span>
      <span className="row-main">
        <strong>{room.name}</strong>
        <span>{room.building} Building · {room.capacity} seats{room.reservedBy ? ` · ${room.reservedBy}` : ''}</span>
      </span>
      <span className="row-meta"><StatusPill status={room.status}>{occupancyLabel(room)}</StatusPill></span>
      {trailing ?? <Icon name="chevronRight" size={16} className="muted" />}
    </button>
  )
}

export function RequestRow({ request, onClick }) {
  const color = STATUS_COLORS[request.status] ?? 'var(--text-subtle)'
  const label = request.status.charAt(0).toUpperCase() + request.status.slice(1)
  return (
    <button type="button" className="data-row" onClick={onClick}>
      <span className="request-rail" style={{ background: color }} />
      <span className="row-main">
        <strong>{request.building} · {request.roomName}</strong>
        <span>{formatDate(request.reservedDate)} · {request.durationMinutes} min · {request.purpose}</span>
      </span>
      <span className="row-meta"><StatusPill status={request.status}>{label}</StatusPill></span>
      <Icon name="chevronRight" size={16} className="muted" />
    </button>
  )
}
