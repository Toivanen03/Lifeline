import { useQuery } from "@apollo/client/react"
import { GET_FLAGDAYS, GET_NAMEDAYS } from "../../schema/queries"
import { useCalendarSettings } from "../../contexts/CalendarContext"

export const useSolidDayEntries = () => {
  const { calendarSettings } = useCalendarSettings()

  const { data: flagData } = useQuery(GET_FLAGDAYS)
  const { data: nameData } = useQuery(GET_NAMEDAYS)

  let entries = []

  const additionalHolidays = [
    { title: "Uudenvuodenpäivä", start: "2025-01-01", allDay: true },
    { title: "Juhannusaatto", start: "2025-06-20", allDay: true, details: "Juhannus on valon ja keskikesän juhla, jota vietetään kesäkuussa kesäpäivänseisauksen tienoilla. Suomessa juhannus on yöttömän yön juhla, kun pohjoisen napapiirin pohjoispuolella aurinko ei laske lainkaan kesäpäivänseisauksena. Suomessa juhannus on myös virallinen liputuspäivä, jolloin liputetaan koko juhannusyön ajan." },
  ]

  const flagDays = (flagData?.flagDays ?? []).map(item => ({
    title: item.name,
    start: item.date.split("T")[0],
    allDay: true,
    textColor: item.official
      ? "rgba(255, 0, 0, 0.5)"
      : "rgba(110, 110, 110, 0.5)",
    extendedProps: {
      details: item.description,
      links: item.links,
    },
  }))

const nameDays = (nameData?.nameDays ?? []).map(item => ({
  title: item.names.join(", "),
  start: `2025-${item.date}`,
  allDay: true,
}))

  function addClassNames(events, ...classNames) {
    return events.map(event => ({
      ...event,
      classNames: [...(event.classNames || []), ...classNames],
    }))
  }

  const flagDaysWithClass = addClassNames(flagDays, "flagday", "locked")
  const holidaysWithClass = addClassNames(additionalHolidays, "holiday", "locked")
  const nameDaysWithClass = addClassNames(nameDays, "nameday", "locked")

  if (calendarSettings.flagDays)
    entries.push(...flagDaysWithClass, ...holidaysWithClass)
  if (calendarSettings.nameDays) entries.push(...nameDaysWithClass)

  return { entries }
}