import { useState, useMemo } from "react"

const SearchBar = ({ events, setShowModal, setSelectedEvent, currentDate, setShowInfoModal, setFlagDayLinks, setModalInfo, setModalTitle }) => {
  const year = new Date(currentDate).getFullYear()
  const [query, setQuery] = useState("")

  const filteredEvents = useMemo(() => {
    if (!query) return []
    const lowerQuery = query.toLowerCase()

    return events
      .map(event => {
        let startDate
        if (event.date) {
          const [day, month] = event.date.split("-")
          startDate = new Date(`${year}-${month}-${day}`)
        } else if (event.start) {
          startDate = new Date(event.start)
        }
        return { ...event, start: startDate, end: startDate, classNames: event.classNames || [] }
      })
      .filter(event => {
        const matchInNames = Array.isArray(event.names) && event.names.some(name => name?.toLowerCase().includes(lowerQuery))
        const matchInTitle = event.title?.toLowerCase().includes(lowerQuery)
        const matchInDetails = event.details?.toLowerCase().includes(lowerQuery)
        const matchInFlagDay = event.__typename === "FlagDay" && event.name?.toLowerCase().includes(lowerQuery)
        const isMatch = matchInNames || matchInTitle || matchInDetails || matchInFlagDay

        if (isMatch) {
          if (matchInNames) event.classNames.push("nameday", "locked")
          if (matchInFlagDay) event.classNames.push("flagday", "locked")
        }
        return isMatch
      })
  }, [events, query, year])

  const handleClick = (event) => {
    setSelectedEvent(event)

    if (event.__typename === "FlagDay") {
      const title = event.name || event.title
      const info = event.details || event.description || ""
      const links = event.links || []

      setModalTitle(title)
      setModalInfo(info)
      setFlagDayLinks(links)
      setShowInfoModal(true)
    } else if (event.__typename === "NameDay") {
      const dateStr = event.date
      const title = `${event.names.join(", ")}:nameday:${dateStr}`

      setModalTitle(title)
      setModalInfo("")
      setFlagDayLinks([])
      setShowInfoModal(true)
    } else {
      setShowModal(true)
    }

    setQuery("")
  }

  return (
    <div style={{ position: "relative", width: "100%" }}>
      <input
        type="text"
        placeholder="Hae merkintöjä, nimipäiviä, liputuspäiviä..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        style={{ width: "100%", padding: "6px 10px", borderRadius: 5, border: "1px solid #ccc" }}
      />

      {query && filteredEvents.length > 0 && (
        <ul style={{
          position: "absolute",
          top: "100%",
          left: 0,
          right: 0,
          zIndex: 1000,
          backgroundColor: "white",
          border: "1px solid #ccc",
          borderRadius: 5,
          listStyle: "none",
          padding: 0,
          margin: "2px 0",
          maxHeight: "200px",
          overflowY: "auto"
        }}>
          {filteredEvents.map((event, idx) => (
            <li
              key={event.id || idx}
              style={{ padding: "4px 8px", borderBottom: "1px solid #eee", cursor: "pointer" }}
              onClick={() => handleClick(event)}
            >
              <strong>
                {event.__typename === "NameDay" ? event.names.join(", ") : event.title || event.name || "Nimetön"}
              </strong>
              <div style={{ fontSize: "0.8em", color: "#555" }}>
                {event.start.toLocaleDateString("fi-FI", { day: "numeric", month: "numeric" })}
              </div>
            </li>
          ))}
        </ul>
      )}

      {query && filteredEvents.length === 0 && (
        <div style={{
          position: "absolute",
          top: "100%",
          left: 0,
          right: 0,
          backgroundColor: "white",
          border: "1px solid #ccc",
          borderRadius: 5,
          padding: 8,
          zIndex: 1000
        }}>
          Ei tuloksia
        </div>
      )}
    </div>
  )
}

export default SearchBar