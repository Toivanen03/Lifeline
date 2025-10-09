import { Modal, Button, Form } from "react-bootstrap"
import { useState, useEffect, useContext } from "react"
import { useAccessManagement } from "../../contexts/AccessManagementContext"
import { AuthContext } from "../../contexts/AuthContext"

const CalendarEventModal = ({ show, handleClose, date, onSave, onDelete, eventToEdit, notify, familyMembers }) => {
  const { currentUser } = useContext(AuthContext)
  const [title, setTitle] = useState("")
  const [details, setDetails] = useState("")
  const [allDay, setAllDay] = useState(false)
  const [start, setStart] = useState(new Date())
  const [end, setEnd] = useState(new Date())
  const [prevTimes, setPrevTimes] = useState(null)
  const [userWithView, setUserWithView] = useState([currentUser.id])
  const [onlyMe, setOnlyMe] = useState(true)
  const { rules, setUserRights } = useAccessManagement()

  const locked = eventToEdit?.classNames?.includes('locked') || false

  useEffect(() => {
    if (!show) return

    if (eventToEdit) {
      setTitle(eventToEdit.title || "")
      setDetails(eventToEdit.details || eventToEdit.description || "")
      setStart(new Date(eventToEdit.start))
      setEnd(new Date(eventToEdit.end))
      setAllDay(eventToEdit.allDay || false)
    } else {
      setTitle("")
      setDetails("")
      setAllDay(false)
      const baseDate = new Date(date.start || date)
      baseDate.setSeconds(0, 0)
      const now = new Date()
      const startHours = now.getMinutes() > 0 ? now.getHours() + 1 : now.getHours()
      const defaultStart = new Date(baseDate)
      defaultStart.setHours(startHours, 0, 0, 0)
      const defaultEnd = new Date(defaultStart.getTime() + 60 * 60 * 1000)
      setStart(defaultStart)
      setEnd(defaultEnd)
    }
  }, [show, eventToEdit, date])

  /*useEffect(() => {
    if (!show) return
    const initial = (rules || [])
      .filter(r => r?.canView)
      .map(r => r.userId)
    const withSelf = currentUser?.id ? Array.from(new Set([...(initial || []), currentUser.id])) : initial
    setUserWithView(withSelf)
    setOnlyMe(withSelf?.length === 1 && withSelf[0] === currentUser?.id)
  }, [show, rules])*/

  useEffect(() => {
    setOnlyMe(userWithView.length === 1 && userWithView.includes(currentUser.id))
  }, [userWithView])

  const toLocalDateTimeString = (d) => {
    if (!d) return ""
    const pad = (n) => String(n).padStart(2, '0')
    return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
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
    if (!title.trim()) {
      notify("Lisää tapahtumalle otsikko.", "info")
      return
    }
    if (!allDay && end < start) {
      notify("Tapahtuman päättymisaika ei voi olla ennen alkamisaikaa.", "warning")
      return
    }
    const withSelf = currentUser?.id ? Array.from(new Set([...(userWithView || []), currentUser.id])) : (userWithView || [])
    const eventData = { id: eventToEdit?.id, title, start, end, allDay, details, viewUserIds: withSelf }

    onSave(eventData)
    notify("Merkintä tallennettu onnistuneesti!", "success")
    handleClose()
  }

  const handleDelete = () => {
    if (window.confirm("Haluatko varmasti poistaa merkinnän?")) {
      onDelete(eventToEdit.id)
      handleClose()
    }
  }

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>{eventToEdit ? (!locked ? "Muokkaa merkintää" : eventToEdit.title) : "Uusi merkintä"}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          {!locked && <Form.Group className="mb-3">
            <Form.Label>Otsikko</Form.Label>
            <Form.Control type="text" value={title} onChange={(e) => setTitle(e.target.value)} />
          </Form.Group>}
          <Form.Group className="mb-3">
            <Form.Label>Lisätiedot</Form.Label>
            <Form.Control as="textarea" rows={8} value={details} disabled={locked} onChange={(e) => setDetails(e.target.value)} />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Merkinnän näkyvyys:</Form.Label>
            <div>
              <Form.Check
                type="checkbox"
                id="view-only-me"
                label="Minä"
                checked={userWithView.includes(currentUser.id)}
                disabled={eventToEdit?.creatorId === currentUser.id}
                onChange={async (e) => {
                  const isChecked = e.target.checked
                  setUserWithView(prev => {
                    const set = new Set(prev)
                    if (isChecked) set.add(currentUser.id)
                    else if (currentUser.id !== eventToEdit?.creatorId) set.delete(currentUser.id)
                    return Array.from(set)
                  })
                  if (eventToEdit?.id) {
                    try {
                      await setUserRights({ userId: currentUser.id, canView: isChecked })
                    } catch (_) {}
                  }
                  if (!isChecked) notify("Olet poistanut itsesi merkinnästä.", "info")
                }}
              />
              {(familyMembers || []).filter(m => m.id !== currentUser?.id).map(member => {
                const checked = userWithView.includes(member.id)
                return (
                  <Form.Check
                    key={member.id}
                    type="checkbox"
                    id={`view-${member.id}`}
                    label={member.name.split(' ')[0]}
                    checked={checked || member.id === eventToEdit?.creatorId}
                    disabled={member.id === eventToEdit?.creatorId}
                    onChange={async (e) => {
                      const isChecked = e.target.checked
                      if (!isChecked && member.id === currentUser.id && member.id !== eventToEdit?.creatorId) {
                        const creatorOnly = eventToEdit?.creatorId ? [eventToEdit.creatorId] : []
                        setUserWithView(creatorOnly)
                        setOnlyMe(false)

                        if (eventToEdit?.id && eventToEdit?.creatorId) {
                          try {
                            await Promise.all([
                              setUserRights({ userId: currentUser.id, canView: false }),
                              setUserRights({ userId: eventToEdit.creatorId, canView: true })
                            ])
                          } catch (_) {}
                        }
                        notify("Olet poistanut itsesi merkinnästä.", "info")
                        return
                      }

                      setUserWithView(prev => {
                        const set = new Set(prev)
                        if (isChecked) set.add(member.id)
                        else set.delete(member.id)
                        const userList = Array.from(set)
                        setOnlyMe(userList.length === 1 && userList.includes(currentUser.id))
                        return userList
                      })

                      if (eventToEdit?.id) {
                        try {
                          await setUserRights({ userId: member.id, canView: isChecked })
                        } catch (_) {}
                      }
                    }}
                  />
                )
              })}
            </div>
          </Form.Group>
          {!locked && <Form.Group className="mb-3">
            <Form.Check type="checkbox" label="Koko päivä" checked={allDay} onChange={handleAllDayChange} />
          </Form.Group>}
          {!allDay && !locked && (
            <Form.Group className="mb-3">
              <Form.Label>Alkaa</Form.Label>
              <Form.Control type="datetime-local" value={toLocalDateTimeString(start)} onChange={(e) => {
                const newStart = new Date(e.target.value)
                setStart(newStart)
                if (end <= newStart) setEnd(new Date(newStart.getTime() + 60 * 1000))
              }} />
              <Form.Label>Päättyy</Form.Label>
              <Form.Control type="datetime-local" value={toLocalDateTimeString(end)} onChange={(e) => {
                const newEnd = new Date(e.target.value)
                if (newEnd > start) setEnd(newEnd)
                else {
                  setEnd(new Date(start.getTime() + 60 * 1000))
                  notify("Päättymisaika ei voi olla ennen alkamisaikaa.", "info")
                }
              }} />
            </Form.Group>
          )}
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>{locked ? "Sulje" : "Peruuta"}</Button>
        {!locked && <Button variant="primary" onClick={handleSave}>Tallenna</Button>}
        {eventToEdit && !locked && <Button variant="danger" onClick={handleDelete}>Poista</Button>}
      </Modal.Footer>
    </Modal>
  )
}

export default CalendarEventModal