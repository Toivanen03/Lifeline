import { motion } from "framer-motion"
import { useLocation } from "react-router-dom"
import FullCalendar from "@fullcalendar/react"
import dayGridPlugin from "@fullcalendar/daygrid"
import timeGridPlugin from "@fullcalendar/timegrid"
import interactionPlugin from "@fullcalendar/interaction"
import fiLocale from "@fullcalendar/core/locales/fi"

const CalendarFull = () => {
  const { state } = useLocation()
  const selectedDate = state?.date || new Date().toISOString().split("T")[0]
  const initialView = state?.initialView || "dayGridMonth"

  return (
    <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -30 }}
        transition={{ duration: 0.4 }}
        className="d-flex flex-column justify-content-center align-items-center"
        style={{ height: '100%' }}
    >
        <div className="card shadow-lg p-4"
            style={{ 
                padding: 20, 
                border: 'solid 1px black', 
                borderRadius: 20, 
                backgroundColor: 'white', 
                width: '100%',
            }}
            >
            <h4 className="mb-5">Perheen kalenteri</h4>
            <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                <div className="full-calendar-container" style={{ width: '100%' }}>
                    <FullCalendar
                        plugins={[dayGridPlugin, interactionPlugin, timeGridPlugin]}
                        initialView={initialView}
                        initialDate={selectedDate}
                        locale={fiLocale}
                        height="60vh"
                    />
                </div>
            </div>
        </div>
    </motion.div>
  )
}

export default CalendarFull