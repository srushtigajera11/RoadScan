import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(() => localStorage.getItem('rs_token'))
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (token) {
      try {
        // Decode JWT payload (no verification — backend handles that)
        const payload = JSON.parse(atob(token.split('.')[1]))
        // Check expiry
        if (payload.exp * 1000 < Date.now()) {
          logout()
        } else {
          setUser(payload)
        }
      } catch {
        logout()
      }
    }
    setLoading(false)
  }, [token])

  function login(newToken, userData) {
    localStorage.setItem('rs_token', newToken)
    setToken(newToken)
    setUser(userData)
  }

  function logout() {
    localStorage.removeItem('rs_token')
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
