import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import ThemeToggle from './ThemeToggle'

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
      ? 'text-orange-500 dark:text-orange-400'
      : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
  }

  return (
    <nav className="relative border-b border-slate-200 bg-white/80 dark:border-slate-800 dark:bg-slate-900/80 backdrop-blur-sm sticky top-0 z-50 transition-colors duration-300">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 font-bold text-lg">
          <span className="text-2xl">🛣️</span>
          <span className="text-slate-900 dark:text-white">Road</span>
          <span className="text-orange-500 dark:text-orange-400">Scan</span>
        </Link>

        {/* Nav links */}
        <div className="ml-auto flex items-center gap-6 text-sm font-medium">
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
                className="text-slate-500 hover:text-red-500 dark:text-slate-400 dark:hover:text-red-400 transition-colors"
              >
                Logout
              </button>
              <span className="text-xs text-slate-500 border border-slate-300 dark:text-slate-600 dark:border-slate-700 rounded-full px-2 py-0.5">
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

      {/* Theme toggle — pinned to the far right corner of the navbar */}
      <div className="absolute right-2 top-1/2 -translate-y-1/2">
        <ThemeToggle />
      </div>
    </nav>
  )
}
