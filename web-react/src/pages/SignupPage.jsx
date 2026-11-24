import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Icon from '../components/Icon'
import { Alert, Field } from '../components/ui'
import { useAuth } from '../context/AuthContext'

const EMPTY = { name: '', studentId: '', email: '', password: '', confirm: '' }

export default function SignupPage() {
  const [values, setValues] = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const { signupStudent } = useAuth()
  const navigate = useNavigate()

  const update = (key) => (event) => {
    setValues((current) => ({ ...current, [key]: event.target.value }))
    setErrors((current) => ({ ...current, [key]: undefined }))
  }

  const validate = () => {
    const next = {}
    if (values.name.trim().length < 3) next.name = 'Name must be at least 3 characters.'
    if (values.studentId.trim().length < 4) next.studentId = 'Enter a valid student ID.'
    if (!values.email.includes('@') || !values.email.includes('.')) next.email = 'Enter a valid email address.'
    if (values.password.length < 6) next.password = 'Password must be at least 6 characters.'
    if (values.confirm !== values.password) next.confirm = 'Passwords do not match.'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!validate()) return
    setBusy(true)
    setError('')
    try {
      await signupStudent(values)
      navigate('/login', { replace: true, state: { message: 'Account created. You can now sign in.' } })
    } catch (authError) {
      const messages = {
        'auth/email-already-in-use': 'An account with this email already exists.',
        'auth/weak-password': 'Password is too weak. Use at least 6 characters.',
        'auth/invalid-email': 'Please enter a valid email address.',
      }
      setError(messages[authError.code] ?? 'Registration failed. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="auth-page">
      <section className="auth-visual">
        <div className="auth-brand"><span className="sidebar-mark"><Icon name="building" size={18} /></span> RoomReady</div>
        <div>
          <h2 className="auth-claim">Your next class<br /><span>starts here.</span></h2>
          <p className="auth-copy">Create a student account to request classrooms and follow your approvals in real time.</p>
          <div className="room-motif" aria-hidden="true">
            {[0, 1, 1, 0, 1, 0, 1, 1].map((on, index) => <i key={index} className={on ? 'on' : ''} />)}
          </div>
        </div>
        <p className="tiny" style={{ color: '#64748b' }}>Student access · RoomReady</p>
      </section>

      <section className="auth-panel">
        <div className="auth-form">
          <h1>Create your account</h1>
          <p>Student access only. Administrators are managed separately.</p>

          <form onSubmit={handleSubmit}>
            <div className="stack">
              {error && <Alert tone="error">{error}</Alert>}
              <Field label="Full name" error={errors.name}>
                <input className={`input ${errors.name ? 'invalid' : ''}`} value={values.name} onChange={update('name')} placeholder="Juan dela Cruz" />
              </Field>
              <Field label="Student ID" error={errors.studentId}>
                <input className={`input ${errors.studentId ? 'invalid' : ''}`} value={values.studentId} onChange={update('studentId')} placeholder="2023-00123" />
              </Field>
              <Field label="Email address" error={errors.email}>
                <input className={`input ${errors.email ? 'invalid' : ''}`} type="email" value={values.email} onChange={update('email')} placeholder="juan@school.edu.ph" />
              </Field>
              <Field label="Password" error={errors.password}>
                <input className={`input ${errors.password ? 'invalid' : ''}`} type="password" value={values.password} onChange={update('password')} placeholder="At least 6 characters" />
              </Field>
              <Field label="Confirm password" error={errors.confirm}>
                <input className={`input ${errors.confirm ? 'invalid' : ''}`} type="password" value={values.confirm} onChange={update('confirm')} placeholder="Re-enter your password" />
              </Field>
              <button type="submit" className="btn btn-block" disabled={busy}>{busy ? 'Creating account…' : 'Create account'}</button>
            </div>
          </form>

          <p className="auth-foot">Already registered? <Link to="/login">Sign in</Link></p>
        </div>
      </section>
    </div>
  )
}
