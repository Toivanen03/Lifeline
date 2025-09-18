import { useQuery } from "@apollo/client/react"
import { GET_FLAGDAYS, GET_NAMEDAYS } from "../../schema/queries"

export const useSolidDayEntries = () => {
  const { data: flagData, loading: flagLoading } = useQuery(GET_FLAGDAYS)
  const { data: nameData, loading: nameLoading } = useQuery(GET_NAMEDAYS)

  const loading = flagLoading || nameLoading

  const additionalHolidays = [
    { title: "Uudenvuodenpäivä", start: "2025-01-01", allDay: true },
    { title: "Juhannusaatto", start: "2025-06-20", allDay: true },
  ]

  const flagDays = (flagData?.flagDays ?? []).map(item => ({
    title: item.name,
    start: item.date.split('T')[0],
    allDay: true,
    textColor: item.official ? "rgba(255, 0, 0, 0.5)" : "rgba(110, 110, 110, 0.5)",
    extendedProps: {
      details: item.description,
      links: item.links
    }
  }))

  const nameDays = (nameData?.nameDays ?? []).map(item => ({
    names: item.names,
    date: item.date,
  }))

  function addClassNames(events, ...classNames) {
    return events.map(event => ({
      ...event,
      classNames: [...(event.classNames || []), ...classNames],
    }))
  }

  const flagDaysWithClass = addClassNames(flagDays, "flag-day", "locked")
  const holidaysWithClass = addClassNames(additionalHolidays, "holiday", "locked")
  const nameDaysWithClass = addClassNames(nameDays, "nameDay")

  return { entries: [...holidaysWithClass, ...flagDaysWithClass, ...nameDaysWithClass], loading }
}