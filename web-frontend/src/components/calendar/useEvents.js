import { useState } from "react"

export const useEvents = () => {
  const [events, setEvents] = useState([])

  const addEvent = (event) => {
    const newEvent = { 
      ...event, 
      id: crypto.randomUUID()
    }
    setEvents(prev => [...prev, newEvent])
    return newEvent
  }

  const updateEvent = (id, updates) => {
    setEvents(prev =>
      prev.map(e => e.id === id ? { ...e, ...updates } : e)
    )
  }

  const deleteEvent = (id) => {
    setEvents(prev => prev.filter(e => e.id !== id))
  }

  return {
    events,
    addEvent,
    updateEvent,
    deleteEvent
  }
}

{/*
import { useQuery, useMutation } from "@apollo/client"
import { ALL_EVENTS, ADD_EVENT, UPDATE_EVENT, DELETE_EVENT } from "../graphql"

export const useEvents = () => {
  const { data, loading } = useQuery(ALL_EVENTS)
  const [addEventMutation] = useMutation(ADD_EVENT)
  const [updateEventMutation] = useMutation(UPDATE_EVENT)
  const [deleteEventMutation] = useMutation(DELETE_EVENT)

  const addEvent = async (event) => {
    const res = await addEventMutation({ variables: { event } })
    return res.data.addEvent
  }

  const updateEvent = (id, updates) => {
    return updateEventMutation({ variables: { id, updates } })
  }

  const deleteEvent = (id) => {
    return deleteEventMutation({ variables: { id } })
  }

  return {
    events: data?.events || [],
    loading,
    addEvent,
    updateEvent,
    deleteEvent
  }
}
*/}