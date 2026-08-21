import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { registerUser } from '../api/authApi'
import { useAuth } from '../context/AuthContext'

const inputClass =
  'w-full bg-white border border-slate-300 focus:border-orange-500 text-slate-900 placeholder:text-slate-400 dark:bg-slate-800 dark:border-slate-700 dark:text-white dark:placeholder:text-slate-600 rounded-xl px-4 py-3 text-sm outline-none transition-colors'

export default function RegisterPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  function handleChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    setLoading(true)
    setError(null)
    try {
      const data = await registerUser(form)
      login(data.token, data.user)
      navigate('/my-reports')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Create account</h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">Track your reports and stay updated</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white border border-slate-200 shadow-sm dark:shadow-none dark:bg-slate-900/50 dark:border-slate-800 rounded-2xl p-6 space-y-4 transition-colors">
          <div>
            <label className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide block mb-1.5">Full Name</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              className={inputClass}
              placeholder="Ravi Mehta"
            />
          </div>

          <div>
            <label className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide block mb-1.5">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              className={inputClass}
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide block mb-1.5">Password</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
              minLength={8}
              className={inputClass}
              placeholder="Min 8 characters"
            />
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-red-600 dark:text-red-400 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white py-3 rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Creating account...</>
            ) : 'Create Account'}
          </button>

          <p className="text-center text-sm text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="text-orange-500 hover:text-orange-600 dark:text-orange-400 dark:hover:text-orange-300">Sign in</Link>
          </p>
        </form>
      </div>
    </div>
  )
}
