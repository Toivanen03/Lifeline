import { motion } from "framer-motion"
import { useLocation } from "react-router-dom"
import FullCalendar from "@fullcalendar/react"
import dayGridPlugin from "@fullcalendar/daygrid"
import timeGridPlugin from "@fullcalendar/timegrid"
import interactionPlugin from "@fullcalendar/interaction"
import multiMonthPlugin from "@fullcalendar/multimonth"
import fiLocale from "@fullcalendar/core/locales/fi"
import { useRef, useState } from "react"
import { Button } from "react-bootstrap"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faArrowRight, faArrowLeft } from "@fortawesome/free-solid-svg-icons"
import CalendarEventModal from "../calendar/calendarEventModal"

const CalendarFull = () => {
    const { state } = useLocation()
    const [events, setEvents] = useState([])
    const [showModal, setShowModal] = useState(false)
    const [selectedDate, setSelectedDate] = useState(state?.date || null)
    const [view, setView] = useState(state?.initialView || "dayGridMonth")
    const [currentDate, setCurrentDate] = useState(new Date(selectedDate || Date.now()))

    const calendarRef = useRef(null)

    const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1)

    const getTitle = () => {
        if (view === "dayGridMonth") {
            return `${capitalize(currentDate.toLocaleString("fi-FI", { month: "long" }))} ${currentDate.getFullYear()}`
        }
        if (view === "multiMonthYear") {
            return currentDate.getFullYear()
        }
        return capitalize(currentDate.toLocaleDateString("fi-FI", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
        }))
    }

    const handlePeriodChange = (delta) => {
        const newDate = new Date(currentDate)
        if (view === "dayGridMonth") {
            newDate.setMonth(newDate.getMonth() + delta)
        } else if (view === "multiMonthYear") {
            newDate.setFullYear(newDate.getFullYear() + delta)
        }
        setCurrentDate(newDate)
        calendarRef.current.getApi().gotoDate(newDate)
    }

    const handleToday = () => {
        const now = new Date()
        setCurrentDate(now)
        calendarRef.current.getApi().today()
    }

    const handleView = (period) => {
        setView(period)
        calendarRef.current?.getApi().changeView(period)
    }

    const handleDateClick = (info) => {
        setSelectedDate(info.dateStr)
        setShowModal(true)
    }

    const handleSaveEvent = (event) => {
        setEvents((prev) => [...prev, event])
    }

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
                <div className="col-6 d-flex justify-content-center align-items-center">
                    <h4 className="mb-4">Perheen kalenteri</h4>
                </div>
                <div className="col-6 d-flex justify-content-center align-items-center">
                    <Button className="mb-4 ms-2 me-2" onClick={handleToday}>
                        Tänään
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
                    />

                    <CalendarEventModal
                        show={showModal}
                        handleClose={() => setShowModal(false)}
                        date={selectedDate}
                        onSave={handleSaveEvent}
                    />
                </div>
            </div>
        </div>
    </motion.div>
  )
}

export default CalendarFull