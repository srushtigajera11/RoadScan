import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'

import HomePage from './pages/HomePage'
import ReportPage from './pages/ReportPage'
import TrackPage from './pages/TrackPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import MyReportsPage from './pages/MyReportsPage'
import DashboardPage from './pages/DashboardPage'

export default function App() {
  return (
    <ThemeProvider>
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
          <Navbar />
          <main>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/report" element={<ReportPage />} />
              <Route path="/track" element={<TrackPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              {/* Citizen protected */}
              <Route
                path="/my-reports"
                element={
                  <ProtectedRoute requiredRole="citizen">
                    <MyReportsPage />
                  </ProtectedRoute>
                }
              />

              {/* Municipal protected */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute requiredRole="municipal">
                    <DashboardPage />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </AuthProvider>
    </ThemeProvider>
  )
}
