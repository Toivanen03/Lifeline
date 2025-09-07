import { Modal, Button, Form } from "react-bootstrap"
import { useState } from "react"

const CalendarEventModal = ({ show, handleClose, date, onSave }) => {
  const [title, setTitle] = useState("")

  const handleSave = () => {
    if (title.trim() === "") return
    onSave({
      title,
      start: date,
      allDay: true,
    })
    setTitle("")
    handleClose()
  }

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Uusi merkintä</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group>
            <Form.Label>Otsikko</Form.Label>
            <Form.Control
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Kirjoita merkinnän otsikko"
            />
          </Form.Group>
          <p className="mt-3">
            Päivä: {new Date(date).toLocaleDateString("fi-FI")}
          </p>
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