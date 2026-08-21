import { useState } from 'react'
import { confirmReport } from '../../api/reportsApi'
import { formatDamageType, formatConfidence, formatDate } from '../../utils/formatters'
import { useAuth } from '../../context/AuthContext'

export default function StepConfirm({ capture, detection, onComplete, onBack }) {
  const { user } = useAuth()

  const [description, setDescription] = useState('')
  const [email, setEmail] = useState(user?.email || '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const charCount = description.length
  const maxChars = 500

  async function handleSubmit() {
    setLoading(true)
    setError(null)
    try {
      const data = await confirmReport({
        tempId: detection.tempId,
        damageType: detection.damageType,
        description: description.trim(),
        email: email.trim() || undefined,
      })
      onComplete(data) // { trackingId, pdfUrl }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">

      {/* Summary card */}
      <div className="bg-slate-50 border border-slate-200 dark:bg-slate-800/50 dark:border-slate-700 rounded-xl overflow-hidden transition-colors">
        <div className="flex gap-3 p-4">
          <img
            src={detection.imageUrl || capture.previewUrl}
            alt="Damage"
            className="w-20 h-20 rounded-lg object-cover shrink-0"
          />
          <div className="space-y-1.5 min-w-0">
            <div>
              <div className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide">Damage Type</div>
              <div className="font-semibold text-slate-900 dark:text-white">{formatDamageType(detection.damageType)}</div>
            </div>
            {detection.confidence && (
              <div className="text-xs text-orange-500 dark:text-orange-400">
                AI Confidence: {formatConfidence(detection.confidence)}
                {detection.userOverrode && ' (manually corrected)'}
              </div>
            )}
            {detection.address && (
              <div className="text-xs text-slate-500 dark:text-slate-400 truncate">{detection.address}</div>
            )}
            {capture.coords && (
              <div className="text-xs text-slate-500">
                {capture.coords.lat.toFixed(4)}, {capture.coords.lng.toFixed(4)}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide block mb-2">
          Description <span className="normal-case text-slate-400 dark:text-slate-600">(optional)</span>
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value.slice(0, maxChars))}
          placeholder="E.g. Large pothole near the school gate causing traffic slowdown..."
          rows={3}
          className="w-full bg-white border border-slate-300 focus:border-orange-500 text-slate-900 placeholder:text-slate-400 dark:bg-slate-800 dark:border-slate-700 dark:text-white dark:placeholder:text-slate-600 rounded-xl px-4 py-3 text-sm outline-none resize-none transition-colors"
        />
        <div className={`text-right text-xs mt-1 ${charCount > maxChars * 0.9 ? 'text-orange-500 dark:text-orange-400' : 'text-slate-400 dark:text-slate-600'}`}>
          {charCount}/{maxChars}
        </div>
      </div>

      {/* Email */}
      <div>
        <label className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide block mb-2">
          Email for tracking ID <span className="normal-case text-slate-400 dark:text-slate-600">(optional)</span>
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="w-full bg-white border border-slate-300 focus:border-orange-500 text-slate-900 placeholder:text-slate-400 dark:bg-slate-800 dark:border-slate-700 dark:text-white dark:placeholder:text-slate-600 rounded-xl px-4 py-3 text-sm outline-none transition-colors"
        />
        <p className="text-xs text-slate-400 dark:text-slate-600 mt-1">
          We'll send you a tracking ID and PDF complaint receipt.
        </p>
      </div>

      {/* Info banner */}
      <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3 text-xs text-blue-700 dark:text-blue-300">
        📄 A PDF complaint will be auto-generated and forwarded to Surat Municipal Corporation.
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-red-600 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={onBack}
          disabled={loading}
          className="flex-1 border border-slate-300 hover:border-slate-400 text-slate-700 dark:border-slate-700 dark:hover:border-slate-500 dark:text-slate-300 py-3 rounded-xl text-sm disabled:opacity-50 transition-colors"
        >
          ← Back
        </button>
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="flex-1 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white py-3.5 rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Submitting...
            </>
          ) : (
            'Submit Report 🚀'
          )}
        </button>
      </div>
    </div>
  )
}
