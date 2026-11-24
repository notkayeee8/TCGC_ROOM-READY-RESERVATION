import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { RoomRow } from '../components/cards'
import Icon from '../components/Icon'
import { Alert, EmptyState, Loading, StatusPill } from '../components/ui'
import { ROOM_FILTERS, STATUS_COLORS } from '../data/constants'
import { useRooms } from '../hooks/useFirestoreData'

export default function RoomList() {
  const { building } = useParams()
  const decodedBuilding = decodeURIComponent(building)
  const [filter, setFilter] = useState('all')
  const { data: rooms, loading, error } = useRooms()
  const navigate = useNavigate()

  const buildingRooms = (rooms ?? []).filter((room) => room.building === decodedBuilding)
  const visible = filter === 'all' ? buildingRooms : buildingRooms.filter((room) => room.status === filter)

  return (
    <>
      <section className="panel" style={{ marginBottom: 20 }}>
        <div className="panel-head" style={{ flexWrap: 'wrap' }}>
          <div className="chips">
            {ROOM_FILTERS.map((item) => (
              <button key={item.value} type="button" className={`chip ${filter === item.value ? 'active' : ''}`} onClick={() => setFilter(item.value)}>
                {item.label}
              </button>
            ))}
          </div>
          <div className="row" style={{ gap: 14, flexWrap: 'wrap' }}>
            {ROOM_FILTERS.filter((item) => item.value !== 'all').map((item) => (
              <span key={item.value} className="row tiny muted" style={{ gap: 6 }}>
                <span className="status-dot" style={{ background: STATUS_COLORS[item.value] }} /> {item.label}
              </span>
            ))}
          </div>
        </div>
      </section>

      {loading && <Loading />}
      {error && <Alert tone="error">Unable to load rooms: {error.message}</Alert>}
      {!loading && !error && (
        <>
          <div className="row-between" style={{ marginBottom: 12 }}>
            <span className="label">{visible.length} rooms · {decodedBuilding}</span>
            <StatusPill status="available">{buildingRooms.filter((room) => room.status === 'available').length} available</StatusPill>
          </div>
          {visible.length === 0 ? (
            <EmptyState title="No rooms match this filter" message="Choose another status to see more rooms." icon="search" />
          ) : (
            <div className="stack">
              {visible.map((room) => (
                <RoomRow key={room.id} room={room} onClick={() => navigate(`/rooms/${encodeURIComponent(decodedBuilding)}/${room.id}`)} />
              ))}
            </div>
          )}
        </>
      )}
    </>
  )
}
