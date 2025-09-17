import { useCalendarSettings } from "../../contexts/CalendarContext"
import { useNavigate } from "react-router-dom"
import FullCalendar from "@fullcalendar/react"
import dayGridPlugin from "@fullcalendar/daygrid"
import interactionPlugin from "@fullcalendar/interaction"
import fiLocale from "@fullcalendar/core/locales/fi"

export const CalendarWidget = () => {
  const { calendarSettings } = useCalendarSettings()

  const navigate = useNavigate()

  const handleDateClick = (info) => {
    const selectedDate = info.dateStr
    navigate("/calendar", { state: { date: selectedDate, initialView: "timeGridDay" } })
  }

  return (
    <>
      {calendarSettings.show && (
        <>
        <h5>Kalenteri</h5>
          <div className="mb-2">
          <FullCalendar
              plugins={[dayGridPlugin, interactionPlugin]}
              initialView="dayGridMonth"
              locale={fiLocale}
              dateClick={handleDateClick}
              height="240px"
          />
          </div>
          <button 
              className="btn btn-primary mb-3" 
              style={{ padding: 3 }}
              onClick={() => navigate('/calendar')}
            >
              Avaa kalenteri
          </button>
        </>
      )}
    </>
  )
}