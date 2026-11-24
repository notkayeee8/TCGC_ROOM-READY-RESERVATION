export function toDate(value) {
  if (!value) return null
  if (typeof value.toDate === 'function') return value.toDate()
  if (value instanceof Date) return value
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export function formatDate(value) {
  const date = toDate(value)
  return date ? `${MONTHS[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}` : '—'
}

export function formatDateTime(value) {
  const date = toDate(value)
  if (!date) return '—'
  return `${MONTHS[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()} at ${formatTime(date)}`
}

export function formatTime(value) {
  const date = toDate(value)
  if (!date) return '—'
  const hours = date.getHours()
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const period = hours >= 12 ? 'PM' : 'AM'
  const hour = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours
  return `${hour}:${minutes} ${period}`
}

export function endTimeLabel(dateValue, durationMinutes) {
  const date = toDate(dateValue)
  if (!date) return '—'
  return formatTime(new Date(date.getTime() + (Number(durationMinutes) || 0) * 60000))
}

export function formatInputDate(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function parseInputDate(value) {
  const [year, month, day] = String(value).split('-').map(Number)
  return new Date(year, month - 1, day)
}

export function sameDay(a, b) {
  const first = toDate(a)
  const second = toDate(b)
  if (!first || !second) return false
  return first.getFullYear() === second.getFullYear()
    && first.getMonth() === second.getMonth()
    && first.getDate() === second.getDate()
}
