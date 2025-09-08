import { motion } from "framer-motion"
import { useLocation } from "react-router-dom"
import FullCalendar from "@fullcalendar/react"
import dayGridPlugin from "@fullcalendar/daygrid"
import timeGridPlugin from "@fullcalendar/timegrid"
import interactionPlugin from "@fullcalendar/interaction"
import multiMonthPlugin from "@fullcalendar/multimonth"
import fiLocale from "@fullcalendar/core/locales/fi"
import { useRef, useState, useEffect  } from "react"
import { Button } from "react-bootstrap"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faArrowRight, faArrowLeft, faArrowUp, faArrowDown } from "@fortawesome/free-solid-svg-icons"
import CalendarEventModal from "../calendar/calendarEventModal"

const updateScrollTime = (calendarRef, events, currentDate) => {
  if (!calendarRef.current) return

  const dayStart = new Date(currentDate)
  dayStart.setHours(0,0,0,0)
  const dayEnd = new Date(currentDate)
  dayEnd.setHours(23,59,59,999)

  const dayEvents = events.filter(
    (e) => e.start >= dayStart && e.start <= dayEnd
  )

  if (dayEvents.length === 0) {
    calendarRef.current.getApi().setOption("scrollTime", "06:00:00")
    return
  }

  let earliestHour = Math.min(...dayEvents.map(e => e.start.getHours()))
  let latestHour = Math.max(...dayEvents.map(e => e.end.getHours()))

  if (earliestHour < 0) earliestHour = 0
  if (earliestHour > 23) earliestHour = 23

  const scrollHour = earliestHour < 6 ? earliestHour : 6
  calendarRef.current.getApi().setOption(
    "scrollTime",
    `${scrollHour.toString().padStart(2, "0")}:00:00`
  )
}

const CalendarFull = () => {
    const { state } = useLocation()
    const [events, setEvents] = useState([])
    const [selectedEvent, setSelectedEvent] = useState(null)
    const [showModal, setShowModal] = useState(false)
    const [selectedDate, setSelectedDate] = useState(state?.date || null)
    const [view, setView] = useState(state?.initialView || "dayGridMonth")
    const [currentDate, setCurrentDate] = useState(new Date(selectedDate || Date.now()))

    const calendarRef = useRef(null)

    useEffect(() => {
        updateScrollTime(calendarRef, events, currentDate)
    }, [events, currentDate])

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
            return capitalize(currentDate.toLocaleDateString("fi-FI", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
            }))
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
            setSelectedDate({ start, end })
            setShowModal(true)
        }
    }

    const handleSaveEvent = (event) => {
        if (event.id) {
            setEvents((prev) =>
            prev.map((e) => (e.id === event.id ? { ...e, ...event } : e))
            )
        } else {
        const newEvent = { ...event, id: String(Date.now()) }
        setEvents((prev) => [...prev, newEvent])
        }
    }

    const hasEarlyEvents = events.some(e => e.start.getHours() < 6)
    const hasLateEvents = events.some(e => e.end.getHours() > 16)
console.log(hasLateEvents)
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

            <div>
                {hasEarlyEvents && <Button variant="light">
                    <FontAwesomeIcon icon={faArrowUp} fontSize={15} color="#1C1C1C" />
                </Button>}
                {hasLateEvents && <Button variant="light">
                    <FontAwesomeIcon icon={faArrowDown} fontSize={15} color="#1C1C1C" />
                </Button>}
            </div>

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
                        events={events}
                        eventClick={(info) => {
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
                        />

                    <CalendarEventModal
                        show={showModal}
                        handleClose={() => setShowModal(false)}
                        date={selectedDate}
                        onSave={handleSaveEvent}
                        eventToEdit={selectedEvent}
                    />
                </div>
            </div>
        </div>
    </motion.div>
  )
}

export default CalendarFull