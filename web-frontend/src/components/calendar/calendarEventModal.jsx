import { Modal, Button, Form } from "react-bootstrap"
import { useState, useEffect } from "react"

const CalendarEventModal = ({ show, handleClose, date, onSave, onDelete, eventToEdit, notify }) => {
  const [title, setTitle] = useState(eventToEdit?.title || "")
  const [details, setDetails] = useState(eventToEdit?.details || "")
  const [allDay, setAllDay] = useState(false)
  const [start, setStart] = useState(date?.start || new Date())
  const [end, setEnd] = useState(date?.end || new Date())
  const [prevTimes, setPrevTimes] = useState(null)
  const [links] = useState(eventToEdit?.links)
  const locked = eventToEdit?.classNames.includes('locked')

  useEffect(() => {
    if (!show) return
    if (eventToEdit) {
      setTitle(eventToEdit.title)
      if (eventToEdit?.classNames?.includes('nameday')) {
        setDetails('Onnea nimpparisankareille! 🍰🌹🥳')
      } else {
        setDetails(eventToEdit.details || "")
      }
      setStart(new Date(eventToEdit.start))
      setEnd(new Date(eventToEdit.end))
      setAllDay(eventToEdit.allDay)
    } else if (date) {
      setTitle("")
      setDetails("")
      setAllDay(false)
      setStart(date.start)
      setEnd(date.end)
    } else {
      setTitle("")
      setDetails("")
      setAllDay(false)
      setStart(new Date())
      setEnd(new Date())
    }
  }, [show, eventToEdit, date])

  const toLocalDateTimeString = (date) => {
    if (!date) return ""
    const offset = date.getTimezoneOffset()
    const localDate = new Date(date.getTime() - offset * 60000)
    return localDate.toISOString().slice(0, 16)
  }

  const handleAllDayChange = (e) => {
    const checked = e.target.checked
    setAllDay(checked)

    if (checked) {
      setPrevTimes({ start, end })
      const startDay = new Date(start)
      startDay.setHours(0, 0, 0, 0)
      const endDay = new Date(end)
      endDay.setHours(23, 59, 59, 999)
      setStart(startDay)
      setEnd(endDay)
    } else if (prevTimes) {
      setStart(prevTimes.start)
      setEnd(prevTimes.end)
    }
  }

  const handleSave = () => {
    if (title.trim() === "") {
      notify("Lisää tapahtumalle otsikko.", "info")
      return
    }
    onSave({
      id: eventToEdit?.id,
      title,
      start,
      end,
      allDay,
      details,
    })
    notify("Merkintä tallennettu onnistuneesti!", "success")
    setTitle("")
    setDetails("")
    setAllDay(false)
    handleClose()
  }

  const handleDelete = () => {
    if (window.confirm("Haluatko varmasti poistaa merkinnän?")) {
      onDelete(eventToEdit.id)
    }
  }

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>
          {eventToEdit ? (!locked ? "Muokkaa merkintää" : eventToEdit.title) : "Uusi merkintä"}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          {!locked && <Form.Group className="mb-3">
            <Form.Label>Otsikko</Form.Label>
            <Form.Control
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </Form.Group>}

          <Form.Group className="mb-3">
            <Form.Label>Lisätiedot</Form.Label>
            <Form.Control
              as="textarea"
              rows={10}
              value={details}
              disabled={locked}
              onChange={(e) => setDetails(e.target.value)}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Check
              type="checkbox"
              label="Koko päivä"
              checked={allDay}
              disabled={locked}
              onChange={handleAllDayChange}
            />
          </Form.Group>

          {!allDay && (
            <>
              <Form.Group className="mb-3">
                <Form.Label>Alkaa</Form.Label>
                <Form.Control
                  type="datetime-local"
                  value={toLocalDateTimeString(start)}
                  onChange={(e) => setStart(new Date(e.target.value))}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Päättyy</Form.Label>
                <Form.Control
                  type="datetime-local"
                  value={toLocalDateTimeString(end)}
                  onChange={(e) => setEnd(new Date(e.target.value))}
                />
              </Form.Group>
            </>
          )}
        </Form>
        {links?.length > 0 && (
          <div className="mt-3">
            <strong>Lisätietoja:</strong>
            <ul>
              {links.map((l, i) => (
                <li key={i}>
                  <a href={l} target="_blank" rel="noopener noreferrer">{l}</a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          {!locked ? 'Peruuta' : 'Sulje'}
        </Button>
        {!locked && <Button variant="primary" onClick={handleSave}>
          Tallenna
        </Button>}
        {eventToEdit && !locked && <Button variant="danger" onClick={handleDelete}>
          Poista
        </Button>}
      </Modal.Footer>
    </Modal>
  )
}

export default CalendarEventModal