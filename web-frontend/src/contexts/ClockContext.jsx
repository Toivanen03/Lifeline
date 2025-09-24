import { createContext, useState, useEffect, useContext } from "react"
import { AuthContext } from "./AuthContext"

const ClockContext = createContext()

const defaultSettings = {
  show: true,
  digital: true,
}

export const ClockSettingsProvider = ({ children }) => {
  const { currentUser } = useContext(AuthContext)
  const [clockSettings, setClockSettings] = useState(defaultSettings)
  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    if (!currentUser) {
      setClockSettings(defaultSettings)
      setInitialized(true)
      return
    }

    const saved = localStorage.getItem(`${currentUser.username}.clockSettings`)
    if (saved) {
      setClockSettings(JSON.parse(saved))
    } else {
      setClockSettings(defaultSettings)
    }
    setInitialized(true)
  }, [currentUser])

  const updateClockSettings = (newSettings) => {
    setClockSettings(newSettings)
    if (currentUser) {
      localStorage.setItem(`${currentUser.username}.clockSettings`, JSON.stringify(newSettings))
    }
  }

  if (!initialized) return null

  return (
    <ClockContext.Provider value={{ clockSettings, updateClockSettings }}>
      {children}
    </ClockContext.Provider>
  )
}

export const useClockSettings = () => useContext(ClockContext)