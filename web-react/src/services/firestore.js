import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  runTransaction,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
  where,
} from 'firebase/firestore'
import { db } from '../firebase'
import { endTimeLabel, sameDay, toDate } from '../utils/format'

const roomsCollection = collection(db, 'rooms')
const requestsCollection = collection(db, 'reservation_requests')
const reservationsCollection = collection(db, 'reservations')

const mapDoc = (snapshot) => ({ id: snapshot.id, ...snapshot.data() })

export function subscribeRooms(onData, onError) {
  return onSnapshot(roomsCollection, (snapshot) => onData(snapshot.docs.map(mapDoc)), onError)
}

export function subscribeRequests(onData, onError) {
  return onSnapshot(requestsCollection, (snapshot) => onData(snapshot.docs.map(mapDoc)), onError)
}

export function subscribeMyRequests(studentId, onData, onError) {
  return onSnapshot(
    query(requestsCollection, where('studentId', '==', studentId)),
    (snapshot) => onData(snapshot.docs.map(mapDoc)),
    onError,
  )
}

export function subscribeReservations(onData, onError) {
  return onSnapshot(reservationsCollection, (snapshot) => onData(snapshot.docs.map(mapDoc)), onError)
}

export async function checkExistingRequest(studentId, roomId, date) {
  const snapshot = await getDocs(
    query(requestsCollection, where('studentId', '==', studentId), where('roomId', '==', roomId)),
  )
  return snapshot.docs.map(mapDoc).find((request) => sameDay(request.reservedDate, date)) ?? null
}

export async function submitRequest({ roomId, reservedDate, ...rest }) {
  const roomSnapshot = await getDoc(doc(db, 'rooms', roomId))
  if (!roomSnapshot.exists() || roomSnapshot.data().status !== 'available') {
    throw new Error('This room is no longer available.')
  }

  const reference = await addDoc(requestsCollection, {
    ...rest,
    roomId,
    reservedDate: Timestamp.fromDate(reservedDate),
    submittedAt: serverTimestamp(),
    status: 'pending',
  })
  return reference.id
}

export async function approveRequest(request) {
  await runTransaction(db, async (transaction) => {
    const requestRef = doc(db, 'reservation_requests', request.id)
    const roomRef = doc(db, 'rooms', request.roomId)
    const [requestSnapshot, roomSnapshot] = await Promise.all([
      transaction.get(requestRef),
      transaction.get(roomRef),
    ])

    if (!requestSnapshot.exists()) throw new Error('Request not found.')
    if (requestSnapshot.data().status !== 'pending') throw new Error('Request is no longer pending.')
    if (!roomSnapshot.exists()) throw new Error('Room not found.')

    const reservedDate = toDate(request.reservedDate)
    if (!reservedDate) throw new Error('Request has no reservation date.')
    const expiresAt = new Date(reservedDate.getTime() + Number(request.durationMinutes) * 60000)

    transaction.update(requestRef, { status: 'approved' })
    transaction.update(roomRef, {
      status: 'reserved',
      occupancyType: 'reserved',
      occupiedUntil: endTimeLabel(reservedDate, request.durationMinutes),
      expiresAt: Timestamp.fromDate(expiresAt),
      reservedDate: request.reservedDate,
      reservedBy: request.studentName,
      reservedByUid: request.studentId,
      reservationPurpose: request.purpose,
    })
    transaction.set(doc(reservationsCollection), {
      roomId: request.roomId,
      roomName: request.roomName,
      building: request.building,
      reservedBy: request.studentName,
      reservedByUid: request.studentId,
      purpose: request.purpose,
      durationMinutes: request.durationMinutes,
      createdAt: serverTimestamp(),
    })
  })
}

export async function rejectRequest(requestId) {
  await updateDoc(doc(db, 'reservation_requests', requestId), { status: 'rejected' })
}

export async function addRoom({ building, name, capacity }) {
  await addDoc(roomsCollection, {
    building,
    name: name.trim(),
    capacity: Number(capacity),
    status: 'available',
    occupancyType: null,
    occupiedUntil: null,
    expiresAt: null,
    reservedDate: null,
    reservedBy: null,
    reservedByUid: null,
    reservationPurpose: null,
  })
}

export async function deleteRoom(roomId) {
  await deleteDoc(doc(db, 'rooms', roomId))
}

export async function clearRoom(roomId) {
  await updateDoc(doc(db, 'rooms', roomId), {
    status: 'available',
    occupancyType: null,
    occupiedUntil: null,
    expiresAt: null,
    reservedDate: null,
    reservedBy: null,
    reservedByUid: null,
    reservationPurpose: null,
  })
}

export async function cancelReservation(reservationId) {
  await deleteDoc(doc(db, 'reservations', reservationId))
}

export async function setUserProfile(uid, profile) {
  await setDoc(doc(db, 'users', uid), profile)
}

export async function getUserProfile(uid) {
  const snapshot = await getDoc(doc(db, 'users', uid))
  return snapshot.exists() ? { uid: snapshot.id, ...snapshot.data() } : null
}
