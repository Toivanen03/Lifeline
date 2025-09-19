import { useMemo } from "react"

export const useCalendarEvents = ({ solidEntries, userEvents, view, currentDate }) => {
    const combinedEvents = useMemo(() => {
        if (!solidEntries) return [...userEvents]

        const solidEventsAdjusted = solidEntries.map(e => {
            if (e.classNames?.includes("nameday") || e.classNames?.includes("flagday")) {
            const original = new Date(e.start)
            const adjusted = new Date(original)
            adjusted.setFullYear(currentDate.getFullYear())
            return { ...e, start: adjusted.toISOString() }
            }
            return e
        })

    return [...solidEventsAdjusted, ...userEvents]
    }, [solidEntries, userEvents, currentDate])

    const visibleEvents = useMemo(() => {
    if (!combinedEvents.length) return []

    const eventsFilteredByView = combinedEvents.filter(e => {
        if (view === "multiMonthYear" && e.classNames?.includes("nameday")) return false
        return true
    })

    if (view === "timeGridDay") {
        return eventsFilteredByView.filter(e => {
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

        return eventsFilteredByView.filter(e => {
        const evStart = new Date(e.start)
        const evEnd = e.end ? new Date(e.end) : evStart
        return evStart <= end && evEnd >= start
        })
    }

    return eventsFilteredByView
    }, [combinedEvents, view, currentDate])

    const userVisibleEvents = useMemo(() => visibleEvents.filter(e => !e.classNames?.includes("locked")), [visibleEvents])
    const nameDays = useMemo(() => combinedEvents.filter(e => e.classNames?.includes("nameday")), [combinedEvents])

    const findNameDay = (date = new Date()) => {
        if (!nameDays.length) return null

        const month = String(date.getMonth() + 1).padStart(2, '0')
        const day = String(date.getDate()).padStart(2, '0')
        const todayStr = `${month}-${day}`

        const result = (solidEntries || []).find(nd => String(nd.start).slice(5) === todayStr && nd.classNames?.includes("nameday"))
        if (!result) return null

        return {
            names: result.title.split(", "),
            dateStr: `${date.toLocaleDateString("fi-FI",{day:"numeric", month:"numeric"})}`,
        }
    }

    return { combinedEvents, visibleEvents, userVisibleEvents, nameDays, findNameDay }
}