import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { getReportByTrackingId } from '../api/reportsApi'
import { formatDate, formatDamageType, formatConfidence, statusBadgeClass } from '../utils/formatters'

export default function TrackPage() {
  const [searchParams] = useSearchParams()
  const [trackingId, setTrackingId] = useState(searchParams.get('id') || '')
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Auto-search if ID is in the URL
  useEffect(() => {
    if (searchParams.get('id')) {
      handleSearch()
    }
  }, [])

  async function handleSearch(e) {
    e?.preventDefault()
    if (!trackingId.trim()) return
    setLoading(true)
    setError(null)
    setReport(null)
    try {
      const data = await getReportByTrackingId(trackingId.trim().toUpperCase())
      setReport(data)
    } catch (err) {
      setError('No report found with that tracking ID.')
    } finally {
      setLoading(false)
    }
  }

  const STATUS_STEPS = ['open', 'in_progress', 'resolved']
  const STATUS_LABELS = { open: 'Open', in_progress: 'In Progress', resolved: 'Resolved' }

  function statusStepIndex(status) {
    return STATUS_STEPS.indexOf(status)
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-lg mx-auto px-4 py-8">

        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-white">Track Your Report</h1>
          <p className="text-slate-400 text-sm mt-1">Enter your tracking ID to check status</p>
        </div>

        {/* Search form */}
        <form onSubmit={handleSearch} className="flex gap-2 mb-8">
          <input
            type="text"
            value={trackingId}
            onChange={(e) => setTrackingId(e.target.value.toUpperCase())}
            placeholder="e.g. RDS-20260001"
            className="flex-1 bg-slate-800 border border-slate-700 focus:border-orange-500 text-white rounded-xl px-4 py-3 text-sm outline-none font-mono placeholder:text-slate-600 transition-colors"
          />
          <button
            type="submit"
            disabled={loading || !trackingId.trim()}
            className="bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white px-5 py-3 rounded-xl text-sm font-semibold transition-colors"
          >
            {loading ? '...' : 'Search'}
          </button>
        </form>

        {/* Error */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-400 text-sm text-center">
            {error}
          </div>
        )}

        {/* Report result */}
        {report && (
          <div className="space-y-4">

            {/* Status timeline */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5">
              <div className="text-xs text-slate-400 uppercase tracking-wide mb-4">Progress</div>
              <div className="flex items-center">
                {STATUS_STEPS.map((s, idx) => (
                  <div key={s} className="flex items-center flex-1">
                    <div className="flex flex-col items-center gap-1 flex-1">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
                        statusStepIndex(report.status) >= idx
                          ? 'bg-orange-500 border-orange-500 text-white'
                          : 'bg-transparent border-slate-700 text-slate-600'
                      }`}>
                        {statusStepIndex(report.status) > idx ? '✓' : idx + 1}
                      </div>
                      <span className={`text-xs ${statusStepIndex(report.status) >= idx ? 'text-slate-300' : 'text-slate-600'}`}>
                        {STATUS_LABELS[s]}
                      </span>
                    </div>
                    {idx < STATUS_STEPS.length - 1 && (
                      <div className={`h-px flex-1 mx-2 mb-5 ${statusStepIndex(report.status) > idx ? 'bg-orange-500' : 'bg-slate-700'}`} />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Report details */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
              {report.imageUrl && (
                <img src={report.imageUrl} alt="Damage" className="w-full aspect-video object-cover" />
              )}
              <div className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-mono text-orange-400 font-bold">{report.trackingId}</div>
                    <div className="text-xs text-slate-400 mt-0.5">{formatDate(report.createdAt)}</div>
                  </div>
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusBadgeClass(report.status)}`}>
                    {STATUS_LABELS[report.status]}
                  </span>
                </div>

                <div className="border-t border-slate-700 pt-3 grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <div className="text-xs text-slate-400 mb-0.5">Damage Type</div>
                    <div className="font-medium text-white">{formatDamageType(report.damageType)}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-400 mb-0.5">Confidence</div>
                    <div className="font-medium text-orange-400">{formatConfidence(report.confidenceScore)}</div>
                  </div>
                </div>

                {report.address && (
                  <div className="border-t border-slate-700 pt-3">
                    <div className="text-xs text-slate-400 mb-0.5">📍 Location</div>
                    <div className="text-sm text-slate-300">{report.address}</div>
                  </div>
                )}

                {report.description && (
                  <div className="border-t border-slate-700 pt-3">
                    <div className="text-xs text-slate-400 mb-0.5">Description</div>
                    <div className="text-sm text-slate-300">{report.description}</div>
                  </div>
                )}

                {report.pdfUrl && (
                  <div className="border-t border-slate-700 pt-3">
                    <a
                      href={report.pdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-orange-400 hover:text-orange-300 underline"
                    >
                      📄 Download PDF Complaint
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
