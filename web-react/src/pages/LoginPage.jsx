import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import Icon from '../components/Icon'
import { Alert, Field } from '../components/ui'
import { useAuth } from '../context/AuthContext'

export default function LoginPage() {
  const [role, setRole] = useState('student')
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const { loginStudent, loginAdmin } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const isAdmin = role === 'admin'

  const switchRole = (nextRole) => {
    setRole(nextRole)
    setIdentifier('')
    setPassword('')
    setError('')
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const id = identifier.trim()
    if (!id) {
      setError(isAdmin ? 'Please enter your admin ID.' : 'Please enter your email.')
      return
    }
    if (!isAdmin && (!id.includes('@') || !id.includes('.'))) {
      setError('Enter a valid email address.')
      return
    }
    if (!password) {
      setError('Please enter your password.')
      return
    }

    setBusy(true)
    setError('')
    try {
      const profile = isAdmin ? await loginAdmin(id, password) : await loginStudent(id, password)
      if (!profile) {
        setError('Account profile not found. Please contact an administrator.')
        return
      }
      navigate(profile.role === 'admin' ? '/admin' : '/student', { replace: true })
    } catch (authError) {
      const messages = {
        'auth/user-not-found': 'No account found with this email.',
        'auth/wrong-password': 'Wrong password. Please try again.',
        'auth/invalid-credential': 'Invalid credentials. Please check your input.',
        'auth/too-many-requests': 'Too many attempts. Please try again later.',
      }
      setError(messages[authError.code] ?? 'Login failed. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="auth-page">
      <section className="auth-visual">
        <div className="auth-brand"><span className="sidebar-mark"><Icon name="building" size={18} /></span> RoomReady</div>
        <div>
          <h2 className="auth-claim">Every classroom,<br /><span>at a glance.</span></h2>
          <p className="auth-copy">Check availability, request a room, and let admins approve it — all in one calm workspace.</p>
          <div className="room-motif" aria-hidden="true">
            {[1, 0, 1, 1, 0, 1, 1, 0].map((on, index) => <i key={index} className={on ? 'on' : ''} />)}
          </div>
        </div>
        <p className="tiny" style={{ color: '#64748b' }}>Campus operations · RoomReady</p>
      </section>

      <section className="auth-panel">
        <div className="auth-form">
          <h1>Sign in to your workspace</h1>
          <p>Use your {isAdmin ? 'administrator' : 'student'} account to continue.</p>

          <form onSubmit={handleSubmit}>
            <div className="segmented">
              <button type="button" className={!isAdmin ? 'active' : ''} onClick={() => switchRole('student')}>Student</button>
              <button type="button" className={isAdmin ? 'active' : ''} onClick={() => switchRole('admin')}>Administrator</button>
            </div>

            <div className="stack" style={{ marginTop: 24 }}>
              {location.state?.message && <Alert tone="success">{location.state.message}</Alert>}
              {error && <Alert tone="error">{error}</Alert>}

              <Field label={isAdmin ? 'Admin ID' : 'Student email'}>
                <input
                  className="input"
                  type={isAdmin ? 'text' : 'email'}
                  autoComplete="username"
                  placeholder={isAdmin ? 'admin' : 'juan@school.edu.ph'}
                  value={identifier}
                  onChange={(event) => setIdentifier(event.target.value)}
                />
              </Field>

              <Field label="Password">
                <div className="row" style={{ alignItems: 'stretch' }}>
                  <input
                    className="input"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                  />
                  <button type="button" className="btn btn-outline" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? 'Hide password' : 'Show password'}>
                    <Icon name={showPassword ? 'eyeOff' : 'eye'} size={17} />
                  </button>
                </div>
              </Field>

              <button type="submit" className="btn btn-block" disabled={busy}>
                {busy ? 'Signing in…' : 'Sign in'} <Icon name="arrowRight" size={16} />
              </button>
            </div>
          </form>

          {!isAdmin && (
            <p className="auth-foot">New here? <Link to="/signup">Create a student account</Link></p>
          )}
        </div>
      </section>
    </div>
  )
}
