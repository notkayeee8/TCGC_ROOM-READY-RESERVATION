import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Icon from '../components/Icon'
import { Alert, Field, Loading, Modal, StatusPill } from '../components/ui'
import { useAuth } from '../context/AuthContext'
import { DURATIONS, PURPOSE_TYPES, occupancyLabel } from '../data/constants'
import { useRooms } from '../hooks/useFirestoreData'
import { checkExistingRequest, submitRequest } from '../services/firestore'
import { endTimeLabel, formatDate, formatInputDate, parseInputDate } from '../utils/format'

const today = () => {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), now.getDate())
}

const PURPOSE_ICONS = { classSchedule: 'book', groupStudy: 'users', meeting: 'handshake', other: 'more' }

export default function RoomDetail() {
  const { roomId } = useParams()
  const { data: rooms, loading } = useRooms()
  const { user, profile } = useAuth()
  const navigate = useNavigate()
  const room = rooms?.find((item) => item.id === roomId)

  const [purposeType, setPurposeType] = useState('groupStudy')
  const [purpose, setPurpose] = useState('')
  const [subject, setSubject] = useState('')
  const [section, setSection] = useState('')
  const [classTime, setClassTime] = useState('')
  const [duration, setDuration] = useState(30)
  const [date, setDate] = useState(formatInputDate(today()))
  const [checking, setChecking] = useState(true)
  const [existing, setExisting] = useState(null)
  const [confirming, setConfirming] = useState(false)
  const [busy, setBusy] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const reservedDate = parseInputDate(date)

  useEffect(() => {
    let active = true
    if (!user?.uid) return undefined
    setChecking(true)
    checkExistingRequest(user.uid, roomId, reservedDate)
      .then((request) => { if (active) setExisting(request) })
      .catch(() => { if (active) setExisting(null) })
      .finally(() => { if (active) setChecking(false) })
    return () => { active = false }
  }, [user?.uid, roomId, date])

  const confirmSubmit = async () => {
    setBusy(true)
    setError('')
    try {
      await submitRequest({
        roomId,
        roomName: room.name,
        building: room.building,
        studentId: user.uid,
        studentName: profile?.name ?? 'Student',
        purpose: purposeType === 'classSchedule' ? subject.trim() : purpose.trim(),
        purposeType,
        subject: purposeType === 'classSchedule' ? subject.trim() : null,
        section: purposeType === 'classSchedule' ? section.trim() : null,
        classTime: purposeType === 'classSchedule' ? classTime.trim() : null,
        durationMinutes: duration,
        reservedDate,
      })
      setSent(true)
      setConfirming(false)
    } catch (submitError) {
      setError(submitError.message ?? 'Unable to submit request.')
      setConfirming(false)
    } finally {
      setBusy(false)
    }
  }

  if (loading) return <Loading />
  if (!room) return <Alert tone="error">Room not found.</Alert>

  const canSubmit = purposeType === 'classSchedule'
    ? subject.trim() && section.trim() && classTime.trim()
    : purpose.trim()
  const maxDate = formatInputDate(new Date(today().getTime() + 30 * 86400000))

  return (
    <>
      <div className="row-between" style={{ marginBottom: 18 }}>
        <button type="button" className="btn btn-outline btn-sm" onClick={() => navigate(-1)}>
          <Icon name="chevronLeft" size={15} /> Back to rooms
        </button>
        <button type="button" className="btn btn-ghost btn-sm" onClick={() => navigate('/requests')}>My requests</button>
      </div>

      <div className="two-col">
        <div className="stack">
          <div className="status-hero">
            <div style={{ color: room.status === 'available' ? 'var(--success)' : 'var(--danger)' }}>
              <Icon name={room.status === 'available' ? 'check' : 'info'} size={30} />
            </div>
            <strong>{occupancyLabel(room)}</strong>
            {room.occupiedUntil && <p className="tiny muted" style={{ marginTop: 4 }}>Until {room.occupiedUntil}</p>}
          </div>

          <div className="panel">
            <div className="panel-head"><span className="panel-title">Room information</span><StatusPill status={room.status}>{occupancyLabel(room)}</StatusPill></div>
            <div className="panel-body detail-list">
              <div className="detail-line"><span>Building</span><strong>{room.building}</strong></div>
              <div className="detail-line"><span>Room</span><strong>{room.name}</strong></div>
              <div className="detail-line"><span>Capacity</span><strong className="num">{room.capacity} students</strong></div>
              <div className="detail-line"><span>Status</span><strong>{occupancyLabel(room)}</strong></div>
              {room.reservedBy && <div className="detail-line"><span>Reserved by</span><strong>{room.reservedBy}</strong></div>}
            </div>
          </div>
        </div>

        <div className="panel">
          <div className="panel-head">
            <div>
              <div className="label">Reservation</div>
              <div className="panel-title">Request to reserve</div>
            </div>
            <Icon name="calendar" size={18} />
          </div>
          <div className="panel-body">
            {checking && <Loading label="Checking your requests…" />}

            {!checking && sent && (
              <div className="alert alert-success" style={{ flexDirection: 'column', gap: 8 }}>
                <strong>Request submitted</strong>
                <span>Your request is pending admin approval. Check My Requests for updates.</span>
                <button type="button" className="btn btn-sm" onClick={() => navigate('/requests')}>View my requests</button>
              </div>
            )}

            {!checking && !sent && room.status !== 'available' && (
              <Alert tone="error">This room is currently unavailable. Check back later or try another room.</Alert>
            )}

            {!checking && !sent && room.status === 'available' && (
              <>
                {existing && (
                  <div className="alert alert-warning" style={{ marginBottom: 16 }}>
                    You already have a <strong>{existing.status}</strong> request for this room on {formatDate(existing.reservedDate)}.
                  </div>
                )}

                <div className="stack">
                  <div>
                    <span className="field-label">Purpose type</span>
                    <div className="purpose-grid" style={{ marginTop: 8 }}>
                      {PURPOSE_TYPES.map((type) => (
                        <button
                          key={type.value}
                          type="button"
                          className={`purpose-option ${purposeType === type.value ? 'active' : ''}`}
                          onClick={() => setPurposeType(type.value)}
                        >
                          <Icon name={PURPOSE_ICONS[type.value]} size={20} />
                          <span>{type.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {purposeType === 'classSchedule' ? (
                    <>
                      <Alert tone="info">Fill in your class details. Admin will verify this against your COR before approving.</Alert>
                      <Field label="Subject"><input className="input" value={subject} onChange={(event) => setSubject(event.target.value)} placeholder="Data Structures" /></Field>
                      <Field label="Section"><input className="input" value={section} onChange={(event) => setSection(event.target.value)} placeholder="BSCS 2-A" /></Field>
                      <Field label="Class time"><input className="input" value={classTime} onChange={(event) => setClassTime(event.target.value)} placeholder="8:00 AM - 9:30 AM" /></Field>
                    </>
                  ) : (
                    <Field label="Purpose">
                      <textarea
                        className="textarea"
                        value={purpose}
                        onChange={(event) => setPurpose(event.target.value)}
                        placeholder={purposeType === 'groupStudy' ? 'e.g. Finals Review, Problem Set' : purposeType === 'meeting' ? 'e.g. Club Meeting' : 'Describe your purpose'}
                      />
                    </Field>
                  )}

                  <Field label="Reservation date" hint="Choose a date within the next 30 days.">
                    <input className="input" type="date" min={formatInputDate(today())} max={maxDate} value={date} onChange={(event) => setDate(event.target.value)} />
                  </Field>

                  <div>
                    <span className="field-label">Duration</span>
                    <div className="chips" style={{ marginTop: 8 }}>
                      {DURATIONS.map((minutes) => (
                        <button key={minutes} type="button" className={`chip ${duration === minutes ? 'active' : ''}`} onClick={() => setDuration(minutes)}>{minutes} min</button>
                      ))}
                    </div>
                  </div>

                  {error && <Alert tone="error">{error}</Alert>}

                  <button type="button" className="btn btn-block" disabled={!canSubmit || Boolean(existing) || busy} onClick={() => setConfirming(true)}>
                    {existing ? 'Request already submitted' : busy ? 'Submitting…' : 'Submit request'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {confirming && (
        <Modal
          title="Confirm reservation request"
          onClose={() => setConfirming(false)}
          actions={
            <>
              <button type="button" className="btn btn-block" onClick={confirmSubmit} disabled={busy}>{busy ? 'Submitting…' : 'Confirm request'}</button>
              <button type="button" className="btn btn-outline btn-block" onClick={() => setConfirming(false)}>Cancel</button>
            </>
          }
        >
          <div className="detail-list">
            <div className="detail-line"><span>Room</span><strong>{room.building} · {room.name}</strong></div>
            <div className="detail-line"><span>Date</span><strong>{formatDate(reservedDate)}</strong></div>
            <div className="detail-line"><span>Duration</span><strong className="num">{duration} min</strong></div>
            <div className="detail-line"><span>Until</span><strong>{endTimeLabel(reservedDate, duration)}</strong></div>
            <div className="detail-line"><span>Purpose</span><strong>{purposeType === 'classSchedule' ? subject : purpose}</strong></div>
          </div>
          <div className="alert alert-warning" style={{ marginTop: 14 }}>Once submitted, you cannot edit or delete this request.</div>
        </Modal>
      )}
    </>
  )
}
