import { createContext, useState, useEffect, useContext } from "react"
import { AuthContext } from "./AuthContext"

const SettingsContext = createContext()

const defaultSettings = {
  showRightPanel: true,
  showWeather: false,
  weatherIcon: false
}

export const SettingsProvider = ({ children }) => {
  const { currentUser } = useContext(AuthContext)
  const [mainSettings, setMainSettings] = useState(defaultSettings)
  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    if (!currentUser) {
      setMainSettings(defaultSettings)
      setInitialized(true)
      return
    }

    const saved = localStorage.getItem(`${currentUser.username}.mainSettings`)
    if (saved) {
      setMainSettings(JSON.parse(saved))
    } else {
      setMainSettings(defaultSettings)
    }
    setInitialized(true)
  }, [currentUser])

  const updateMainSettings = (newSettings) => {
    setMainSettings(newSettings)
    if (currentUser) {
      localStorage.setItem(`${currentUser.username}.mainSettings`, JSON.stringify(newSettings))
    }
  }

  if (!initialized) return null

  return (
    <SettingsContext.Provider value={{ mainSettings, updateMainSettings }}>
      {children}
    </SettingsContext.Provider>
  )
}

export const useSettings = () => useContext(SettingsContext)