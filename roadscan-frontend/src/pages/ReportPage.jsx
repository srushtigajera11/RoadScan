import { useState } from 'react'
import { Link } from 'react-router-dom'
import StepCapture from './report/StepCapture'
import StepDetect from './report/StepDetect'
import StepConfirm from './report/StepConfirm'

const STEPS = [
  { id: 1, label: 'Capture' },
  { id: 2, label: 'Detect' },
  { id: 3, label: 'Confirm' },
]

export default function ReportPage() {
  const [step, setStep] = useState(1)
  const [capture, setCapture] = useState(null)   // { imageFile, previewUrl, coords }
  const [detection, setDetection] = useState(null) // { tempId, damageType, imageUrl, address, confidence, ... }
  const [submitted, setSubmitted] = useState(null) // { trackingId, pdfUrl }

  function handleCaptureComplete(data) {
    setCapture(data)
    setStep(2)
  }

  function handleDetectComplete(data) {
    setDetection(data)
    setStep(3)
  }

  function handleSubmitComplete(data) {
    setSubmitted(data)
    setStep(4)
  }

  // ---- Success screen ----
  if (step === 4 && submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="w-20 h-20 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center text-4xl mx-auto">
            ✅
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Report Submitted!</h2>
            <p className="text-slate-600 dark:text-slate-400 text-sm">
              Your complaint has been logged and forwarded to Surat Municipal Corporation.
            </p>
          </div>

          {/* Tracking ID */}
          <div className="bg-white border border-slate-200 shadow-sm dark:shadow-none dark:bg-slate-800/50 dark:border-slate-700 rounded-xl p-4 transition-colors">
            <div className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">Tracking ID</div>
            <div className="font-mono text-xl font-bold text-orange-500 dark:text-orange-400">{submitted.trackingId}</div>
            <p className="text-xs text-slate-500 mt-1">Save this to track your report status</p>
          </div>

          <div className="flex flex-col gap-3">
            {submitted.pdfUrl && (
              <a
                href={submitted.pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-white hover:bg-slate-100 border border-slate-300 text-slate-900 dark:bg-slate-800 dark:hover:bg-slate-700 dark:border-slate-700 dark:text-white py-3 rounded-xl text-sm font-medium transition-colors"
              >
                📄 Download PDF Complaint
              </a>
            )}
            <Link
              to={`/track?id=${submitted.trackingId}`}
              className="w-full bg-white hover:bg-slate-100 border border-slate-300 text-slate-900 dark:bg-slate-800 dark:hover:bg-slate-700 dark:border-slate-700 dark:text-white py-3 rounded-xl text-sm font-medium transition-colors block"
            >
              🔍 Track This Report
            </Link>
            <Link
              to="/"
              className="w-full border border-slate-300 hover:border-slate-400 text-slate-600 hover:text-slate-900 dark:border-slate-700 dark:hover:border-slate-500 dark:text-slate-400 dark:hover:text-slate-200 py-3 rounded-xl text-sm transition-colors"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-lg mx-auto px-4 py-8">

        {/* Page heading */}
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Report Road Damage</h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">Complete in under 3 minutes</p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center mb-8">
          {STEPS.map((s, idx) => (
            <div key={s.id} className="flex items-center flex-1">
              <div className="flex flex-col items-center gap-1 flex-1">
                <div
                  className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-all ${
                    step > s.id
                      ? 'bg-green-500 border-green-500 text-white'
                      : step === s.id
                      ? 'bg-orange-500 border-orange-500 text-white'
                      : 'bg-transparent border-slate-300 text-slate-400 dark:border-slate-700 dark:text-slate-500'
                  }`}
                >
                  {step > s.id ? '✓' : s.id}
                </div>
                <span className={`text-xs ${step >= s.id ? 'text-slate-700 dark:text-slate-300' : 'text-slate-400 dark:text-slate-600'}`}>
                  {s.label}
                </span>
              </div>
              {idx < STEPS.length - 1 && (
                <div className={`h-px flex-1 mx-2 mb-5 transition-colors ${step > s.id ? 'bg-green-500' : 'bg-slate-300 dark:bg-slate-700'}`} />
              )}
            </div>
          ))}
        </div>

        {/* Step content */}
        <div className="bg-white border border-slate-200 shadow-sm dark:shadow-none dark:bg-slate-900/50 dark:border-slate-800 rounded-2xl p-5 transition-colors">
          {step === 1 && (
            <StepCapture onComplete={handleCaptureComplete} />
          )}
          {step === 2 && capture && (
            <StepDetect
              capture={capture}
              onComplete={handleDetectComplete}
              onBack={() => setStep(1)}
            />
          )}
          {step === 3 && capture && detection && (
            <StepConfirm
              capture={capture}
              detection={detection}
              onComplete={handleSubmitComplete}
              onBack={() => setStep(2)}
            />
          )}
        </div>

      </div>
    </div>
  )
}
