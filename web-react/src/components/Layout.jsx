import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useMyRequests, useRequests } from '../hooks/useFirestoreData'
import Icon from './Icon'

const STUDENT_NAV = [
  { label: 'Home', icon: 'home', path: '/student' },
  { label: 'Rooms', icon: 'building', path: '/rooms/Annex' },
  { label: 'Requests', icon: 'list', path: '/requests', badge: 'my' },
]
const ADMIN_NAV = [
  { label: 'Overview', icon: 'grid', path: '/admin', tab: 0 },
  { label: 'Requests', icon: 'list', path: '/admin', tab: 1, badge: 'all' },
  { label: 'Rooms', icon: 'building', path: '/admin', tab: 2 },
  { label: 'Stats', icon: 'chart', path: '/admin', tab: 3 },
]

const PAGE_TITLES = {
  '/student': ['Classroom availability', 'Find and reserve a room for your class or study group.'],
  '/requests': ['My requests', 'Track the status of your reservation requests.'],
  '/admin': ['Admin dashboard', 'Manage rooms and reservation requests.'],
}

export default function Layout({ children }) {
  const { profile, user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const isAdmin = profile?.role === 'admin'
  const allRequests = useRequests()
  const myRequests = useMyRequests(user?.uid ?? '')
  const pendingCount = (isAdmin ? allRequests.data : myRequests.data)?.filter((request) => request.status === 'pending').length ?? 0

  const navItems = isAdmin ? ADMIN_NAV : STUDENT_NAV
  const isActive = (item) => {
    if (item.tab !== undefined) return location.pathname === '/admin' && (location.state?.tab ?? 0) === item.tab
    if (item.path.startsWith('/rooms')) return location.pathname.startsWith('/rooms')
    return location.pathname === item.path
  }
  const go = (item) => navigate(item.path, item.tab !== undefined ? { state: { tab: item.tab } } : undefined)

  const title = location.pathname.startsWith('/rooms')
    ? ['Rooms', 'Browse classrooms and check their current availability.']
    : PAGE_TITLES[location.pathname] ?? ['RoomReady', '']

  const handleLogout = async () => {
    await logout()
    navigate('/login', { replace: true })
  }

  const navButton = (item, mobile = false) => (
    <button
      key={item.label}
      type="button"
      className={mobile ? (isActive(item) ? 'active' : '') : `nav-item ${isActive(item) ? 'active' : ''}`}
      onClick={() => go(item)}
      aria-current={isActive(item) ? 'page' : undefined}
    >
      <Icon name={item.icon} size={mobile ? 20 : 18} />
      <span>{item.label}</span>
      {item.badge && pendingCount > 0 && <span className={mobile ? '' : 'nav-count'}>{pendingCount}</span>}
    </button>
  )

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <span className="sidebar-mark"><Icon name="building" size={18} /></span>
          <span>RoomReady</span>
        </div>
        <div className="sidebar-section">Workspace</div>
        <nav>{navItems.map((item) => navButton(item))}</nav>
        <div className="sidebar-foot">
          <div className="sidebar-user">
            <div className="avatar">{(profile?.name ?? 'U').charAt(0).toUpperCase()}</div>
            <div>
              <strong>{profile?.name ?? 'User'}</strong>
              <span>{isAdmin ? 'Administrator' : profile?.id ?? 'Student'}</span>
            </div>
          </div>
          <button type="button" className="sidebar-logout" onClick={handleLogout}>
            <Icon name="logout" size={16} /><span>Log out</span>
          </button>
        </div>
      </aside>

      <div className="main-area">
        <div className="mobile-header">
          <div className="brand">
            <span className="brand-mark"><Icon name="building" size={16} /></span>
            RoomReady
          </div>
          <button type="button" onClick={handleLogout}>Log out</button>
        </div>
        <header className="topbar">
          <div>
            <h1>{title[0]}</h1>
            <p>{title[1]}</p>
          </div>
          <div className="topbar-actions">{isAdmin && <span className="label">Admin workspace</span>}</div>
        </header>
        <main className="content">{children}</main>
      </div>

      <nav className="bottom-nav" aria-label="Primary">
        {navItems.map((item) => navButton(item, true))}
      </nav>
    </div>
  )
}
