import { motion } from "framer-motion"
import FullCalendar from "@fullcalendar/react"
import dayGridPlugin from "@fullcalendar/daygrid"
import timeGridPlugin from "@fullcalendar/timegrid"
import interactionPlugin from "@fullcalendar/interaction"
import multiMonthPlugin from "@fullcalendar/multimonth"
import fiLocale from "@fullcalendar/core/locales/fi"
import { Button } from "react-bootstrap"
import { Modal } from "react-bootstrap"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons'
import { useContext, useRef, useState, useEffect } from "react"
import { useCalendarDay } from "../../contexts/CalendarDayContext"
import { AuthContext } from "../../contexts/AuthContext"
import { IMPORT_WILMA_CALENDAR, GET_WILMA_CALENDAR } from "../../schema/queries"
import { useMutation, useQuery } from "@apollo/client/react"
import WilmaLogo from '../../assets/Wilma_logo.png'
import Dropdown from "react-bootstrap/Dropdown"
import Form from "react-bootstrap/Form"

const Schedules = ({ notify, familyMembers }) => {
    const { currentUser } = useContext(AuthContext)
    const [wilmaEvents, setWilmaEvents] = useState([])
    const [showWilmaField, setShowWilmaField] = useState(false)
    const [selectedEvent, setSelectedEvent] = useState(null)
    const [showModal, setShowModal] = useState(false)
    const [wilmaUrl, setWilmaUrl] = useState("")
    const { data: wilmaData, loading: wilmaLoading, error: wilmaError, refetch: wilmaRefetch } = useQuery(GET_WILMA_CALENDAR)
    const [importWilmaCalendar] = useMutation(IMPORT_WILMA_CALENDAR)
    const { currentDate, setCurrentDate } = useCalendarDay()
    const [showLegend, setShowLegend] = useState(true)
    const [view, setView] = useState("timeGridWeek")
    const calendarRef = useRef(null)
    const [scheduleOwner, setScheduleOwner] = useState("")
    const [wilmaVisible, setWilmaVisible] = useState(
        Object.fromEntries(familyMembers.map(m => [m.id, false]))
    )

    const colors = [
        '#1f77b4',
        '#ff7f0e',
        '#2ca02c',
        '#d62728',
        '#9467bd',
        '#8c564b',
        '#e377c2',
        '#7f7f7f',
        '#bcbd22',
        '#17becf'
    ]

    const ownerColors = {}
        familyMembers.forEach((m, index) => {
            ownerColors[m.id] = colors[index % colors.length]
        })

    useEffect(() => {
        if (!wilmaLoading && wilmaData) {
            const events = wilmaData?.getWilmaCalendar?.map((e, index) => ({
                id: index.toString(),
                title: e.title,
                start: e.start,
                end: e.end,
                allDay: false,
                className: 'locked',
                backgroundColor: ownerColors[e.owner],
                borderColor: ownerColors[e.owner],
                extendedProps: { teacher: e.teacher, room: e.room }
            }))
            setWilmaEvents(events)
        }
    }, [wilmaData, wilmaLoading])

    const addSchedule = async (url) => {
        try {
            const usersArray = Object.entries(wilmaVisible)
                .filter(([_, visible]) => visible)
                .map(([id]) => ({ id }))

            const result = await importWilmaCalendar({
                variables: {
                    icalUrl: url,
                    owner: scheduleOwner,
                    users: usersArray
                }
            })

            if (result.data) {
                notify("Lukujärjestyksen URL lisätty onnistuneesti", "success")
                try {
                    await wilmaRefetch()
                } catch (err) {
                    notify(`${err}`, "error")
                }
            } else {
                notify(`${result.error.message}`, "error")
            }
        } catch {
            notify("Virhe Wilma-kalenterin tuonnissa", "error")
        } finally {
            setWilmaUrl("")
            setShowWilmaField(false)
            setShowLegend(true)
            setScheduleOwner("")
        }
    }

    const handleScheduleOwnerChange = (id) => {
        setScheduleOwner(id)
        setWilmaVisible(
            Object.fromEntries(
                familyMembers.map(m => [m.id, m.id === id || m.id === currentUser.id])
        ))
    }

    const handleChangeView = (newView) => {
        setView(newView)
        calendarRef.current?.getApi().changeView(newView, currentDate)
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
            const monthRaw = new Date(currentDate).toLocaleDateString("fi-FI", { month: "long" })
            return monthRaw.charAt(0).toUpperCase() + monthRaw.slice(1) + " " + new Date(currentDate).getFullYear()
        }
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
                    width: "100%"
                }}
            >
                <div className="row">
                    <div className="col-5">
                        <div className="justify-content-center align-items-center">
                            <Button className="mb-4 ms-2 me-2" onClick={() => { view !== "timeGridDay" && handleChangeView("timeGridDay"); calendarRef.current?.getApi().today() }}>
                                Tänään
                            </Button>
                            <Button className="mb-4 ms-2 me-2" onClick={() => handleChangeView("timeGridWeek")}>Viikkonäkymä</Button>
                            <Button className="mb-4 ms-2 me-2" onClick={() => handleChangeView("dayGridMonth")}>Kuukausinäkymä</Button>
                        </div>
                    </div>
                    <div className="col-3">
                        {currentUser.parent && 
                        <>
                            {!showWilmaField ? (
                                <button
                                    className="btn btn-info"
                                    onClick={() => {
                                        setShowWilmaField(true)
                                        setShowLegend(false)
                                        }
                                    }>
                                    <img src={WilmaLogo} alt="Wilma logo" width={'40px'} /> - integraatio
                                </button>
                            ) : (
                                <button
                                    className="btn btn-info w-100"
                                    onClick={() => addSchedule(wilmaUrl)}
                                    disabled={!wilmaUrl || !scheduleOwner}
                                    >
                                    Lisää <img src={WilmaLogo} alt="Wilma logo" width={'40px'} /> - lukujärjestys
                                </button>
                            )}
                        </>
                        }
                    </div>
                    {showWilmaField && (
                        <div className="col-4">
                            <div className="row">
                                <Dropdown align="end">
                                    <Dropdown.Toggle variant="primary" className="w-100">
                                        {scheduleOwner
                                            ? <span>Lukujärjestyksen haltija: {scheduleOwner === currentUser.id ? "Minä" : familyMembers.find(u => u.id === scheduleOwner)?.name.split(' ')[0]}</span>
                                            : "Aseta lukujärjestyksen haltija"}
                                    </Dropdown.Toggle>
                                    <Dropdown.Menu style={{ minWidth: "250px", padding: "0.5rem 1rem" }}>
                                        {familyMembers.map(member => (
                                            <div key={member.id} className="d-flex justify-content-between align-items-center mb-2">
                                                <span>{currentUser.id === member.id ? "Minä" : member.name.split(' ')[0]}</span>
                                                <Form.Check
                                                    type="switch"
                                                    id={`switch-${member.id}`}
                                                    checked={scheduleOwner === member.id}
                                                    onChange={() => handleScheduleOwnerChange(member.id)}
                                                />
                                            </div>
                                        ))}
                                    </Dropdown.Menu>
                                </Dropdown>
                            </div>
                        </div>
                    )}
                    {showLegend && (
                        <div className="col-4">
                            <div className="row">
                                <div className="col-12 legend">
                                    {familyMembers.map(m => (
                                        <div key={m.id} style={{ display: 'flex', alignItems: 'center', marginBottom: 3 }}>
                                            <div style={{ width: 16, height: 16, backgroundColor: ownerColors[m.id], marginRight: 8 }}></div>
                                            <span>{m.name.split(' ')[0]}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
                <div className="row">
                    <div className="col-5">
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
                    </div>
                    {showWilmaField &&
                    <>
                        <div className="col-3">
                            <input 
                                type="text"
                                value={wilmaUrl}
                                placeholder={"iCal- linkki Wilmasta:"}
                                onChange={({ target }) => setWilmaUrl(target.value)}
                                className="form-control rounded w-100"
                            />
                        </div>
                        <div className="col-4">
                            <div className="row">
                                {scheduleOwner ? ( 
                                    <Dropdown align="end">
                                        <Dropdown.Toggle variant="primary" className="w-100">
                                            <span>Aseta lukujärjestyksen näkyvyys: {Object.values(wilmaVisible).filter(v => v === true).length > 0 && (Object.values(wilmaVisible).filter(v => v === true).length)}</span>
                                        </Dropdown.Toggle>

                                        <Dropdown.Menu style={{ minWidth: "250px", padding: "0.5rem 1rem" }}>
                                            {familyMembers.map(member => (
                                                <div key={member.id} className="d-flex justify-content-between align-items-center mb-2">
                                                    <span>{currentUser.id === member.id ? "Minä" : (member.name.split(' ')[0])}</span>
                                                    <Form.Check
                                                        type="switch"
                                                        id={`switch-${member.id}`}
                                                        checked={wilmaVisible[member.id]}
                                                        onChange={() => {
                                                            setWilmaVisible(prev => ({
                                                                ...prev,
                                                                [member.id]: !prev[member.id]
                                                            }))
                                                        }}
                                                        disabled={member.id === scheduleOwner || member.id === currentUser.id}
                                                    />
                                                </div>
                                            ))}
                                        </Dropdown.Menu>
                                    </Dropdown>
                                ) : (
                                    <div align="end">
                                        <button
                                            className="btn btn-primary w-100"
                                            onClick={() => {
                                                setShowWilmaField(false)
                                                setShowLegend(true)
                                                setScheduleOwner("")
                                            }
                                            }>
                                                Peruuta
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </>
                    }
                </div>

                <div style={{ width: "100%", display: "flex", justifyContent: "center" }}>
                    <div className="full-calendar-container" style={{ width: "100%" }}>
                        <FullCalendar
                            ref={calendarRef}
                            plugins={[dayGridPlugin, multiMonthPlugin, interactionPlugin, timeGridPlugin]}
                            allDaySlot={false}
                            initialView={view}
                            initialDate={currentDate}
                            slotMinTime="08:00:00"
                            slotMaxTime="16:30:00"
                            slotLabelInterval="00:30:00"
                            weekends={false}
                            locale={fiLocale}
                            height="auto"
                            headerToolbar={false}
                            events={wilmaEvents}
                            eventOrder="owner"
                            slotLabelFormat={{
                                hour: '2-digit',
                                minute: '2-digit',
                                hour12: false,
                                meridiem: false,
                            }}
                            eventClick={(info) => {
                                setSelectedEvent(info.event)
                                setShowModal(true)
                            }}
                        />
                    </div>
                </div>
            </div>
            <Modal show={showModal} onHide={() => setShowModal(false)}>
                <Modal.Header>
                    <Modal.Title>{selectedEvent?.title}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="row">
                        <div className="col-3">
                            <strong>Opettaja:</strong> 
                        </div>
                        <div className="col-9">
                            {selectedEvent?.extendedProps.teacher || '-'}
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-3">
                            <strong>Huone:</strong>
                        </div>
                        <div className="col-9">
                            {selectedEvent?.extendedProps.room || '-'}
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-3">
                            <strong>Aika:</strong>
                        </div>
                        <div className="col-9">
                            {selectedEvent?.start.toLocaleTimeString("fi-FI", { hour: '2-digit', minute: '2-digit', hour12: false })} 
                                <span> - </span> {selectedEvent?.end.toLocaleTimeString("fi-FI", { hour: '2-digit', minute: '2-digit', hour12: false })}
                        </div>
                    </div>
                </Modal.Body>
            </Modal>
        </motion.div>
    )
}

export default Schedules