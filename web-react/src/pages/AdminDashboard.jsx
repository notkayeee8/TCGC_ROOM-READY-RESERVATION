import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import Icon from '../components/Icon'
import { Alert, EmptyState, Field, KpiBand, Loading, Modal, StatusPill } from '../components/ui'
import { BUILDINGS, BUILDING_COLORS, ROOM_FILTERS, statsFromRooms, typeLabel } from '../data/constants'
import { useRequests, useReservations, useRooms } from '../hooks/useFirestoreData'
import { addRoom, approveRequest, cancelReservation, clearRoom, deleteRoom, rejectRequest } from '../services/firestore'
import { endTimeLabel, formatDate, toDate } from '../utils/format'

const TABS = ['Overview', 'Requests', 'Rooms', 'Stats']

export default function AdminDashboard() {
  const location = useLocation()
  const navigate = useNavigate()
  const [tab, setTab] = useState(location.state?.tab ?? 0)

  useEffect(() => {
    if (location.state?.tab !== undefined) setTab(location.state.tab)
  }, [location.state?.tab])
  const [filter, setFilter] = useState('all')
  const [action, setAction] = useState(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [newRoom, setNewRoom] = useState({ building: 'Annex', name: '', capacity: '' })

  const roomsQuery = useRooms()
  const requestsQuery = useRequests()
  const reservationsQuery = useReservations()
  const rooms = roomsQuery.data ?? []
  const requests = requestsQuery.data ?? []
  const reservations = reservationsQuery.data ?? []
  const loading = roomsQuery.loading || requestsQuery.loading || reservationsQuery.loading

  useEffect(() => {
    rooms.filter((room) => room.expiresAt && toDate(room.expiresAt) <= new Date())
      .forEach((room) => clearRoom(room.id).catch(() => {}))
  }, [rooms])

  const selectTab = (index) => {
    setTab(index)
    navigate('/admin', { state: { tab: index }, replace: true })
  }

  const pending = requests.filter((request) => request.status === 'pending')
  const stats = statsFromRooms(filter === 'all' ? rooms : rooms.filter((room) => room.status === filter))
  const filteredRooms = filter === 'all' ? rooms : rooms.filter((room) => room.status === filter)

  const runAction = async () => {
    if (!action) return
    setBusy(true)
    setError('')
    try {
      if (action.type === 'approve') await approveRequest(action.request)
      if (action.type === 'reject') await rejectRequest(action.request.id)
      if (action.type === 'delete-room') await deleteRoom(action.room.id)
      if (action.type === 'release') await clearRoom(action.room.id)
      if (action.type === 'cancel-reservation') await cancelReservation(action.reservation.id)
      setAction(null)
    } catch (actionError) {
      setError(actionError.message ?? 'Action failed.')
    } finally {
      setBusy(false)
    }
  }

  const submitRoom = async (event) => {
    event.preventDefault()
    setBusy(true)
    setError('')
    try {
      await addRoom(newRoom)
      setNewRoom({ building: 'Annex', name: '', capacity: '' })
      setAction(null)
    } catch (roomError) {
      setError(roomError.message ?? 'Could not add room.')
    } finally {
      setBusy(false)
    }
  }

  if (loading) return <Loading label="Loading dashboard…" />

  return (
    <>
      {error && <div style={{ marginBottom: 16 }}><Alert tone="error">{error}</Alert></div>}

      <div className="tabs" style={{ marginBottom: 20 }}>
        {TABS.map((label, index) => (
          <button key={label} type="button" className={tab === index ? 'active' : ''} onClick={() => selectTab(index)}>
            {label}{label === 'Requests' && pending.length > 0 ? ` (${pending.length})` : ''}
          </button>
        ))}
      </div>

      {tab === 0 && (
        <>
          <KpiBand stats={statsFromRooms(rooms)} />
          <div className="row-between" style={{ margin: '24px 0 12px' }}>
            <h2 className="section-title">Room status</h2>
            <div className="chips">
              {ROOM_FILTERS.map((item) => (
                <button key={item.value} type="button" className={`chip ${filter === item.value ? 'active' : ''}`} onClick={() => setFilter(item.value)}>{item.label}</button>
              ))}
            </div>
          </div>
          {filteredRooms.length === 0 ? <EmptyState title="No rooms found" message="Add a room in the Rooms tab." icon="building" /> : (
            <div className="panel">
              {filteredRooms.map((room, index) => (
                <div key={room.id} className="data-row" style={{ border: 'none', borderRadius: 0, borderBottom: index === filteredRooms.length - 1 ? 'none' : '1px solid var(--border)', background: 'transparent' }}>
                  <span className="row-icon" style={{ background: 'var(--primary-soft)', color: 'var(--primary)' }}><Icon name="home" size={17} /></span>
                  <span className="row-main">
                    <strong>{room.name}</strong>
                    <span>{room.building} · {room.capacity} seats{room.reservedBy ? ` · ${room.reservedBy}` : ''}</span>
                  </span>
                  <span className="row-meta"><StatusPill status={room.status}>{typeLabel(room)}</StatusPill></span>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {tab === 1 && (
        <section className="panel">
          <div className="panel-head">
            <div><div className="label">Approval queue</div><div className="panel-title">Pending requests</div></div>
            <StatusPill status="pending">{pending.length} waiting</StatusPill>
          </div>
          <div className="panel-body">
            {pending.length === 0 ? <EmptyState title="No pending requests" message="New student requests will appear here." icon="check" /> : (
              <div className="stack">
                {pending.map((request) => (
                  <div key={request.id} className="panel" style={{ boxShadow: 'none' }}>
                    <div className="panel-body">
                      <div className="row-between">
                        <div>
                          <strong>{request.building} · {request.roomName}</strong>
                          <div className="tiny muted">{request.studentName} ({request.studentId})</div>
                        </div>
                        <StatusPill status="pending">Pending</StatusPill>
                      </div>
                      <p className="small" style={{ margin: '10px 0' }}>{request.purpose}</p>
                      <div className="tiny muted">{formatDate(request.reservedDate)} · {request.durationMinutes} min · until {endTimeLabel(request.reservedDate, request.durationMinutes)}</div>
                      <div className="row" style={{ marginTop: 14 }}>
                        <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={() => setAction({ type: 'reject', request })}>Reject</button>
                        <button type="button" className="btn" style={{ flex: 1 }} onClick={() => setAction({ type: 'approve', request })}>Approve</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {tab === 2 && (
        <>
          <div className="row-between" style={{ marginBottom: 14 }}>
            <span className="label">{rooms.length} rooms configured</span>
            <button type="button" className="btn" onClick={() => setAction({ type: 'add-room' })}><Icon name="plus" size={16} /> Add room</button>
          </div>
          {rooms.length === 0 ? <EmptyState title="No rooms yet" message="Add your first room to get started." icon="building" /> : (
            <div className="panel">
              {rooms.map((room, index) => (
                <div key={room.id} style={{ padding: '12px 18px', display: 'flex', alignItems: 'center', gap: 12, borderBottom: index === rooms.length - 1 ? 'none' : '1px solid var(--border)' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <strong>{room.name}</strong>
                    <div className="tiny muted">{room.building} · {room.capacity} seats</div>
                  </div>
                  <StatusPill status={room.status}>{typeLabel(room)}</StatusPill>
                  {room.status !== 'available' && (
                    <button type="button" className="btn btn-ghost btn-sm" onClick={() => setAction({ type: 'release', room })}>Release</button>
                  )}
                  <button type="button" className="btn btn-danger-outline btn-sm" onClick={() => setAction({ type: 'delete-room', room })} aria-label={`Delete ${room.name}`}><Icon name="trash" size={15} /></button>
                </div>
              ))}
            </div>
          )}

          {reservations.length > 0 && (
            <section className="panel" style={{ marginTop: 24 }}>
              <div className="panel-head"><div className="label">Active reservations</div><StatusPill status="reserved">{reservations.length} active</StatusPill></div>
              <div className="panel-body stack">
                {reservations.map((reservation) => (
                  <div key={reservation.id} className="row-between">
                    <div>
                      <strong>{reservation.roomName}</strong>
                      <div className="tiny muted">by {reservation.reservedBy} · {reservation.purpose}</div>
                    </div>
                    <button type="button" className="btn btn-outline btn-sm" onClick={() => setAction({ type: 'cancel-reservation', reservation })}>Cancel</button>
                  </div>
                ))}
              </div>
            </section>
          )}
        </>
      )}

      {tab === 3 && (
        <>
          <KpiBand stats={statsFromRooms(rooms)} />
          <h2 className="section-title" style={{ margin: '24px 0 12px' }}>Utilization by building</h2>
          <div className="stack">
            {BUILDINGS.map((building) => {
              const buildingRooms = rooms.filter((room) => room.building === building)
              const buildingStats = statsFromRooms(buildingRooms)
              const percentage = buildingRooms.length ? (buildingStats.available / buildingRooms.length) * 100 : 0
              return (
                <section className="panel" key={building}>
                  <div className="panel-body">
                    <div className="row-between">
                      <strong>{building} Building</strong>
                      <span className="tiny muted num">{buildingRooms.length} rooms · {buildingStats.available} free</span>
                    </div>
                    <div className="progress"><span style={{ width: `${percentage}%`, background: BUILDING_COLORS[building] }} /></div>
                  </div>
                </section>
              )
            })}
          </div>
        </>
      )}

      {action && (
        <Modal
          title={action.type === 'approve' ? 'Approve request' : action.type === 'reject' ? 'Reject request' : action.type === 'delete-room' ? 'Delete room' : action.type === 'release' ? 'Release room' : action.type === 'cancel-reservation' ? 'Cancel reservation' : 'Add a new room'}
          onClose={() => setAction(null)}
          actions={
            action.type === 'add-room' ? (
              <button type="submit" form="add-room-form" className="btn btn-block" disabled={busy}>{busy ? 'Adding…' : 'Add room'}</button>
            ) : (
              <>
                <button type="button" className={`btn btn-block ${['reject', 'delete-room', 'cancel-reservation'].includes(action.type) ? 'btn-danger' : ''}`} onClick={runAction} disabled={busy}>{busy ? 'Working…' : 'Confirm'}</button>
                <button type="button" className="btn btn-outline btn-block" onClick={() => setAction(null)}>Cancel</button>
              </>
            )
          }
        >
          {action.type === 'approve' || action.type === 'reject' ? (
            <>
              <div className="detail-list">
                <div className="detail-line"><span>Room</span><strong>{action.request.building} · {action.request.roomName}</strong></div>
                <div className="detail-line"><span>Student</span><strong>{action.request.studentName} ({action.request.studentId})</strong></div>
                <div className="detail-line"><span>Date</span><strong>{formatDate(action.request.reservedDate)}</strong></div>
                <div className="detail-line"><span>Duration</span><strong className="num">{action.request.durationMinutes} min</strong></div>
                <div className="detail-line"><span>Purpose</span><strong>{action.request.purpose}</strong></div>
              </div>
              <div className={`alert ${action.type === 'approve' ? 'alert-info' : 'alert-warning'}`} style={{ marginTop: 14 }}>
                {action.type === 'approve' ? 'The room will be reserved for this student.' : 'This action cannot be undone.'}
              </div>
            </>
          ) : action.type === 'add-room' ? (
            <form id="add-room-form" className="stack" onSubmit={submitRoom}>
              <Field label="Building">
                <select className="select" value={newRoom.building} onChange={(event) => setNewRoom({ ...newRoom, building: event.target.value })}>
                  {BUILDINGS.map((building) => <option key={building} value={building}>{building}</option>)}
                </select>
              </Field>
              <Field label="Room name"><input className="input" value={newRoom.name} onChange={(event) => setNewRoom({ ...newRoom, name: event.target.value })} placeholder="A-103" /></Field>
              <Field label="Capacity"><input className="input" type="number" min="1" value={newRoom.capacity} onChange={(event) => setNewRoom({ ...newRoom, capacity: event.target.value })} placeholder="40" /></Field>
            </form>
          ) : (
            <p className="small">
              {action.type === 'delete-room' ? `Delete ${action.room.name}?` : action.type === 'release' ? `Release ${action.room.name} back to available?` : 'Cancel this reservation?'}
            </p>
          )}
        </Modal>
      )}
    </>
  )
}
