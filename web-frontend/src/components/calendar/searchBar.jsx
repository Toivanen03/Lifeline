import { useState, useMemo } from "react"

const SearchBar = ({ events, setShowModal, setSelectedEvent }) => {
  const [query, setQuery] = useState("")

  const filteredEvents = useMemo(() => {
    if (!query) return []
    const lowerQuery = query.toLowerCase()
    return events.filter(e => 
      e.title.toLowerCase().includes(lowerQuery) ||
      (e.details?.toLowerCase().includes(lowerQuery))
    )
  }, [events, query])

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
          {filteredEvents.map((event, idx) => {
            return (
                <li
                    key={event.id || idx}
                    style={{ padding: "4px 8px", borderBottom: "1px solid #eee", cursor: "pointer" }}
                    onClick={() => {
                        setSelectedEvent({
                            id: event.id,
                            title: event.title,
                            start: event.start,
                            end: event.end,
                            allDay: event.allDay,
                            details: event.details ?? event.extendedProps?.details ?? "",
                            links: event.links || [],
                            classNames: event.classNames || []
                        })
                        setShowModal(true)
                        setQuery("")
                    }}
                >
                <strong>{event.title}</strong>
                <div style={{ fontSize: "0.8em", color: "#555" }}>
                    {event.classNames?.includes("nameday") || event.classNames?.includes("flagday")
                    ? new Date(event.start).toLocaleDateString("fi-FI",{day:"numeric",month:"numeric"})
                    : new Date(event.start).toLocaleDateString("fi-FI")}
                </div>
                </li>
            )
          })}
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