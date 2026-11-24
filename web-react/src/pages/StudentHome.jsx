import { useNavigate } from 'react-router-dom'
import { BuildingRow, RequestRow } from '../components/cards'
import Icon from '../components/Icon'
import { Alert, EmptyState, KpiBand, Loading } from '../components/ui'
import { useAuth } from '../context/AuthContext'
import { BUILDINGS, statsFromRooms } from '../data/constants'
import { useMyRequests, useRooms } from '../hooks/useFirestoreData'

export default function StudentHome() {
  const { profile } = useAuth()
  const { data: rooms, loading: roomsLoading, error: roomsError } = useRooms()
  const { data: requests, loading: requestsLoading } = useMyRequests(profile?.uid ?? '')
  const navigate = useNavigate()
  const loading = roomsLoading || requestsLoading

  const recent = (requests ?? [])
    .slice()
    .sort((a, b) => (b.submittedAt?.toMillis?.() ?? 0) - (a.submittedAt?.toMillis?.() ?? 0))
    .slice(0, 3)

  return (
    <>
      {loading && <Loading />}
      {roomsError && <Alert tone="error">Unable to load rooms: {roomsError.message}</Alert>}

      {!loading && rooms && (
        <>
          <section className="panel">
            <div className="panel-head">
              <div>
                <div className="label">Live overview</div>
                <div className="panel-title">Campus availability</div>
              </div>
              <span className="tiny muted">Updated just now</span>
            </div>
            <div style={{ padding: 4 }}><KpiBand stats={statsFromRooms(rooms)} /></div>
          </section>

          <div className="row-between" style={{ margin: '28px 0 14px' }}>
            <h2 className="section-title">Browse buildings</h2>
            <span className="tiny muted">Select a building to see rooms</span>
          </div>
          {rooms.length === 0 ? (
            <EmptyState title="No rooms yet" message="An administrator will add rooms to the system." icon="building" />
          ) : (
            <div className="stack">
              {BUILDINGS.map((building) => (
                <BuildingRow
                  key={building}
                  building={building}
                  rooms={rooms}
                  onClick={() => navigate(`/rooms/${encodeURIComponent(building)}`)}
                />
              ))}
            </div>
          )}

          <div className="row-between" style={{ margin: '28px 0 14px' }}>
            <h2 className="section-title">Recent requests</h2>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => navigate('/requests')}>
              View all <Icon name="arrowRight" size={14} />
            </button>
          </div>
          {recent.length === 0 ? (
            <EmptyState title="No requests yet" message="When you request a room, its status will appear here." icon="list" />
          ) : (
            <div className="stack">
              {recent.map((request) => (
                <RequestRow key={request.id} request={request} onClick={() => navigate('/requests')} />
              ))}
            </div>
          )}
        </>
      )}
    </>
  )
}
