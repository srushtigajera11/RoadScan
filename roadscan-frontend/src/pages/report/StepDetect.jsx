import { useEffect, useRef, useState } from 'react'
import { uploadReport } from '../../api/reportsApi'
import { formatDamageType, formatConfidence } from '../../utils/formatters'

// Common damage types for the override dropdown
const DAMAGE_TYPES = [
  'pothole',
  'alligator_crack',
  'longitudinal_crack',
  'transverse_crack',
  'waterlogging',
  'broken_divider',
  'damaged_speed_bump',
  'road_collapse',
  'other',
]

export default function StepDetect({ capture, onComplete, onBack }) {
  const { imageFile, previewUrl, coords } = capture

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [result, setResult] = useState(null)          // { tempId, imageUrl, damageType, confidence, address, predictions }
  const [selectedDamage, setSelectedDamage] = useState(null)
  const [userOverrode, setUserOverrode] = useState(false)
  const [cvDown, setCvDown] = useState(false)

  const canvasRef = useRef(null)

  useEffect(() => {
    runDetection()
  }, [])

  async function runDetection() {
    setLoading(true)
    setError(null)
    try {
      const data = await uploadReport(imageFile, coords)
      setResult(data)
      setSelectedDamage(data.damageType)
      drawBoundingBoxes(data.predictions)
    } catch (err) {
      // If CV service is down, allow manual entry
      if (err.message?.includes('CV') || err.message?.includes('inference')) {
        setCvDown(true)
        setSelectedDamage('pothole')
      } else {
        setError(err.message)
      }
    } finally {
      setLoading(false)
    }
  }

  function drawBoundingBoxes(predictions) {
    if (!predictions?.length || !canvasRef.current) return
    const canvas = canvasRef.current
    const img = new Image()
    img.onload = () => {
      canvas.width = img.width
      canvas.height = img.height
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0)

      predictions.forEach((pred) => {
        const { x, y, width, height } = pred
        const x0 = x - width / 2
        const y0 = y - height / 2

        ctx.strokeStyle = '#f97316'
        ctx.lineWidth = 3
        ctx.strokeRect(x0, y0, width, height)

        // Label background
        const label = `${formatDamageType(pred.class)} ${Math.round(pred.confidence * 100)}%`
        ctx.font = 'bold 14px sans-serif'
        const textW = ctx.measureText(label).width
        ctx.fillStyle = '#f97316'
        ctx.fillRect(x0, y0 - 24, textW + 12, 24)
        ctx.fillStyle = '#ffffff'
        ctx.fillText(label, x0 + 6, y0 - 6)
      })
    }
    img.src = result?.imageUrl || previewUrl
  }

  function handleOverride(type) {
    setSelectedDamage(type)
    setUserOverrode(type !== result?.damageType)
  }

  function proceed() {
    onComplete({
      tempId: result?.tempId,
      damageType: selectedDamage,
      imageUrl: result?.imageUrl || previewUrl,
      address: result?.address,
      confidence: result?.confidence,
      userOverrode,
      cvDown,
    })
  }

  // ---- Loading state ----
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4">
        <div className="w-12 h-12 border-2 border-orange-400 border-t-transparent rounded-full animate-spin" />
        <div className="text-slate-600 dark:text-slate-400 text-sm">Analysing road damage...</div>
        <div className="text-xs text-slate-400 dark:text-slate-600">Sending to CV model</div>
      </div>
    )
  }

  // ---- Error state ----
  if (error) {
    return (
      <div className="space-y-4">
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-600 dark:text-red-400 text-sm">
          {error}
        </div>
        <div className="flex gap-3">
          <button onClick={onBack} className="flex-1 border border-slate-300 text-slate-700 dark:border-slate-700 dark:text-slate-300 py-3 rounded-xl text-sm">
            ← Back
          </button>
          <button onClick={runDetection} className="flex-1 bg-orange-500 text-white py-3 rounded-xl text-sm font-semibold">
            Retry
          </button>
        </div>
      </div>
    )
  }

  // ---- CV service down — manual mode ----
  if (cvDown) {
    return (
      <div className="space-y-4">
        <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-4 text-sm text-orange-700 dark:text-orange-300">
          ⚠️ AI detection is temporarily unavailable. Please select the damage type manually.
        </div>
        <img src={previewUrl} alt="Damage" className="w-full rounded-xl object-cover aspect-video" />
        <div>
          <label className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide block mb-2">Damage Type</label>
          <select
            value={selectedDamage}
            onChange={(e) => setSelectedDamage(e.target.value)}
            className="w-full bg-white border border-slate-300 text-slate-900 dark:bg-slate-800 dark:border-slate-700 dark:text-white rounded-xl px-4 py-3 text-sm"
          >
            {DAMAGE_TYPES.map((t) => (
              <option key={t} value={t}>{formatDamageType(t)}</option>
            ))}
          </select>
        </div>
        <div className="flex gap-3">
          <button onClick={onBack} className="flex-1 border border-slate-300 text-slate-700 dark:border-slate-700 dark:text-slate-300 py-3 rounded-xl text-sm">← Back</button>
          <button onClick={proceed} className="flex-1 bg-orange-500 text-white py-3 rounded-xl text-sm font-semibold">Continue →</button>
        </div>
      </div>
    )
  }

  // ---- Main result ----
  return (
    <div className="space-y-4">

      {/* Image with bounding boxes */}
      <div className="relative rounded-xl overflow-hidden bg-black">
        {result?.predictions?.length ? (
          <canvas ref={canvasRef} className="w-full h-auto" />
        ) : (
          <img src={result?.imageUrl || previewUrl} alt="Damage" className="w-full object-cover aspect-video" />
        )}
      </div>

      {/* Detection result card */}
      <div className="bg-slate-50 border border-slate-200 dark:bg-slate-800/50 dark:border-slate-700 rounded-xl p-4 space-y-3 transition-colors">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-0.5">AI Detection</div>
            <div className="font-semibold text-slate-900 dark:text-white">{formatDamageType(selectedDamage)}</div>
          </div>
          <div className="text-right">
            <div className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-0.5">Confidence</div>
            <div className="font-semibold text-orange-500 dark:text-orange-400">{formatConfidence(result?.confidence)}</div>
          </div>
        </div>

        {result?.address && (
          <div className="border-t border-slate-200 dark:border-slate-700 pt-3">
            <div className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-0.5">📍 Location</div>
            <div className="text-sm text-slate-700 dark:text-slate-300">{result.address}</div>
          </div>
        )}
      </div>

      {/* Override section */}
      <div>
        <div className="text-xs text-slate-500 dark:text-slate-400 mb-2">Not right? Correct the damage type:</div>
        <div className="flex flex-wrap gap-2">
          {DAMAGE_TYPES.map((type) => (
            <button
              key={type}
              onClick={() => handleOverride(type)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                selectedDamage === type
                  ? 'bg-orange-500 border-orange-500 text-white'
                  : 'bg-white border-slate-300 text-slate-600 hover:border-slate-400 hover:text-slate-900 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400 dark:hover:border-slate-500 dark:hover:text-slate-200'
              }`}
            >
              {formatDamageType(type)}
            </button>
          ))}
        </div>
        {userOverrode && (
          <p className="text-xs text-orange-500/80 dark:text-orange-400/70 mt-1.5">✓ You've overridden the AI classification</p>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button onClick={onBack} className="flex-1 border border-slate-300 hover:border-slate-400 text-slate-700 dark:border-slate-700 dark:hover:border-slate-500 dark:text-slate-300 py-3 rounded-xl text-sm transition-colors">
          ← Back
        </button>
        <button onClick={proceed} className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-xl text-sm font-semibold transition-colors">
          Continue →
        </button>
      </div>
    </div>
  )
}
