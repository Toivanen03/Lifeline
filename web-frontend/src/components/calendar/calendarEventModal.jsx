import { Modal, Button, Form } from "react-bootstrap"
import { useState, useEffect } from "react"

const CalendarEventModal = ({ show, handleClose, date, onSave, eventToEdit }) => {
  const [title, setTitle] = useState(eventToEdit?.title || "")
  const [details, setDetails] = useState("")
  const [allDay, setAllDay] = useState(false)
  const [start, setStart] = useState(date?.start || new Date())
  const [end, setEnd] = useState(date?.end || new Date())
  const [prevTimes, setPrevTimes] = useState(null)

  useEffect(() => {
    if (date && !eventToEdit) {
      setStart(date.start)
      setEnd(date.end)
    }
  }, [date, eventToEdit])

  useEffect(() => {
    if (eventToEdit) {
        setTitle(eventToEdit.title)
        setDetails(eventToEdit.details || "")
        setStart(new Date(eventToEdit.start))
        setEnd(new Date(eventToEdit.end))
        setAllDay(eventToEdit.allDay)
    }
  }, [eventToEdit])

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
    if (title.trim() === "") return
    onSave({
      id: eventToEdit?.id,
      title,
      start,
      end,
      allDay,
      details,
    })
    setTitle("")
    setDetails("")
    setAllDay(false)
    handleClose()
  }

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>
          {eventToEdit ? "Muokkaa merkintää" : "Uusi merkintä"}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Otsikko</Form.Label>
            <Form.Control
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Kirjoita tapahtuman nimi"
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Lisätiedot</Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Esim. paikka, osallistujat..."
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Check
              type="checkbox"
              label="Koko päivä"
              checked={allDay}
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
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Peruuta
        </Button>
        <Button variant="primary" onClick={handleSave}>
          Tallenna
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

export default CalendarEventModal