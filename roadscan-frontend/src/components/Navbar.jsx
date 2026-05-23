import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  function handleLogout() {
    logout()
    navigate('/')
  }

  function isActive(path) {
    return location.pathname === path
      ? 'text-orange-400'
      : 'text-slate-400 hover:text-slate-200'
  }

  return (
    <nav className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 font-bold text-lg">
          <span className="text-2xl">🛣️</span>
          <span className="text-white">Road</span>
          <span className="text-orange-400">Scan</span>
        </Link>

        {/* Nav links */}
        <div className="flex items-center gap-6 text-sm font-medium">
          <Link to="/" className={isActive('/')}>Home</Link>
          <Link to="/report" className={isActive('/report')}>Report</Link>
          <Link to="/track" className={isActive('/track')}>Track</Link>

          {user?.role === 'municipal' || user?.role === 'admin' ? (
            <Link to="/dashboard" className={isActive('/dashboard')}>Dashboard</Link>
          ) : null}

          {user ? (
            <>
              {user.role === 'citizen' && (
                <Link to="/my-reports" className={isActive('/my-reports')}>My Reports</Link>
              )}
              <button
                onClick={handleLogout}
                className="text-slate-400 hover:text-red-400 transition-colors"
              >
                Logout
              </button>
              <span className="text-xs text-slate-600 border border-slate-700 rounded-full px-2 py-0.5">
                {user.name?.split(' ')[0]}
              </span>
            </>
          ) : (
            <>
              <Link to="/login" className={isActive('/login')}>Login</Link>
              <Link
                to="/register"
                className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
