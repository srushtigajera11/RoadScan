import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getMyReports } from '../api/reportsApi'
import { formatDate, formatDamageType, formatConfidence, statusBadgeClass } from '../utils/formatters'

export default function MyReportsPage() {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    getMyReports()
      .then(setReports)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  const STATUS_LABELS = { open: 'Open', in_progress: 'In Progress', resolved: 'Resolved' }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-orange-400 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-3xl mx-auto px-4 py-8">

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">My Reports</h1>
            <p className="text-slate-400 text-sm mt-0.5">{reports.length} total submission{reports.length !== 1 ? 's' : ''}</p>
          </div>
          <Link
            to="/report"
            className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors"
          >
            + New Report
          </Link>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-400 text-sm mb-4">
            {error}
          </div>
        )}

        {reports.length === 0 && !error && (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">🛣️</div>
            <p className="text-slate-400 mb-4">You haven't submitted any reports yet.</p>
            <Link
              to="/report"
              className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-xl text-sm font-semibold transition-colors inline-block"
            >
              Report Road Damage
            </Link>
          </div>
        )}

        <div className="space-y-3">
          {reports.map((report) => (
            <div
              key={report._id}
              className="bg-slate-800/30 border border-slate-700/50 hover:border-slate-600 rounded-xl overflow-hidden flex transition-colors"
            >
              {report.imageUrl && (
                <img
                  src={report.imageUrl}
                  alt="Damage"
                  className="w-20 h-20 object-cover shrink-0"
                />
              )}
              <div className="flex-1 p-4 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="font-mono text-sm font-bold text-orange-400">{report.trackingId}</div>
                    <div className="font-medium text-white text-sm mt-0.5">{formatDamageType(report.damageType)}</div>
                    <div className="text-xs text-slate-500 mt-0.5 truncate">{report.address || 'Location unavailable'}</div>
                  </div>
                  <span className={`shrink-0 text-xs font-medium px-2.5 py-1 rounded-full whitespace-nowrap ${statusBadgeClass(report.status)}`}>
                    {STATUS_LABELS[report.status]}
                  </span>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <div className="text-xs text-slate-500">{formatDate(report.createdAt)}</div>
                  <Link
                    to={`/track?id=${report.trackingId}`}
                    className="text-xs text-orange-400 hover:text-orange-300"
                  >
                    View details →
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}
