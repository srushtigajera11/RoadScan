import { useState, useRef, useCallback } from 'react'
import Webcam from 'react-webcam'
import { extractGpsFromExif, getBrowserLocation } from '../../utils/exifGps'

export default function StepCapture({ onComplete }) {
  const [mode, setMode] = useState('choose') // 'choose' | 'camera' | 'preview'
  const [imageFile, setImageFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [coords, setCoords] = useState(null)
  const [gpsSource, setGpsSource] = useState(null)
  const [gpsLoading, setGpsLoading] = useState(false)
  const [gpsError, setGpsError] = useState(null)
  const [cameraFacing, setCameraFacing] = useState('environment')

  const webcamRef = useRef(null)
  const fileInputRef = useRef(null)

  // --- Camera capture ---
  const capturePhoto = useCallback(async () => {
    const imageSrc = webcamRef.current.getScreenshot()
    if (!imageSrc) return

    // Convert base64 to File
    const res = await fetch(imageSrc)
    const blob = await res.blob()
    const file = new File([blob], `roadscan_${Date.now()}.jpg`, { type: 'image/jpeg' })

    setImageFile(file)
    setPreviewUrl(imageSrc)
    setMode('preview')
    await resolveGps(file)
  }, [webcamRef])

  // --- File upload ---
  async function handleFileChange(e) {
    const file = e.target.files[0]
    if (!file) return

    const url = URL.createObjectURL(file)
    setImageFile(file)
    setPreviewUrl(url)
    setMode('preview')
    await resolveGps(file)
  }

  // --- GPS resolution: EXIF → browser → manual ---
  async function resolveGps(file) {
    setGpsLoading(true)
    setGpsError(null)

    // 1. Try EXIF
    const exifCoords = await extractGpsFromExif(file)
    if (exifCoords) {
      setCoords(exifCoords)
      setGpsSource('exif')
      setGpsLoading(false)
      return
    }

    // 2. Try browser geolocation
    try {
      const browserCoords = await getBrowserLocation()
      setCoords(browserCoords)
      setGpsSource('browser')
    } catch (err) {
      setGpsError(err.message)
    } finally {
      setGpsLoading(false)
    }
  }

  async function retryBrowserGps() {
    setGpsLoading(true)
    setGpsError(null)
    try {
      const browserCoords = await getBrowserLocation()
      setCoords(browserCoords)
      setGpsSource('browser')
    } catch (err) {
      setGpsError(err.message)
    } finally {
      setGpsLoading(false)
    }
  }

  function reset() {
    setMode('choose')
    setImageFile(null)
    setPreviewUrl(null)
    setCoords(null)
    setGpsSource(null)
    setGpsError(null)
  }

  function proceedToDetect() {
    onComplete({ imageFile, previewUrl, coords })
  }

  // ---- Render ----

  if (mode === 'camera') {
    return (
      <div className="space-y-4">
        <div className="relative rounded-xl overflow-hidden bg-black aspect-[4/3]">
          <Webcam
            ref={webcamRef}
            audio={false}
            screenshotFormat="image/jpeg"
            videoConstraints={{ facingMode: cameraFacing }}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-x-0 bottom-0 p-4 flex items-center justify-between bg-gradient-to-t from-black/80 to-transparent">
            <button
              onClick={reset}
              className="text-white/70 hover:text-white text-sm px-3 py-2"
            >
              ✕ Cancel
            </button>
            <button
              onClick={capturePhoto}
              className="w-14 h-14 rounded-full bg-white border-4 border-orange-400 hover:bg-orange-50 transition-colors"
            />
            <button
              onClick={() => setCameraFacing(f => f === 'environment' ? 'user' : 'environment')}
              className="text-white/70 hover:text-white text-sm px-3 py-2"
            >
              🔄 Flip
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (mode === 'preview') {
    return (
      <div className="space-y-4">
        {/* Image preview */}
        <div className="relative rounded-xl overflow-hidden bg-slate-800 aspect-[4/3]">
          <img src={previewUrl} alt="Captured" className="w-full h-full object-cover" />
        </div>

        {/* GPS status */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
          <div className="text-xs text-slate-400 font-medium mb-2 uppercase tracking-wide">GPS Location</div>

          {gpsLoading && (
            <div className="flex items-center gap-2 text-slate-400 text-sm">
              <div className="w-4 h-4 border border-orange-400 border-t-transparent rounded-full animate-spin" />
              Detecting location...
            </div>
          )}

          {!gpsLoading && coords && (
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-green-400 text-sm font-medium">
                <span>✓</span>
                <span>
                  {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)}
                </span>
                <span className="text-xs text-slate-500 ml-auto">
                  via {gpsSource === 'exif' ? 'photo EXIF' : 'device GPS'}
                </span>
              </div>
            </div>
          )}

          {!gpsLoading && gpsError && (
            <div className="space-y-2">
              <p className="text-sm text-red-400">{gpsError}</p>
              <button
                onClick={retryBrowserGps}
                className="text-xs text-orange-400 hover:text-orange-300 underline"
              >
                Retry GPS
              </button>
              <p className="text-xs text-slate-500">
                You can also proceed without GPS and pin manually on the map.
              </p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={reset}
            className="flex-1 border border-slate-700 hover:border-slate-500 text-slate-300 py-3 rounded-xl text-sm font-medium transition-colors"
          >
            Retake
          </button>
          <button
            onClick={proceedToDetect}
            disabled={gpsLoading}
            className="flex-1 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 rounded-xl text-sm font-semibold transition-colors"
          >
            Analyse Damage →
          </button>
        </div>
      </div>
    )
  }

  // Default: choose mode
  return (
    <div className="space-y-4">
      <p className="text-slate-400 text-sm text-center">
        Take or upload a photo of the road damage.
      </p>

      <button
        onClick={() => setMode('camera')}
        className="w-full flex items-center gap-4 bg-slate-800/50 hover:bg-slate-800 border border-slate-700 hover:border-orange-500/50 text-left rounded-xl p-5 transition-all group"
      >
        <div className="w-12 h-12 rounded-lg bg-orange-500/10 text-orange-400 flex items-center justify-center text-2xl group-hover:bg-orange-500/20 transition-colors">
          📷
        </div>
        <div>
          <div className="font-semibold text-white">Take a Photo</div>
          <div className="text-sm text-slate-400">Use your device camera</div>
        </div>
        <div className="ml-auto text-slate-600">›</div>
      </button>

      <button
        onClick={() => fileInputRef.current.click()}
        className="w-full flex items-center gap-4 bg-slate-800/50 hover:bg-slate-800 border border-slate-700 hover:border-orange-500/50 text-left rounded-xl p-5 transition-all group"
      >
        <div className="w-12 h-12 rounded-lg bg-slate-700 flex items-center justify-center text-2xl group-hover:bg-slate-600 transition-colors">
          🖼️
        </div>
        <div>
          <div className="font-semibold text-white">Upload from Gallery</div>
          <div className="text-sm text-slate-400">JPEG, PNG or WEBP — max 10MB</div>
        </div>
        <div className="ml-auto text-slate-600">›</div>
      </button>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  )
}
