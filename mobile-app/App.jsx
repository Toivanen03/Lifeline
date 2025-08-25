import React, { useContext } from 'react'
import { AuthProvider, AuthContext } from './Contexts/AuthContext'
import WelcomeScreen from './screens/WelcomeScreen'
import HomeScreen from './screens/HomeScreen'
import LoadingScreen from './screens/LoadingScreen'

const RootScreen = () => {
  const { user, loading } = useContext(AuthContext)

  if (loading) return <LoadingScreen />

  return user ? <HomeScreen /> : <WelcomeScreen />
}

export default function App() {
  return (
    <AuthProvider>
      <RootScreen />
    </AuthProvider>
  )
}