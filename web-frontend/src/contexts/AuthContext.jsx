import { createContext, useState, useEffect } from 'react'
import { jwtDecode } from 'jwt-decode'
import { useNavigate } from 'react-router-dom'

export const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null)
  const [isParent, setIsParent] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  const navigate = useNavigate()

  useEffect(() => {
    const savedToken = localStorage.getItem('parent-token')
    const expiry = localStorage.getItem('parent-token-expiry')

    if (savedToken && expiry && Date.now() < Number(expiry)) {
      const decoded = jwtDecode(savedToken)
      setToken(savedToken)
      setCurrentUser(decoded)
      setIsParent(decoded.parent === true)
    } else {
      localStorage.removeItem('parent-token')
      localStorage.removeItem('parent-token-expiry')
    }

    setIsLoading(false)
  }, [])

  const login = (newToken, stayLoggedIn = false) => {
    const expiryTime = Date.now() + (stayLoggedIn ? 7 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000)

    localStorage.setItem('parent-token', newToken)
    localStorage.setItem('parent-token-expiry', expiryTime)

    const decoded = jwtDecode(newToken)
    setToken(newToken)
    setCurrentUser(decoded)
    setIsParent(decoded.parent === true)

    navigate('/')
  }

  const logout = () => {
    localStorage.removeItem('parent-token')
    localStorage.removeItem('parent-token-expiry')
    setToken(null)
    setIsParent(false)
    setCurrentUser(null)
    navigate('/')
  }

  const isLoggedIn = !!token

  return (
    <AuthContext.Provider value={{ token, isLoggedIn, isParent, isLoading, login, logout, currentUser }}>
      {children}
    </AuthContext.Provider>
  )
}