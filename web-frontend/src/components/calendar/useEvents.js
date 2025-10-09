import { useState, useEffect, useContext, useMemo } from "react"
import { useQuery, useMutation } from "@apollo/client/react"
import { CALENDAR_ENTRIES, CREATE_CALENDAR_ENTRY, UPDATE_CALENDAR_ENTRY, DELETE_CALENDAR_ENTRY } from "../../schema/queries"
import { AuthContext } from "../../contexts/AuthContext"

export const useEvents = () => {
  const [events, setEvents] = useState([])
  const { currentUser } = useContext(AuthContext)

  const familyId = currentUser?.familyId

  const { data, loading, refetch } = useQuery(CALENDAR_ENTRIES, {
    variables: { familyId },
    skip: !familyId
  })

  const [createEntry] = useMutation(CREATE_CALENDAR_ENTRY)
  const [updateEntry] = useMutation(UPDATE_CALENDAR_ENTRY)
  const [deleteEntry] = useMutation(DELETE_CALENDAR_ENTRY)

  const mapApiToEvent = (e) => ({
    id: e.id,
    title: e.title,
    details: e.details,
    start: new Date(e.start),
    end: new Date(e.end),
    allDay: !!e.allDay,
    creatorId: e.creatorId,
    viewUserIds: e.viewUserIds || []
  })

  useEffect(() => {
    if (data?.calendarEntries) {
      setEvents(data.calendarEntries.map(mapApiToEvent))
    }
  }, [data])

  const addEvent = (event, options = { persist: true }) => {
    if (!familyId) return null

    const now = new Date()
    const startDefault = new Date(now)
    startDefault.setMinutes(0, 0, 0)
    const endDefault = new Date(startDefault.getTime() + 60 * 60 * 1000)

    const title = event.title?.toString().trim() || 'Tapahtuma'
    const startVal = event.start instanceof Date ? event.start : (event.start ? new Date(event.start) : startDefault)
    const endVal = event.end instanceof Date ? event.end : (event.end ? new Date(event.end) : endDefault)

    const payload = {
      familyId,
      input: {
        title,
        details: event.details || '',
        start: startVal.toISOString(),
        end: endVal.toISOString(),
        allDay: !!event.allDay,
        viewUserIds: event.viewUserIds || []
      }
    }
    if (!options.persist) {
      const localEvent = {
        id: crypto.randomUUID(),
        title: payload.input.title,
        details: payload.input.details,
        start: startVal,
        end: endVal,
        allDay: payload.input.allDay,
        creatorId: currentUser?.id,
        viewUserIds: payload.input.viewUserIds
      }
      setEvents(prev => [...prev, localEvent])
      return Promise.resolve(localEvent)
    }

    return createEntry({ variables: payload }).then(async res => {
      const saved = res?.data?.createCalendarEntry
      if (saved) {
        const mapped = mapApiToEvent(saved)
        setEvents(prev => [...prev.filter(e => e.id !== mapped.id), mapped])
      }
      return res?.data?.createCalendarEntry || null
    })
  }

  const updateEvent = (id, updates) => {
    const existing = events.find(e => e.id === id)
    if (!existing) return null
    const input = {
      title: updates.title ?? existing.title,
      details: updates.details ?? existing.details,
      start: (updates.start ?? existing.start),
      end: (updates.end ?? existing.end),
      allDay: updates.allDay ?? existing.allDay,
      viewUserIds: updates.viewUserIds ?? existing.viewUserIds
    }
    const startVal = input.start instanceof Date ? input.start : new Date(input.start)
    const endVal = input.end instanceof Date ? input.end : new Date(input.end)
    input.start = startVal.toISOString()
    input.end = endVal.toISOString()

    return updateEntry({ variables: { id, input } }).then(res => {
      const saved = res?.data?.updateCalendarEntry
      if (saved) {
        const mapped = mapApiToEvent(saved)
        setEvents(prev => prev.map(e => e.id === id ? mapped : e))
      }
      return res?.data?.updateCalendarEntry || null
    })
  }

  const deleteEvent = async (id) => {
    return deleteEntry({ variables: { id } }).then(res => {
      setEvents(prev => prev.filter(e => e.id !== id))
      return !!res?.data?.deleteCalendarEntry
    })
  }

  return {
    events,
    loading,
    refetch,
    addEvent,
    updateEvent,
    deleteEvent
  }
}