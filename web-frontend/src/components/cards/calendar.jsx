import { motion } from "framer-motion"
import { useLocation } from "react-router-dom"
import FullCalendar from "@fullcalendar/react"
import dayGridPlugin from "@fullcalendar/daygrid"
import timeGridPlugin from "@fullcalendar/timegrid"
import interactionPlugin from "@fullcalendar/interaction"
import multiMonthPlugin from "@fullcalendar/multimonth"
import fiLocale from "@fullcalendar/core/locales/fi"
import { useRef, useState, useEffect, useContext } from "react"
import { Button } from "react-bootstrap"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faArrowRight, faArrowLeft, faArrowUp, faArrowDown } from "@fortawesome/free-solid-svg-icons"
import CalendarEventModal from "../calendar/calendarEventModal"
import { useSolidDayEntries } from "../calendar/calendarEventEngine"
import { useCalendarEvents } from "../calendar/useCalendarEvents"
import { useUserEvents } from "../calendar/useUserEvents"
import { useCalendarNavigation, getHeaderTitle } from '../calendar/useCalendarNavigation'
import NameDayDisplay from "../calendar/NameDayDisplay"
import SearchBar from "../calendar/searchBar"
import { useCalendarSettings } from "../../contexts/CalendarContext"

const CalendarFull = ({ notify, firstname }) => {
  const [selectedNameDayDate, setSelectedNameDayDate] = useState(new Date())
  const { entries: solidEntries } = useSolidDayEntries()
  const { state } = useLocation()
  const calendarRef = useRef(null)
  const { calendarSettings, updateCalendarSettings } = useCalendarSettings()
  const { userEvents, updateUserEvent, saveUserEvent, deleteUserEvent } = useUserEvents()
  const { view, setView, currentDate, setCurrentDate, handlePeriodChange, handleToday } =
    useCalendarNavigation(state?.initialView || "dayGridMonth", state?.date || Date.now(), setSelectedNameDayDate)
  const { visibleEvents, userVisibleEvents, findNameDay } = useCalendarEvents({
    solidEntries, userEvents, view, currentDate, firstname
  })
  const { combinedEvents } = useCalendarEvents({ solidEntries, userEvents, view, currentDate })
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [selectedDate, setSelectedDate] = useState(state?.date || null)
console.log(calendarSettings.animation) // YHDISTÄ ANIMAATIOON
  useEffect(() => {
    if (state?.date) {
      const newDate = new Date(state.date)
      setCurrentDate(newDate)
      setView(state.initialView || "timeGridDay")
      calendarRef.current?.getApi().changeView(state.initialView || "timeGridDay", newDate)
    }
  }, [state])

  const handleChangeView = (newView) => {
    setSelectedNameDayDate(new Date())
    setView(newView)
    if (calendarRef.current) {
      calendarRef.current.getApi().changeView(newView, currentDate)
    }
  }

  const isEarlyEvent = (event) => {
    const startHour = new Date(event.start).getHours()
    const endHour = event.end ? new Date(event.end).getHours() : startHour
    return startHour < 6 || endHour < 6
  }
  const isLateEvent = (event) => new Date(event.start).getHours() >= 16
  const hasEarlyEvents = userVisibleEvents.some(isEarlyEvent)
  const hasLateEvents = userVisibleEvents.some(isLateEvent)

  const handleDateClick = (info) => {
    const date = new Date(info.date)
    
    setSelectedNameDayDate(date)
    
    if(view === "multiMonthYear" || view === "dayGridMonth"){
      setCurrentDate(date)
      setView("timeGridDay")
      calendarRef.current?.getApi().changeView("timeGridDay", date)
    } else {
      const end = new Date(date)
      end.setHours(date.getHours() + 1)
      setSelectedEvent(null)
      setSelectedDate({ start: date, end })
      setShowModal(true)
    }
  }

  const scrollEarly = () => calendarRef.current?.getApi().scrollToTime("00:00:00")
  const scrollLate = () => calendarRef.current?.getApi().scrollToTime("16:00:00")

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -30 }}
      transition={{ duration: 0.4 }}
      className="d-flex flex-column justify-content-center align-items-center"
      style={{ height: "100%" }}
    >
      <div className="card shadow-lg p-4" style={{ border: "solid 1px black", borderRadius: 20, backgroundColor: "white", width: "100%" }}>
        <div className="row">
          <div className="col-2 d-flex justify-content-start align-items-start nameday-container">
            <NameDayDisplay data={findNameDay(selectedNameDayDate)} firstname={firstname} />
          </div>
          <div className="col-6 d-flex justify-content-center align-items-start">
            <Button className="mb-4 ms-2 me-2" onClick={() => handleToday(calendarRef, setSelectedNameDayDate)}>Tänään</Button>
            <Button className="mb-4 ms-2 me-2" onClick={() => handleChangeView("timeGridWeek")}>Viikkonäkymä</Button>
            <Button className="mb-4 ms-2 me-2" onClick={() => handleChangeView("dayGridMonth")}>Kuukausinäkymä</Button>
            <Button className="mb-4 ms-2 me-2" onClick={() => handleChangeView("multiMonthYear")}>Vuosinäkymä</Button>
          </div>
          <div className="col-4 d-flex justify-content-end align-items-start">
            <SearchBar events={combinedEvents} setShowModal={setShowModal} setSelectedEvent={setSelectedEvent} />
          </div>
        </div>

        <div className="d-flex justify-content-center align-items-center mb-3">
          <Button variant="light" onClick={() => handlePeriodChange(-1, calendarRef)}>
            <FontAwesomeIcon icon={faArrowLeft} fontSize={15} color="#1C1C1C" />
          </Button>
          <h5 className="mx-3 mb-0">{getHeaderTitle({ currentDate, view })}</h5>
          <Button variant="light" onClick={() => handlePeriodChange(1, calendarRef)}>
            <FontAwesomeIcon icon={faArrowRight} fontSize={15} color="#1C1C1C" />
          </Button>
        </div>

        {(view === "timeGridDay" || view === "timeGridWeek") && (
          <div className="d-flex justify-content-center align-items-center gap-2 mb-2">
            {hasEarlyEvents && <Button variant="light" onClick={scrollEarly}><FontAwesomeIcon icon={faArrowUp} fontSize={15} color="#1C1C1C" /></Button>}
            {(hasEarlyEvents || hasLateEvents) && <span className="text-center">Tarkastele tapahtumia</span>}
            {hasLateEvents && <Button variant="light" onClick={scrollLate}><FontAwesomeIcon icon={faArrowDown} fontSize={15} color="#1C1C1C" /></Button>}
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
              slotLabelFormat={{ hour: "2-digit", minute: "2-digit" }}
              events={visibleEvents}
              eventOrder="start,-duration,title"
              eventClick={(info) => {
                info.jsEvent.preventDefault()
                setSelectedEvent({
                  id: info.event.id,
                  title: info.event.title,
                  start: info.event.start,
                  end: info.event.end,
                  allDay: info.event.allDay,
                  details: info.event.extendedProps?.details || "",
                  links: info.event.extendedProps?.links || [],
                  classNames: info.event.classNames || []
                })
                setShowModal(true)
                setSelectedDate(null)
              }}
              eventTimeFormat={{ hour: "2-digit", minute: "2-digit" }}
              editable={true}
              eventDrop={(info) => {
                const id = info.event.id
                if(userEvents.some(e => e.id === id)) updateUserEvent(id, { start: info.event.start.toISOString(), end: info.event.end ? info.event.end.toISOString() : undefined })
                else info.revert()
              }}
              eventResize={(info) => {
                const id = info.event.id
                if(userEvents.some(e => e.id === id)) updateUserEvent(id, { start: info.event.start.toISOString(), end: info.event.end ? info.event.end.toISOString() : undefined })
                else info.revert()
              }}
              dayHeaderDidMount={(info) => {
                info.el.addEventListener("click", () => {
                  const date = info.date
                  setCurrentDate(date)
                  setView("timeGridDay")
                  calendarRef.current?.getApi().changeView("timeGridDay", date)
                  setSelectedNameDayDate(date)
                })
              }}
            />
            <CalendarEventModal
              show={showModal}
              handleClose={() => setShowModal(false)}
              date={selectedDate}
              onSave={(event) => {
                saveUserEvent(event)
                setShowModal(false) }}
              onDelete={(id) => {
                deleteUserEvent(id)
                setShowModal(false) }}
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