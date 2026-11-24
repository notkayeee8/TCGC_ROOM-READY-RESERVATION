import { HashRouter, Navigate, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import { Loading } from './components/ui'
import { AuthProvider, useAuth } from './context/AuthContext'
import AdminDashboard from './pages/AdminDashboard'
import LoginPage from './pages/LoginPage'
import MyRequests from './pages/MyRequests'
import RoomDetail from './pages/RoomDetail'
import RoomList from './pages/RoomList'
import SignupPage from './pages/SignupPage'
import StudentHome from './pages/StudentHome'

function ProtectedRoute({ role, children }) {
  const { user, profile, loading } = useAuth()
  if (loading) return <Loading label="Checking your session…" />
  if (!user) return <Navigate to="/login" replace />
  if (profile?.role !== role) {
    return <Navigate to={profile?.role === 'admin' ? '/admin' : '/student'} replace />
  }
  return <Layout>{children}</Layout>
}

function PublicRoute({ children }) {
  const { user, profile, loading } = useAuth()
  if (loading) return <Loading label="Checking your session…" />
  if (user && profile) {
    return <Navigate to={profile.role === 'admin' ? '/admin' : '/student'} replace />
  }
  return children
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/signup" element={<PublicRoute><SignupPage /></PublicRoute>} />
      <Route path="/student" element={<ProtectedRoute role="student"><StudentHome /></ProtectedRoute>} />
      <Route path="/rooms/:building" element={<ProtectedRoute role="student"><RoomList /></ProtectedRoute>} />
      <Route path="/rooms/:building/:roomId" element={<ProtectedRoute role="student"><RoomDetail /></ProtectedRoute>} />
      <Route path="/requests" element={<ProtectedRoute role="student"><MyRequests /></ProtectedRoute>} />
      <Route path="/admin" element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <HashRouter>
        <AppRoutes />
      </HashRouter>
    </AuthProvider>
  )
}
