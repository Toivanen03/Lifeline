import { createContext, useState, useEffect, useContext } from "react"
import { AuthContext } from "./AuthContext"

const ClockContext = createContext()

export const ClockSettingsProvider = ({ children }) => {
  const { currentUser } = useContext(AuthContext)
  const [clockSettings, setSettings] = useState({
    show: true,
    digital: true
  })

  useEffect(() => {
    if (!currentUser) return
    const saved = localStorage.getItem(`${currentUser.username}.clockSettings`)
    if (saved) {
      setSettings(JSON.parse(saved))
    }
  }, [currentUser])

  const updateClockSettings = (newSettings) => {
    if (!currentUser) return
    setSettings(newSettings)
    localStorage.setItem(`${currentUser.username}.clockSettings`, JSON.stringify(newSettings))
  }

  return (
    <ClockContext.Provider value={{ clockSettings, updateClockSettings }}>
      {children}
    </ClockContext.Provider>
  )
}

export const useClockSettings = () => useContext(ClockContext)