import { createContext, useState, useEffect, useContext } from "react"
import { AuthContext } from "./AuthContext"

const CalendarContext = createContext()

const defaultSettings = {
  show: true,
  flagDays: true,
  nameDays: false,
  animation: false
}

export const CalendarSettingsProvider = ({ children }) => {
  const { currentUser } = useContext(AuthContext)
  const [calendarSettings, setCalendarSettings] = useState(defaultSettings)
  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    if (!currentUser) {
      setCalendarSettings(defaultSettings)
      setInitialized(true)
      return
    }

    const saved = localStorage.getItem(`${currentUser.username}.calendarSettings`)
    if (saved) {
      setCalendarSettings(JSON.parse(saved))
    } else {
      setCalendarSettings(defaultSettings)
    }
    setInitialized(true)
  }, [currentUser])

  const updateCalendarSettings = (newSettings) => {
    setCalendarSettings(newSettings)
    if (currentUser) {
      localStorage.setItem(`${currentUser.username}.calendarSettings`, JSON.stringify(newSettings))
    }
  }

  if (!initialized) return null

  return (
    <CalendarContext.Provider value={{ calendarSettings, updateCalendarSettings }}>
      {children}
    </CalendarContext.Provider>
  )
}

export const useCalendarSettings = () => useContext(CalendarContext)