import { useEffect, useState } from 'react'
import {
  subscribeMyRequests,
  subscribeRequests,
  subscribeReservations,
  subscribeRooms,
} from '../services/firestore'

function useSubscription(subscribe, dependencies = []) {
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    setData(null)
    setError(null)
    return subscribe(
      setData,
      (err) => setError(err),
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies)

  return { data, error, loading: data === null && !error }
}

export function useRooms() {
  return useSubscription(subscribeRooms)
}

export function useRequests() {
  return useSubscription(subscribeRequests)
}

export function useMyRequests(studentId) {
  return useSubscription((onData, onError) => subscribeMyRequests(studentId, onData, onError), [studentId])
}

export function useReservations() {
  return useSubscription(subscribeReservations)
}
