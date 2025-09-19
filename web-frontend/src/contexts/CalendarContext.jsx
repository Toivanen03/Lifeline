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

  const [calendarSettings, setCalendarSettings] = useState(() => {
    if (!currentUser) return defaultSettings
    const saved = localStorage.getItem(`${currentUser.username}.calendarSettings`)
    return saved ? JSON.parse(saved) : defaultSettings
  })

  const updateCalendarSettings = (newSettings) => {
    setCalendarSettings(newSettings)
    if (currentUser) {
      localStorage.setItem(`${currentUser.username}.calendarSettings`, JSON.stringify(newSettings))
    }
  }

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(
        `${currentUser.username}.calendarSettings`,
        JSON.stringify(calendarSettings)
      )
    }
  }, [calendarSettings, currentUser])

  return (
    <CalendarContext.Provider value={{
      calendarSettings,
      updateCalendarSettings
    }}>
      {children}
    </CalendarContext.Provider>
  )
}

export const useCalendarSettings = () => useContext(CalendarContext)