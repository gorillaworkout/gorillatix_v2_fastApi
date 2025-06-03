"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import {
  getEvents as getFirestoreEvents,
  createEvent as createFirestoreEvent,
  updateEvent as updateFirestoreEvent,
  deleteEvent as deleteFirestoreEvent,
  getEventById as getFirestoreEventById,
  getEventBySlug as getFirestoreEventBySlug,
} from "@/lib/firebase-service"
import { useAuth } from "@/components/auth-provider"
import { EventProps } from "@/types/event"
// Create the context
interface EventContextType {
  events: EventProps[]
  loading: boolean
  error: string | null
  addEvent: (event: Omit<EventProps, "id" | "slug">) => Promise<EventProps | null>
  updateEvent: (id: string, event: Partial<EventProps>) => Promise<EventProps | null>
  deleteEvent: (id: string) => Promise<boolean>
  getEventById: (id: string) => Promise<EventProps | null>
  getEventBySlug: (slug: string) => Promise<EventProps | null>
  refreshEvents: () => Promise<void>
}

const EventContext = createContext<EventContextType | undefined>(undefined)

// Create a provider component
export function EventProvider({ children }: { children: ReactNode }) {
  const [events, setEvents] = useState<EventProps[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()

  // Create a slug from the title
  const createSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^\w ]+/g, "")
      .replace(/ +/g, "-")
  }

  // Load events from Firestore on mount
  const fetchEvents = async () => {
    setLoading(true)
    try {
      const fetchedEvents = await getFirestoreEvents()

      if (fetchedEvents && fetchedEvents.length > 0) {
        // Ensure all events have slugs
        const eventsWithSlugs = fetchedEvents.map((event) => ({
          ...event,
          slug: event.slug || createSlug(event.title),
        }))
        setEvents(eventsWithSlugs)
      } else {
        // Empty array if no events found
        setEvents([])
      }
      setError(null)
    } catch (err) {
      console.error("Error fetching events:", err)
      setError("Failed to load events")
      setEvents([])
    } finally {
      setLoading(false)
    }
  }

  // Initial fetch
  useEffect(() => {
    fetchEvents()
  }, [])

  // Refresh events
  const refreshEvents = async () => {
    await fetchEvents()
  }

  // Add a new event
  const addEvent = async (event: Omit<EventProps, "id" | "slug">) => {
    try {
      if (!user) {
        throw new Error("You must be logged in to add an event")
      }

      const slug = createSlug(event.title)

      // Create event in Firestore with the actual user ID
      const newEvent = await createFirestoreEvent({
        ...event,
        slug,
        userId: user.uid,
        bubbles: false,
        cancelBubble: false,
        cancelable: false,
        composed: false,
        currentTarget: null,
        defaultPrevented: false,
        eventPhase: 0,
        isTrusted: false,
        returnValue: false,
        srcElement: null,
        target: null,
        timeStamp: 0,
        type: "",
        composedPath: function (): EventTarget[] {
          throw new Error("Function not implemented.")
        },
        initEvent: function (type: string, bubbles?: boolean, cancelable?: boolean): void {
          throw new Error("Function not implemented.")
        },
        preventDefault: function (): void {
          throw new Error("Function not implemented.")
        },
        stopImmediatePropagation: function (): void {
          throw new Error("Function not implemented.")
        },
        stopPropagation: function (): void {
          throw new Error("Function not implemented.")
        },
        NONE: 0,
        CAPTURING_PHASE: 1,
        AT_TARGET: 2,
        BUBBLING_PHASE: 3
      })

      if (newEvent) {
        // Add to local state
        setEvents((prev) => [...prev, newEvent as unknown as EventProps])
        return newEvent as unknown as EventProps
      }
      return null
    } catch (err) {
      console.error("Error adding event:", err)
      setError("Failed to add event")
      return null
    }
  }

  // Update an existing event
  const updateEvent = async (id: string, updatedEvent: Partial<EventProps>) => {
    try {
      // If title is being updated, also update the slug
      const updateData: Partial<EventProps> = { ...updatedEvent }
      if (updatedEvent.title) {
        updateData.slug = createSlug(updatedEvent.title)
      }

      // Update in Firestore
      await updateFirestoreEvent(id, updateData)

      // Update local state
      setEvents((prev) => prev.map((event) => (event.id === id ? { ...event, ...updateData } : event)))

      // Get the updated event
      const updated = events.find((e) => e.id === id)
      return updated || null
    } catch (err) {
      console.error("Error updating event:", err)
      setError("Failed to update event")
      return null
    }
  }

  // Delete an event
  const deleteEvent = async (id: string) => {
    try {
      // Delete from Firestore
      await deleteFirestoreEvent(id)

      // Remove from local state
      setEvents((prev) => prev.filter((event) => event.id !== id))
      return true
    } catch (err) {
      console.error("Error deleting event:", err)
      setError("Failed to delete event")
      return false
    }
  }

  // Get an event by ID
  const getEventById = async (id: string) => {
    try {
      // First check local state
      const localEvent = events.find((event) => event.id === id)
      if (localEvent) return localEvent

      // If not found locally, fetch from Firestore
      const event = await getFirestoreEventById(id)
      return event as EventProps | null
    } catch (err) {
      console.error("Error getting event by ID:", err)
      setError("Failed to get event")
      return null
    }
  }

  // Get an event by slug
  const getEventBySlug = async (slug: string) => {
    try {
      // Check local state first
      const localEvent = events.find((event) => event.slug === slug)
      if (localEvent) return localEvent

      // If not found locally, fetch from Firestore
      const event = await getFirestoreEventBySlug(slug)
      if (event) return event as EventProps

      // If still not found, refresh events and try again
      await refreshEvents()
      return events.find((event) => event.slug === slug) || null
    } catch (err) {
      console.error("Error getting event by slug:", err)
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
        addEvent,
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

// Create a custom hook to use the context
export function useEvents() {
  const context = useContext(EventContext)
  if (context === undefined) {
    throw new Error("useEvents must be used within an EventProvider")
  }
  return context
}
