import { useState } from 'react'
import { RequestRow } from '../components/cards'
import Icon from '../components/Icon'
import { Alert, EmptyState, Loading, StatusPill } from '../components/ui'
import { PURPOSE_LABELS } from '../data/constants'
import { useAuth } from '../context/AuthContext'
import { useMyRequests } from '../hooks/useFirestoreData'
import { endTimeLabel, formatDate, formatDateTime } from '../utils/format'

const TABS = [
  { status: 'pending', label: 'Pending', empty: 'No pending requests', hint: 'Requests waiting for admin approval will appear here.' },
  { status: 'approved', label: 'Approved', empty: 'No approved requests', hint: 'Approved reservations will appear here.' },
  { status: 'rejected', label: 'Rejected', empty: 'No rejected requests', hint: 'Rejected requests will appear here.' },
]

export default function MyRequests() {
  const [tab, setTab] = useState(0)
  const [openId, setOpenId] = useState(null)
  const { user } = useAuth()
  const { data: requests, loading, error } = useMyRequests(user?.uid ?? '')

  const counts = Object.fromEntries(TABS.map((item) => [
    item.status,
    (requests ?? []).filter((request) => request.status === item.status).length,
  ]))
  const visible = (requests ?? [])
    .filter((request) => request.status === TABS[tab].status)
    .sort((a, b) => (b.submittedAt?.toMillis?.() ?? 0) - (a.submittedAt?.toMillis?.() ?? 0))

  return (
    <>
      <section className="panel" style={{ marginBottom: 20 }}>
        <div className="panel-body" style={{ padding: 8 }}>
          <div className="tabs" style={{ border: 'none', padding: 0 }}>
            {TABS.map((item, index) => (
              <button key={item.status} type="button" className={tab === index ? 'active' : ''} onClick={() => { setTab(index); setOpenId(null) }}>
                {item.label} <span className="num">({counts[item.status]})</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {loading && <Loading />}
      {error && <Alert tone="error">Unable to load requests: {error.message}</Alert>}
      {!loading && !error && visible.length === 0 && (
        <EmptyState title={TABS[tab].empty} message={TABS[tab].hint} icon="list" />
      )}

      <div className="stack">
        {visible.map((request) => (
          <div key={request.id}>
            <RequestRow request={request} onClick={() => setOpenId(openId === request.id ? null : request.id)} />
            {openId === request.id && (
              <div className="panel" style={{ marginTop: 8 }}>
                <div className="panel-body">
                  <div className="row-between" style={{ marginBottom: 12 }}>
                    <span className="panel-title">Request details</span>
                    <StatusPill status={request.status}>{request.status.charAt(0).toUpperCase() + request.status.slice(1)}</StatusPill>
                  </div>
                  <div className="detail-list">
                    <div className="detail-line"><span>Request ID</span><strong className="num">{request.id}</strong></div>
                    <div className="detail-line"><span>Reserved date</span><strong>{formatDate(request.reservedDate)}</strong></div>
                    <div className="detail-line"><span>Duration</span><strong>{request.durationMinutes} min · until {endTimeLabel(request.reservedDate, request.durationMinutes)}</strong></div>
                    <div className="detail-line"><span>Purpose type</span><strong>{PURPOSE_LABELS[request.purposeType] ?? 'Other'}</strong></div>
                    <div className="detail-line"><span>Purpose</span><strong>{request.purpose}</strong></div>
                    <div className="detail-line"><span>Submitted</span><strong>{formatDateTime(request.submittedAt)}</strong></div>
                    {request.subject && <div className="detail-line"><span>Subject</span><strong>{request.subject}</strong></div>}
                    {request.section && <div className="detail-line"><span>Section</span><strong>{request.section}</strong></div>}
                    {request.classTime && <div className="detail-line"><span>Class time</span><strong>{request.classTime}</strong></div>}
                  </div>
                  {request.status === 'approved' && <div className="alert alert-success" style={{ marginTop: 14 }}><Icon name="check" size={16} /> Your request was approved. The room is reserved for you.</div>}
                  {request.status === 'rejected' && <div className="alert alert-error" style={{ marginTop: 14 }}><Icon name="alert" size={16} /> Your request was rejected. Try another room or date.</div>}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  )
}
