import { createContext, useState, useEffect } from 'react'
import { jwtDecode } from 'jwt-decode'
import { useNavigate } from 'react-router-dom'
import { useFamilyOwner } from './GetFamilyOwner'

export const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null)
  const [isParent, setIsParent] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)
  const { owner, loading } = useFamilyOwner(currentUser?.familyId || undefined)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (currentUser && owner && !loading) {
      const newIsOwner = owner === currentUser.id
      if (currentUser.isOwner !== newIsOwner) {
        setCurrentUser(prev => ({ ...prev, isOwner: newIsOwner }))
      }
    }
  }, [owner, currentUser, loading])

  const navigate = useNavigate()

  useEffect(() => {
    const savedToken = localStorage.getItem('user-token')
    const expiry = localStorage.getItem('user-token-expiry')

    if (savedToken && expiry && Date.now() < Number(expiry)) {
      const decoded = jwtDecode(savedToken)
      setToken(savedToken)
      setCurrentUser(decoded)
      setIsParent(decoded.parent === true)
    } else {
      localStorage.removeItem('user-token')
      localStorage.removeItem('user-token-expiry')
    }

    setIsLoading(false)
  }, [])

  const login = (newToken, stayLoggedIn) => {
    const decoded = jwtDecode(newToken)
    const expiryTime = Date.now() + (stayLoggedIn ? 7 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000)

    localStorage.setItem('user-token', newToken)
    localStorage.setItem('user-token-expiry', expiryTime)

    setToken(newToken)
    setCurrentUser(decoded)
    setIsParent(decoded.parent === true)

    navigate('/')
  }

  const logout = () => {
    if (currentUser?.username) {
      localStorage.removeItem(`user-token`)
      localStorage.removeItem(`user-token-expiry`)
    } else {
      localStorage.removeItem('user-token')
      localStorage.removeItem('user-token-expiry')
    }
    setToken(null)
    setIsParent(false)
    setCurrentUser(null)
    navigate('/login')
  }

  const isLoggedIn = !!token

  return (
    <AuthContext.Provider value={{ token, isLoggedIn, isParent, isLoading, login, logout, currentUser }}>
      {children}
    </AuthContext.Provider>
  )
}