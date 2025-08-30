import { createContext, useState, useEffect, useContext } from "react"
import { AuthContext } from "./AuthContext"

const WeatherContext = createContext()

export const WeatherSettingsProvider = ({ children }) => {
  const { currentUser } = useContext(AuthContext)
  const [settings, setSettings] = useState({
    show: true,
    feels_like: true,
    description: true,
    wind: true,
    highest: true,
    lowest: true,
    visibility: true,
    clouds: true,
  })

  useEffect(() => {
    if (!currentUser) return
    const saved = localStorage.getItem(`${currentUser.username}.weatherSettings`)
    if (saved) {
      setSettings(JSON.parse(saved))
    }
  }, [currentUser])

  const updateSettings = (newSettings) => {
    if (!currentUser) return
    setSettings(newSettings)
    localStorage.setItem(`${currentUser.username}.weatherSettings`, JSON.stringify(newSettings))
  }

  return (
    <WeatherContext.Provider value={{ settings, updateSettings }}>
      {children}
    </WeatherContext.Provider>
  )
}

export const useWeatherSettings = () => useContext(WeatherContext)
