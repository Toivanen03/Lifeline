import { motion } from "framer-motion"
import { useLocation } from "react-router-dom"
import FullCalendar from "@fullcalendar/react"
import dayGridPlugin from "@fullcalendar/daygrid"
import timeGridPlugin from "@fullcalendar/timegrid"
import interactionPlugin from "@fullcalendar/interaction"
import multiMonthPlugin from "@fullcalendar/multimonth"
import fiLocale from "@fullcalendar/core/locales/fi"
import { useRef, useState, useEffect } from "react"
import { useQuery } from "@apollo/client/react"
import { Button } from "react-bootstrap"
import { FontAwesomeIcon  } from '@fortawesome/react-fontawesome'
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons'
import CalendarEventModal from "../calendar/calendarEventModal"
import SearchBar from "../calendar/searchBar"
import { useCalendarSettings } from "../../contexts/CalendarContext"
import { useEvents } from "../calendar/useEvents"
import { insertSolidCalendarEntries } from "../calendar/calendarEventEngine"
import { useCalendarDay } from "../../contexts/CalendarDayContext"
import { GET_FLAGDAYS, GET_NAMEDAYS } from "../../schema/queries"
import { InfoModal } from "../calendar/calendarEventEngine"

const CalendarFull = ({ notify }) => {
  const { currentDate, setCurrentDate, selectedDate, setSelectedDate, highlightedDate, setHighlightedDate } = useCalendarDay()
  const { events, addEvent, updateEvent, deleteEvent } = useEvents()
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [showInfoModal, setShowInfoModal] = useState(false)
  const [modalTitle, setModalTitle] = useState("")
  const [flagDayLinks, setFlagDayLinks] = useState([])
  const [namedayToday, setNamedayToday] = useState([])
  const [flagdayToday, setFlagDayToday] = useState('')
  const [modalInfo, setModalInfo] = useState("")
  const [view, setView] = useState("dayGridMonth")
  const { state } = useLocation()
  const { calendarSettings } = useCalendarSettings()
  const calendarRef = useRef(null)

  const { data: nameData, loading: nameLoading } = useQuery(GET_NAMEDAYS)
  const { data: flagData, loading: flagLoading } = useQuery(GET_FLAGDAYS)

  const openFlagDayModal = (title, info, links) => {
    setModalTitle(title)
    setModalInfo(info)
    setFlagDayLinks(links)
    setShowInfoModal(true)
  }

  useEffect(() => {
    if (state?.date) {
      const newDate = new Date(state.date)
      setCurrentDate(newDate)
      setView(state.initialView || "timeGridDay")
      calendarRef.current?.getApi().changeView(state.initialView || "timeGridDay", newDate)
    }
  }, [state])

  useEffect(() => {
    if (nameLoading || flagLoading) return
    insertSolidCalendarEntries(
      calendarRef,
      flagData,
      nameData,
      openFlagDayModal,
      calendarSettings.flagDays,
      calendarSettings.nameDays,
      currentDate,
      setNamedayToday,
      setFlagDayToday,
      events,
      addEvent
    )
  }, [nameLoading, flagLoading, nameData, flagData, openFlagDayModal, currentDate, events, addEvent])

  const handleChangeView = (newView) => {
    setView(newView)
    calendarRef.current?.getApi().changeView(newView, currentDate)
  }

  const handleHighlightedDay = (info) => {
    const clickedElement = info.jsEvent.target
    const highlightedCell = calendarRef.current.elRef.current.querySelector(".highlighted-day")

    if (
      highlightedCell &&
      highlightedCell.contains(clickedElement) &&
      (clickedElement.tagName === "A" || clickedElement.closest("a"))
    ) {
      info.jsEvent.preventDefault()
      info.jsEvent.stopPropagation()
      setShowModal(false)
      return
    }

    const date = new Date(info.date)
    date.setDate(date.getDate() + 1)
    const clickedDateStr = date.toISOString().slice(0, 10)
    const allDayCells = calendarRef.current.elRef.current.querySelectorAll("[data-date]")

    allDayCells.forEach((el) => {
      const cellDate = el.getAttribute("data-date")
      if (cellDate === clickedDateStr) {
        el.classList.add("highlighted-day")
      } else {
        el.classList.remove("highlighted-day")
      }
    })

    setHighlightedDate(info.date)
    const end = new Date(info.date)
    end.setHours(date.getHours() + 1)
    setSelectedEvent(null)
    setSelectedDate({ start: info.date, end })

    if (
      info.date.toISOString() === selectedDate?.start?.toISOString() ||
      view === "timeGridWeek" ||
      view === "timeGridDay"
    ) {
      setShowModal(true)
    }
  }

  const formatDate = (date) => {
    if (view === "timeGridDay") {
      const str = date.toLocaleDateString("fi-FI", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric"
      })
      return str.charAt(0).toUpperCase() + str.slice(1)
    } else if (view === "timeGridWeek") {
      const start = new Date(currentDate)
      const day = start.getDay()
      const diff = (day === 0 ? -6 : 1) - day
      start.setDate(start.getDate() + diff)

      const end = new Date(start)
      end.setDate(start.getDate() + 6)

      const startDay = start.getDate()
      const endDay = end.getDate()
      const monthNameStart = start.toLocaleDateString("fi-FI", { month: "long" })
      const monthNameEnd = end.toLocaleDateString("fi-FI", { month: "long" })
      const year = start.getFullYear()

      if (monthNameStart === monthNameEnd) {
        return `${startDay}. - ${endDay}. ${monthNameEnd + "ta"} ${year}`
      } else {
        return `${startDay}. ${monthNameStart} - ${endDay}. ${monthNameEnd + "ta"} ${year}`
      }
    } else if (view === "dayGridMonth") {
      const monthRaw = new Date(currentDate).toLocaleDateString("fi-FI", { month: "long"})
      return monthRaw.charAt(0).toUpperCase() + monthRaw.slice(1) + " " + new Date(currentDate).getFullYear()
    } else if (view === "multiMonthYear") {
      return new Date(currentDate).getFullYear()
    }
  }

  const animatedClass = calendarSettings.animation
    ? "col-2 d-flex justify-content-start align-items-start nameday-container animated"
    : "col-2 d-flex justify-content-start align-items-start nameday-container"

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
          width: "100%"
        }}
      >
        <div className="row">
          <div className={animatedClass}>
            <p>Nimipäivä {highlightedDate.toLocaleDateString("fi-FI")}</p>
            <span>{namedayToday}</span>
          </div>
          <div className="col-6 d-flex justify-content-center align-items-start">
            <Button className="mb-4 ms-2 me-2" onClick={() => { view !== "timeGridDay" && handleChangeView("timeGridDay"); calendarRef.current?.getApi().today() }}>
              Tänään
            </Button>
            <Button className="mb-4 ms-2 me-2" onClick={() => handleChangeView("timeGridWeek")}>Viikkonäkymä</Button>
            <Button className="mb-4 ms-2 me-2" onClick={() => handleChangeView("dayGridMonth")}>Kuukausinäkymä</Button>
            <Button className="mb-4 ms-2 me-2" onClick={() => handleChangeView("multiMonthYear")}>Vuosinäkymä</Button>
          </div>
          <div className="col-4 d-flex justify-content-end align-items-start">
            <SearchBar
              events={events}
              setShowModal={setShowModal}
              setSelectedEvent={setSelectedEvent}
              currentDate={currentDate}
              setShowInfoModal={setShowInfoModal}
              setFlagDayLinks={setFlagDayLinks}
              setModalInfo={setModalInfo}
              setModalTitle={setModalTitle}
            />
          </div>
        </div>

        <div className="row justify-content-center align-items-center mb-4">
          <div className="col-1 d-flex justify-content-end">
            <Button variant="light" className="p-2" onClick={() => { calendarRef.current?.getApi().prev(); setCurrentDate(calendarRef.current?.getApi().getDate()) }}>
              <FontAwesomeIcon icon={faChevronLeft} />
            </Button>
          </div>
          <div className="col-4 d-flex justify-content-center">
            <h5>{formatDate(currentDate)}</h5>
          </div>
          <div className="col-1 d-flex justify-content-start">
            <Button variant="light" className="p-2" onClick={() => { calendarRef.current?.getApi().next(); setCurrentDate(calendarRef.current?.getApi().getDate()) }}>
              <FontAwesomeIcon icon={faChevronRight} />
            </Button>
          </div>
        </div>

        <div style={{ width: "100%", display: "flex", justifyContent: "center" }}>
          <div className="full-calendar-container" style={{ width: "100%" }}>
            <FullCalendar
              ref={calendarRef}
              plugins={[dayGridPlugin, multiMonthPlugin, interactionPlugin, timeGridPlugin]}
              allDaySlot={false}
              initialView={view}
              initialDate={currentDate}
              locale={fiLocale}
              height="60vh"
              headerToolbar={false}
              dateClick={handleHighlightedDay}
              events={events}
              eventClick={(info) => {
                info.jsEvent.preventDefault()
                setSelectedEvent({
                  id: info.event.id,
                  title: info.event.title,
                  start: info.event.start,
                  end: info.event.end,
                  details: info.event.extendedProps?.details || "",
                  links: info.event.extendedProps?.links || [],
                  classNames: info.event.classNames || []
                })
                setShowModal(true)
                setSelectedDate(null)
              }}
              editable
              eventDrop={(info) => updateEvent(info.event.id, { start: info.event.start.toISOString(), end: info.event.end?.toISOString() })}
              eventResize={(info) => updateEvent(info.event.id, { start: info.event.start.toISOString(), end: info.event.end?.toISOString() })}
              slotDuration="00:30:00"
              slotLabelInterval="00:30"
              slotLabelFormat={{ hour: "2-digit", minute: "2-digit", hour12: false }}
              eventTimeFormat={{ hour: "2-digit", minute: "2-digit", hour12: false }}
              datesSet={() => insertSolidCalendarEntries(
                calendarRef,
                flagData,
                nameData,
                openFlagDayModal,
                calendarSettings.flagDays,
                calendarSettings.nameDays,
                currentDate,
                setNamedayToday,
                setFlagDayToday,
                events,
                addEvent
              )}
              dayCellDidMount={(info) => {
                if (info.date.toDateString() === new Date().toDateString()) {
                  const el = info.el.querySelector('.fc-daygrid-day-top')
                  if (el) {
                    el.style.position = 'relative'
                    el.innerHTML = `
                      <span style="position: absolute; top: 2px; left: 2px; font-style:italic; color:darkblue; font-size:1em"><b>Tänään</b></span>
                    `
                  }
                }}
              }
            />

            <CalendarEventModal
              show={showModal}
              handleClose={() => setShowModal(false)}
              date={selectedDate}
              onSave={(event) => {
                if (event.id) {
                  updateEvent(event.id, event)
                } else {
                  addEvent(event)
                }
                setShowModal(false)
              }}
              onDelete={(id) => { deleteEvent(id); setShowModal(false) }}
              eventToEdit={selectedEvent}
              notify={notify}
            />

            <InfoModal
              show={showInfoModal}
              handleClose={() => setShowInfoModal(false)}
              value={modalTitle}
              flagDayInfo={modalInfo}
              flagDayLinks={flagDayLinks}
            />
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default CalendarFull