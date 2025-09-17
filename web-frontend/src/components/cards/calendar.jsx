import { motion } from "framer-motion"
import { useLocation } from "react-router-dom"
import FullCalendar from "@fullcalendar/react"
import dayGridPlugin from "@fullcalendar/daygrid"
import timeGridPlugin from "@fullcalendar/timegrid"
import interactionPlugin from "@fullcalendar/interaction"
import multiMonthPlugin from "@fullcalendar/multimonth"
import fiLocale from "@fullcalendar/core/locales/fi"
import { useRef, useState, useEffect } from "react"
import { Button } from "react-bootstrap"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faArrowRight, faArrowLeft, faArrowUp, faArrowDown } from "@fortawesome/free-solid-svg-icons"
import CalendarEventModal from "../calendar/calendarEventModal"
import { holidays } from "../calendar/calendarEventEngine"

const CalendarFull = ({ notify }) => {
  const { state } = useLocation()
  const [events, setEvents] = useState([...holidays])
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [selectedDate, setSelectedDate] = useState(state?.date || null)
  const [view, setView] = useState(state?.initialView || "dayGridMonth")
  const [currentDate, setCurrentDate] = useState(new Date(selectedDate || Date.now()))

  const calendarRef = useRef(null)

  console.log(holidays)

  useEffect(() => {
    if (state?.date) {
      const newDate = new Date(state.date)
      setCurrentDate(newDate)
      setView(state.initialView || "timeGridDay")
      calendarRef.current?.getApi().changeView(state.initialView || "timeGridDay", newDate)
    }
  }, [state])

  const weekdays = [
    "sunnuntai",
    "maanantai",
    "tiistai",
    "keskiviikko",
    "torstai",
    "perjantai",
    "lauantai",
  ]

  const formatDayTitle = (date) => {
    const weekday = weekdays[date.getDay()]
    const day = date.toLocaleDateString("fi-FI", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })
    return `${capitalize(weekday)}, ${day}`
  }

  const scrollEarly = () => {
    const view = calendarRef.current.getApi()
    view.scrollToTime("00:00:00")
  }

  const scrollLate = () => {
    const view = calendarRef.current.getApi()
    view.scrollToTime("16:00:00")
  }

  const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1)

  const formatWeekTitle = (date) => {
    const start = new Date(date)
    start.setDate(date.getDate() - date.getDay() + 1)
    const end = new Date(start)
    end.setDate(start.getDate() + 6)
    return `${start.toLocaleDateString("fi-FI", { day: "numeric", month: "long" })} – ${end.toLocaleDateString("fi-FI", { day: "numeric", month: "long", year: "numeric" })}`
  }

  const getTitle = () => {
    switch (view) {
      case "dayGridMonth":
        return `${capitalize(currentDate.toLocaleString("fi-FI", { month: "long" }))} ${currentDate.getFullYear()}`
      case "multiMonthYear":
        return currentDate.getFullYear()
      case "timeGridDay":
        return formatDayTitle(currentDate)
      case "timeGridWeek":
        return formatWeekTitle(currentDate)
      default:
        return ""
    }
  }

  const handlePeriodChange = (delta) => {
    const newDate = new Date(currentDate)
    switch (view) {
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
        newDate.setDate(newDate.getDate() + delta * 7)
        break
      default:
        break
    }
    setCurrentDate(newDate)
    calendarRef.current.getApi().gotoDate(newDate)
  }

  const handleToday = () => {
    const now = new Date()
    if (view === 'multiMonthYear') {
      setView('dayGridMonth')
      calendarRef.current?.getApi().changeView('dayGridMonth')
    } else if (view === 'dayGridMonth' || view === 'timeGridWeek') {
      setView('timeGridDay')
      calendarRef.current?.getApi().changeView('timeGridDay')
    }
    setCurrentDate(now)
    calendarRef.current.getApi().today()
  }

  const handleView = (period) => {
    setView(period)
    calendarRef.current?.getApi().changeView(period)
  }

  const handleDateClick = (info) => {
    const start = new Date(info.date)

    if (view === 'dayGridMonth') {
      setCurrentDate(start)
      setView('timeGridDay')
      calendarRef.current?.getApi().changeView('timeGridDay', start)
    } else {
      const end = new Date(start)
      end.setHours(start.getHours() + 1)
      setSelectedEvent(null)
      setSelectedDate({ start, end })
      setShowModal(true)
    }
  }

    const handleSaveEvent = (event) => {
        if (event.allDay) {
            const start = new Date(event.start)
            const end = new Date(event.end || event.start)

            end.setDate(end.getDate() + 1)
            end.setHours(0, 0, 0, 0)

            const newEvent = {
            ...event,
            allDay: false,
            start: start.setHours(0, 0, 0, 0),
            end: end,
            }

            setEvents((prev) => [...prev, { ...newEvent, id: String(Date.now()) }])
        } else {
            const newEvent = { ...event, id: String(Date.now()) }
            setEvents((prev) => [...prev, newEvent])
        }
    }

  const getVisibleEvents = () => {
    if (!events.length) return []

    if (view === "timeGridDay") {
      return events.filter(e => {
        const d = new Date(e.start)
        return (
          d.getFullYear() === currentDate.getFullYear() &&
          d.getMonth() === currentDate.getMonth() &&
          d.getDate() === currentDate.getDate()
        )
      })
    }

    if (view === "timeGridWeek") {
      const start = new Date(currentDate)
      start.setDate(start.getDate() - start.getDay() + 1)
      start.setHours(0, 0, 0, 0)

      const end = new Date(start)
      end.setDate(start.getDate() + 6)
      end.setHours(23, 59, 59, 999)

      return events.filter(e => {
        const evStart = new Date(e.start)
        const evEnd = new Date(e.end)
        return evStart <= end && evEnd >= start
      })
    }

    return []
  }

  const visibleEvents = getVisibleEvents()

  const isEarlyEvent = (event) => {
    const startHour = new Date(event.start).getHours()
    const endHour = new Date(event.end).getHours()
    return startHour < 6 || endHour < 6
    }

    const isLateEvent = (event) => {
    const startHour = new Date(event.start).getHours()
    return startHour >= 16
    }

    const hasEarlyEvents = visibleEvents.some(isEarlyEvent)
    const hasLateEvents = visibleEvents.some(isLateEvent)

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -30 }}
      transition={{ duration: 0.4 }}
      className="d-flex flex-column justify-content-center align-items-center"
      style={{ height: "100%" }}
    >
      <div
        className="card shadow-lg p-4"
        style={{
          border: "solid 1px black",
          borderRadius: 20,
          backgroundColor: "white",
          width: "100%",
        }}
      >
        <div className="row">
          <div className="col-12 d-flex justify-content-center align-items-center">
            <Button className="mb-4 ms-2 me-2" onClick={handleToday}>
              Tänään
            </Button>
            <Button className="mb-4 ms-2 me-2" onClick={() => handleView("timeGridWeek")}>
              Viikkonäkymä
            </Button>
            <Button className="mb-4 ms-2 me-2" onClick={() => handleView("dayGridMonth")}>
              Kuukausinäkymä
            </Button>
            <Button className="mb-4 ms-2 me-2" onClick={() => handleView("multiMonthYear")}>
              Vuosinäkymä
            </Button>
          </div>
        </div>

        <div className="d-flex justify-content-center align-items-center mb-3">
          <Button variant="light" onClick={() => handlePeriodChange(-1)}>
            <FontAwesomeIcon icon={faArrowLeft} fontSize={15} color="#1C1C1C" />
          </Button>
          <h5 className="mx-3 mb-0">{getTitle()}</h5>
          <Button variant="light" onClick={() => handlePeriodChange(1)}>
            <FontAwesomeIcon icon={faArrowRight} fontSize={15} color="#1C1C1C" />
          </Button>
        </div>

        {(view === "timeGridDay" || view === "timeGridWeek") && (
          <div className="d-flex justify-content-center align-items-center gap-2">
            {hasEarlyEvents && (
              <Button variant="light" onClick={scrollEarly}>
                <FontAwesomeIcon icon={faArrowUp} fontSize={15} color="#1C1C1C" />
              </Button>
            )}
            {(hasEarlyEvents || hasLateEvents) && (
              <span className="text-center">Tarkastele tapahtumia</span>
            )}
            {hasLateEvents && (
              <Button variant="light" onClick={scrollLate}>
                <FontAwesomeIcon icon={faArrowDown} fontSize={15} color="#1C1C1C" />
              </Button>
            )}
          </div>
        )}

        <div style={{ width: "100%", display: "flex", justifyContent: "center" }}>
          <div className="full-calendar-container" style={{ width: "100%" }}>
            <FullCalendar
                ref={calendarRef}
                plugins={[dayGridPlugin, multiMonthPlugin, interactionPlugin, timeGridPlugin]}
                initialView={view}
                initialDate={selectedDate}
                locale={fiLocale}
                height="60vh"
                headerToolbar={false}
                dateClick={handleDateClick}
                allDaySlot={false}
                slotDuration="00:30:00"
                slotLabelInterval="00:30:00"
                slotLabelFormat={{
                    hour: '2-digit',
                    minute: '2-digit',
                }}
                events={events}
                eventClick={(info) => {
                    info.jsEvent.preventDefault()
                    setSelectedEvent({
                        id: info.event.id,
                        title: info.event.title,
                        start: info.event.start,
                        end: info.event.end,
                        allDay: info.event.allDay,
                        details: info.event.extendedProps.details || ""
                    })
                    setShowModal(true)
                    setSelectedDate(null)
                }}
                eventTimeFormat={{
                    hour: '2-digit',
                    minute: '2-digit',
                }}
                editable={true}
                eventDrop={(info) => {
                    const { id, start, end } = info.event
                    setEvents((prev) =>
                        prev.map((e) =>
                            e.id === id ? { ...e, start, end } : e
                        )
                    )
                }}
                eventResize={(info) => {
                    const { id, start, end } = info.event
                    setEvents((prev) =>
                        prev.map((e) =>
                            e.id === id ? { ...e, start, end } : e
                        )
                    )
                }}
                dayHeaderDidMount={(info) => {
                    info.el.addEventListener("click", () => {
                        const date = info.date
                        setCurrentDate(date)
                        setView("timeGridDay")
                        calendarRef.current.getApi().changeView("timeGridDay", date)
                    })
                }}
            />

            <CalendarEventModal
                show={showModal}
                handleClose={() => setShowModal(false)}
                date={selectedDate}
                onSave={handleSaveEvent}
                onDelete={(id) => {
                    setEvents((prev) => prev.filter((e) => e.id !== id))
                    setShowModal(false)
                }}
                eventToEdit={selectedEvent}
                notify={notify}
            />
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default CalendarFull