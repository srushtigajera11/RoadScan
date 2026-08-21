import { Link } from 'react-router-dom'

const STATS = [
  { value: '2.3M+', label: 'km of roads in India' },
  { value: '60%', label: 'need urgent repair' },
  { value: '~3 min', label: 'to file a report' },
]

const HOW_IT_WORKS = [
  {
    step: '01',
    icon: '📸',
    title: 'Photograph the damage',
    desc: 'Take a photo or upload one from your gallery. Works on any mobile browser — no app needed.',
  },
  {
    step: '02',
    icon: '🤖',
    title: 'AI detects and classifies',
    desc: 'Our computer vision model identifies potholes, cracks, waterlogging, and more in seconds.',
  },
  {
    step: '03',
    icon: '📍',
    title: 'GPS auto-tags the location',
    desc: 'Location is pulled from the photo\'s EXIF data or your device GPS — no manual typing.',
  },
  {
    step: '04',
    icon: '📄',
    title: 'Report sent to municipality',
    desc: 'A formatted PDF complaint is generated. You get a tracking ID to follow progress.',
  },
]

export default function HomePage() {
  return (
    <div className="min-h-screen">

      {/* Hero */}
      <section className="relative max-w-6xl mx-auto px-4 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/20 text-orange-600 dark:text-orange-400 text-xs font-medium px-3 py-1 rounded-full mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-orange-500 dark:bg-orange-400 animate-pulse" />
          Live in Surat, Gujarat
        </div>

        <h1 className="text-5xl md:text-6xl font-bold text-slate-900 dark:text-white leading-tight mb-4">
          Report Road Damage.
          <br />
          <span className="text-orange-500 dark:text-orange-400">Get It Fixed.</span>
        </h1>

        <p className="text-lg text-slate-600 dark:text-slate-400 max-w-xl mx-auto mb-10">
          RoadScan uses AI to detect and classify road damage from a photo.
          One tap generates a formal complaint for Surat Municipal Corporation.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/report"
            className="w-full sm:w-auto bg-orange-500 hover:bg-orange-600 text-white font-semibold px-8 py-3.5 rounded-xl text-base transition-all hover:scale-105 active:scale-95 shadow-lg shadow-orange-500/20"
          >
            📸 Report Damage Now
          </Link>
          <Link
            to="/track"
            className="w-full sm:w-auto border border-slate-300 hover:border-slate-400 text-slate-700 hover:text-slate-900 dark:border-slate-700 dark:hover:border-slate-500 dark:text-slate-300 dark:hover:text-white font-medium px-8 py-3.5 rounded-xl text-base transition-colors"
          >
            Track Existing Report
          </Link>
        </div>
      </section>

      {/* Stats */}
      <section className="max-w-6xl mx-auto px-4 pb-16">
        <div className="grid grid-cols-3 gap-4">
          {STATS.map((s) => (
            <div key={s.label} className="bg-white border border-slate-200 shadow-sm dark:shadow-none dark:bg-slate-800/50 dark:border-slate-700/50 rounded-xl p-6 text-center transition-colors">
              <div className="text-3xl font-bold text-orange-500 dark:text-orange-400 mb-1">{s.value}</div>
              <div className="text-sm text-slate-600 dark:text-slate-400">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-6xl mx-auto px-4 pb-24">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-8 text-center">How it works</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {HOW_IT_WORKS.map((item) => (
            <div
              key={item.step}
              className="bg-white border border-slate-200 shadow-sm hover:border-slate-300 dark:shadow-none dark:bg-slate-800/30 dark:border-slate-700/50 dark:hover:border-slate-600 rounded-xl p-6 flex gap-4 transition-colors"
            >
              <div className="shrink-0">
                <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-xl">
                  {item.icon}
                </div>
              </div>
              <div>
                <div className="text-xs font-mono text-slate-400 dark:text-slate-500 mb-0.5">{item.step}</div>
                <div className="font-semibold text-slate-900 dark:text-white mb-1">{item.title}</div>
                <div className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{item.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  )
}
