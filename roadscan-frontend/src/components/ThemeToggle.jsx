import { useTheme } from '../context/ThemeContext'

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <button
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className="relative w-10 h-10 overflow-hidden shrink-0 transition-transform duration-300 hover:scale-110 active:scale-95"
    >
      {/* Black cat — visible on the LIGHT theme */}
      <img
        src="/assest/cat-dark-cut.png"
        alt=""
        draggable="false"
        className={`absolute inset-0 w-full h-full object-cover object-[45%_40%] transition-transform duration-500 ease-in-out ${
          isDark ? 'translate-x-full' : 'translate-x-0'
        }`}
      />
      {/* White cat — visible on the DARK theme */}
      <img
        src="/assest/cat-light-cut.png"
        alt=""
        draggable="false"
        className={`absolute inset-0 w-full h-full object-cover object-[45%_40%] transition-transform duration-500 ease-in-out ${
          isDark ? 'translate-x-0' : 'translate-x-full'
        }`}
      />
    </button>
  )
}
