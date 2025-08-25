import React, { createContext, useState, useEffect } from 'react'
import { getUser, saveUser, logoutUser } from '../secureStorage'

export const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkUser = async () => {
      const u = await getUser()
      if (u) setUser(u)
      setLoading(false)
    }
    checkUser()
  }, [])

  const login = async (userData) => {
    await saveUser(userData)
    setUser(userData)
  }

  const logout = async () => {
    await logoutUser()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}