import { useState } from "react"

export const useUserEvents = () => {
    const [userEvents, setUserEvents] = useState([])

    const updateUserEvent = (id, updates) => {
        setUserEvents(prev => prev.map(e => e.id === id ? { ...e, ...updates } : e))
    }

    const saveUserEvent = (event) => {
        const startDate = event.start ? new Date(event.start) : new Date()
        const endDate = event.end ? new Date(event.end) : new Date(startDate.getTime() + 3600 * 1000)

        let startISO, endISO
        if (event.allDay) {
            const s = new Date(startDate)
            s.setHours(0, 0, 0, 0)
            const e = new Date(s)
            e.setDate(e.getDate() + 1)
            e.setHours(0, 0, 0, 0)
            startISO = s.toISOString()
            endISO = e.toISOString()
        } else {
            startISO = startDate.toISOString()
            endISO = endDate.toISOString()
        }

        if (event.id) {
            updateUserEvent(event.id, {
                title: event.title,
                start: startISO,
                end: endISO,
                allDay: !!event.allDay,
                details: event.details || "",
                classNames: event.classNames || [],
            })
            return { ...event, start: startISO, end: endISO }
        } else {
            const newEvent = {
                id: String(Date.now()),
                title: event.title,
                start: startISO,
                end: endISO,
                allDay: !!event.allDay,
                details: event.details || "",
                classNames: event.classNames || [],
            }
            setUserEvents(prev => [...prev, newEvent])
            return newEvent
        }
    }

    const deleteUserEvent = (id) => setUserEvents(prev => prev.filter(e => e.id !== id))

    return { userEvents, updateUserEvent, saveUserEvent, deleteUserEvent }
}