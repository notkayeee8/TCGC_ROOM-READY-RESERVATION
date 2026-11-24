export const BUILDINGS = ['Annex', 'Main', 'Tab']

export const BUILDING_COLORS = {
  Annex: '#4f46e5',
  Main: '#0284c7',
  Tab: '#059669',
}

export const ROOM_FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'available', label: 'Available' },
  { value: 'occupied', label: 'Occupied' },
  { value: 'reserved', label: 'Reserved' },
]

export const PURPOSE_TYPES = [
  { value: 'classSchedule', label: 'Class Schedule' },
  { value: 'groupStudy', label: 'Group Study' },
  { value: 'meeting', label: 'Meeting' },
  { value: 'other', label: 'Other' },
]

export const PURPOSE_LABELS = Object.fromEntries(PURPOSE_TYPES.map((type) => [type.value, type.label]))

export const DURATIONS = [15, 30, 45, 60]

export const STATUS_COLORS = {
  available: 'var(--success)',
  occupied: 'var(--danger)',
  reserved: 'var(--warning)',
  pending: 'var(--warning)',
  approved: 'var(--success)',
  rejected: 'var(--danger)',
}

export function occupancyLabel(room) {
  if (room.status === 'available') return 'Available'
  if (room.status === 'reserved') return 'Reserved'
  if (room.occupancyType === 'classSchedule') return 'Class in Progress'
  if (room.occupancyType === 'meeting') return 'Meeting in Progress'
  return 'Occupied'
}

export function typeLabel(room) {
  if (room.status === 'available') return 'Free'
  if (room.status === 'reserved') return 'Reserved'
  if (room.occupancyType === 'classSchedule') return 'Class'
  if (room.occupancyType === 'meeting') return 'Meeting'
  return 'Occupied'
}

export function statsFromRooms(rooms) {
  return {
    total: rooms.length,
    available: rooms.filter((room) => room.status === 'available').length,
    occupied: rooms.filter((room) => room.status === 'occupied').length,
    reserved: rooms.filter((room) => room.status === 'reserved').length,
  }
}
