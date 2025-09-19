import { useState } from "react"

export const getHeaderTitle = ({ currentDate, view }) => {
  if (!currentDate) return ""

  switch(view) {
    case "timeGridDay":
      return currentDate.toLocaleDateString("fi-FI", { day: "numeric", month: "long", year: "numeric" })
    case "timeGridWeek": {
      const start = new Date(currentDate)
      start.setDate(start.getDate() - start.getDay() + 1)
      const end = new Date(start)
      end.setDate(start.getDate() + 6)
      return `${start.toLocaleDateString("fi-FI", { day: "numeric", month: "long" })} – ${end.toLocaleDateString("fi-FI", { day: "numeric", month: "long", year: "numeric" })}`
    }
    case "dayGridMonth":
      return currentDate.toLocaleDateString("fi-FI", { month: "long", year: "numeric" })
    case "multiMonthYear":
      return currentDate.getFullYear()
    default:
      return currentDate.toLocaleDateString("fi-FI")
  }
}

export const useCalendarNavigation = (initialView = "dayGridMonth", initialDate = new Date(), setSelectedNameDayDate) => {
  const [view, setView] = useState(initialView)
  const [currentDate, setCurrentDate] = useState(new Date(initialDate))

  const handlePeriodChange = (delta, calendarRef) => {
    const newDate = new Date(currentDate)
    switch(view){
      case "dayGridMonth":
        newDate.setMonth(newDate.getMonth() + delta)
        break
      case "multiMonthYear":
        newDate.setFullYear(newDate.getFullYear() + delta)
        break
      case "timeGridDay":
        newDate.setDate(newDate.getDate() + delta)
        break
      case "timeGridWeek":
        newDate.setDate(newDate.getDate() + delta*7)
        break
    }
    setCurrentDate(newDate)
    calendarRef.current?.getApi().gotoDate(newDate)
    if(view === "timeGridDay") setSelectedNameDayDate(newDate)
  }

  const handleToday = (calendarRef) => {
    const now = new Date()
    setSelectedNameDayDate(now)
    if(view === "multiMonthYear"){
      setView("dayGridMonth")
      calendarRef.current?.getApi().changeView("dayGridMonth")
    } else if(view === "dayGridMonth" || view === "timeGridWeek"){
      setView("timeGridDay")
      calendarRef.current?.getApi().changeView("timeGridDay")
    }
    setCurrentDate(now)
    calendarRef.current?.getApi().today()
  }

  return { view, setView, currentDate, setCurrentDate, handlePeriodChange, handleToday }
}