import { createContext, useContext, useState } from "react"

const CalendarDayContext = createContext()

export const CalendarDayProvider = ({ children }) => {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(null)
  const [highlightedDate, setHighlightedDate] = useState(new Date())

  return (
    <CalendarDayContext.Provider value={{
      currentDate, setCurrentDate,
      selectedDate, setSelectedDate,
      highlightedDate, setHighlightedDate
    }}>
      {children}
    </CalendarDayContext.Provider>
  )
}

export const useCalendarDay = () => useContext(CalendarDayContext)