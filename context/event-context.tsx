"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import {
  updateEvent as updateFirestoreEvent,
  deleteEvent as deleteFirestoreEvent,
  getEventById as getFirestoreEventById,
  getEventBySlug as getFirestoreEventBySlug,
} from "@/lib/firebase-service"
import { EventItem } from "@/types/event"

interface EventContextType {
  events: EventItem[]
  loading: boolean
  error: string | null
  updateEvent: (id: string, event: Partial<EventItem>) => Promise<EventItem | null>
  deleteEvent: (id: string) => Promise<boolean>
  getEventById: (id: string) => Promise<EventItem | null>
  getEventBySlug: (slug: string) => Promise<EventItem | null>
  refreshEvents: () => Promise<void>
}

const EventContext = createContext<EventContextType | undefined>(undefined)

export function EventProvider({ children }: { children: ReactNode }) {
  const [events, setEvents] = useState<EventItem[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const STORAGE_KEY = "cachedEvents"

  // Function to create slug from title
  const createSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^\w ]+/g, "")
      .replace(/ +/g, "-")
  }

  // Fetch events from API
  const fetchEvents = async () => {
    setLoading(true)
    try {
      const response = await fetch("https://fastapi-gorillatix-production.up.railway.app/events/")
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      if (Array.isArray(data)) {
        const eventsWithSlugs = data.map((event) => ({
          ...event,
          slug: event.slug?.trim() ? event.slug : createSlug(event.title),
        }))
        setEvents(eventsWithSlugs)
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(eventsWithSlugs))
      } else {
        setEvents([])
        sessionStorage.removeItem(STORAGE_KEY)
        console.warn("[⚠️] Unexpected data format received:", data)
      }

      setError(null)
    } catch (err: any) {
      console.error("❌ Error fetching events:", err?.message || err)
      setEvents([])
      sessionStorage.removeItem(STORAGE_KEY)
      setError("Failed to load events")
    } finally {
      setLoading(false)
    }
  }

  // On mount, load cached events if available, else fetch
  useEffect(() => {
    const cached = sessionStorage.getItem(STORAGE_KEY)
    if (cached) {
      try {
        const parsed = JSON.parse(cached)
        if (Array.isArray(parsed)) {
          setEvents(parsed)
          setLoading(false)
          setError(null)
          return // pakai cache, tidak fetch ulang
        }
      } catch {
        // parsing error, lanjut fetch baru
      }
    }

    // Tidak ada cache valid, fetch events
    fetchEvents()
  }, [])

  // Refresh events (force fetch)
  const refreshEvents = async () => {
    await fetchEvents()
  }

  // Update event
  const updateEvent = async (id: string, updatedEvent: Partial<EventItem>) => {
    try {
      const updateData: Partial<EventItem> = { ...updatedEvent }
      if (updatedEvent.title) {
        updateData.slug = createSlug(updatedEvent.title)
      }

      await updateFirestoreEvent(id, updateData)

      setEvents((prev) =>
        prev.map((event) => (event.id === id ? { ...event, ...updateData } : event))
      )

      const updated = events.find((e) => e.id === id)
      return updated || null
    } catch (err) {
      console.error("Error updating event:", err)
      setError("Failed to update event")
      return null
    }
  }

  // Delete event
  const deleteEvent = async (id: string) => {
    try {
      await deleteFirestoreEvent(id)
      setEvents((prev) => prev.filter((event) => event.id !== id))
      return true
    } catch (err) {
      console.error("Error deleting event:", err)
      setError("Failed to delete event")
      return false
    }
  }

  // Get event by ID
  const getEventById = async (id: string) => {
    try {
      const localEvent = events.find((event) => event.id === id)
      if (localEvent) return localEvent

      const event = await getFirestoreEventById(id)
      return event as EventItem | null
    } catch (err) {
      console.error("Error getting event by ID:", err)
      setError("Failed to get event")
      return null
    }
  }

  // Get event by slug
  const getEventBySlug = async (slug: string) => {
    try {
      const localEvent = events.find((event) => event.slug === slug)
      if (localEvent) return localEvent

      const event = await getFirestoreEventBySlug(slug)
      if (event) return event as EventItem

      await refreshEvents()
      return events.find((event) => event.slug === slug) || null
    } catch (err) {
      setError("Failed to get event")
      return null
    }
  }

  return (
    <EventContext.Provider
      value={{
        events,
        loading,
        error,
        updateEvent,
        deleteEvent,
        getEventById,
        getEventBySlug,
        refreshEvents,
      }}
    >
      {children}
    </EventContext.Provider>
  )
}

export function useEvents() {
  const context = useContext(EventContext)
  if (context === undefined) {
    throw new Error("useEvents must be used within an EventProvider")
  }
  return context
}
