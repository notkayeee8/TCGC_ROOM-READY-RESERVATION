import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth'
import { auth } from '../firebase'
import { ADMIN_EMAIL, ADMIN_ID_ALIASES } from '../firebaseConfig'
import { getUserProfile, setUserProfile } from '../services/firestore'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => onAuthStateChanged(auth, async (firebaseUser) => {
    setUser(firebaseUser)
    if (!firebaseUser) {
      setProfile(null)
      setLoading(false)
      return
    }
    try {
      setProfile(await getUserProfile(firebaseUser.uid))
    } catch {
      setProfile(null)
    }
    setLoading(false)
  }), [])

  const loginWithEmail = async (email, password) => {
    const credential = await signInWithEmailAndPassword(auth, email.trim(), password)
    const loadedProfile = await getUserProfile(credential.user.uid)
    setProfile(loadedProfile)
    return loadedProfile
  }

  const loginStudent = (email, password) => loginWithEmail(email, password)

  const loginAdmin = (adminId, password) => {
    const normalized = adminId.trim().toLowerCase()
    const email = ADMIN_ID_ALIASES.includes(normalized) ? ADMIN_EMAIL : adminId.trim()
    return loginWithEmail(email, password)
  }

  const signupStudent = async ({ name, studentId, email, password }) => {
    const credential = await createUserWithEmailAndPassword(auth, email.trim(), password)
    await setUserProfile(credential.user.uid, {
      id: studentId.trim(),
      name: name.trim(),
      email: email.trim(),
      role: 'student',
    })
    await signOut(auth)
  }

  const logout = () => signOut(auth)

  const value = useMemo(() => ({
    user,
    profile,
    loading,
    isAdmin: profile?.role === 'admin',
    isStudent: profile?.role === 'student',
    loginStudent,
    loginAdmin,
    signupStudent,
    logout,
  }), [user, profile, loading])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used inside AuthProvider')
  return context
}
