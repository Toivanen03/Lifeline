import { createContext, useState, useEffect, useContext } from "react"
import { AuthContext } from "./AuthContext"

const SettingsContext = createContext()

export const SettingsProvider = ({ children }) => {
  const { currentUser } = useContext(AuthContext)
  const [mainSettings, setSettings] = useState({
    showRightPanel: true,
    showWeather: false,
    weatherIcon: false
  })

  useEffect(() => {
    if (!currentUser) return
    const saved = localStorage.getItem(`${currentUser.username}.settings`)
    if (saved) {
      setSettings(JSON.parse(saved))
    }
  }, [currentUser])

  const updateMainSettings = (newSettings) => {
    if (!currentUser) return
    setSettings(newSettings)
    localStorage.setItem(`${currentUser.username}.settings`, JSON.stringify(newSettings))
  }

  return (
    <SettingsContext.Provider value={{ mainSettings, updateMainSettings }}>
      {children}
    </SettingsContext.Provider>
  )
}

export const useSettings = () => useContext(SettingsContext)