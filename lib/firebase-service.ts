import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp,
  limit,
  runTransaction,
} from "firebase/firestore"
import { db, auth } from "./firebase"
// import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage"

import { EventItem, FirestoreEvent, Order, OrderInput, TicketProps } from "@/types/event"


// Events Collection
const eventsCollection = collection(db, "events")
const ticketsCollection = collection(db, "tickets")

// Event Functions
export async function createEvent(eventData: Omit<FirestoreEvent, "id" | "createdAt" | "updatedAt">) {
  try {
    // Get current user ID
    const userId = auth.currentUser?.uid

    if (!userId) {
      throw new Error("User not authenticated")
    }

    const eventWithMetadata = {
      ...eventData,
      userId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }

    const docRef = await addDoc(eventsCollection, eventWithMetadata)
    return { id: docRef.id, ...eventWithMetadata }
  } catch (error) {
    console.error("Error creating event:", error)
    throw error
  }
}

export async function getEvents() {
  try {
    const querySnapshot = await getDocs(eventsCollection)
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as EventItem[]
  } catch (error) {
    console.error("Error getting events:", error)
    throw error
  }
}

export async function getEventById(id: string) {
  try {
    const docRef = doc(eventsCollection, id)
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as EventItem
    } else {
      return null
    }
  } catch (error) {
    console.error("Error getting event:", error)
    throw error
  }
}

// export async function getEventBySlug(slug: string) {
//   try {
//     const q = query(eventsCollection, where("slug", "==", slug), limit(1))
//     const querySnapshot = await getDocs(q)

//     if (!querySnapshot.empty) {
//       const doc = querySnapshot.docs[0]
//       return { id: doc.id, ...doc.data() } as EventItem
//     } else {
//       return null
//     }
//   } catch (error) {
//     console.error("Error getting event by slug:", error)
//     throw error
//   }
// }
export async function getEventBySlug(slug: string) {
  const q = query(collection(db, "events"), where("slug", "==", slug));
  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    return null;
  }

  const doc = snapshot.docs[0];
  return {
    id: doc.id,
    ...doc.data(),
  } as EventItem;
}

export async function updateEvent(id: string, eventData: Partial<FirestoreEvent>) {
  try {
    const docRef = doc(eventsCollection, id)

    // Get the current event data to preserve userId
    const eventDoc = await getDoc(docRef)
    if (!eventDoc.exists()) {
      throw new Error("Event not found")
    }

    const currentData = eventDoc.data()

    const updateData = {
      ...eventData,
      // Preserve the original userId to maintain ownership
      userId: currentData.userId,
      updatedAt: serverTimestamp(),
    }

    await updateDoc(docRef, updateData)
    return { id, ...updateData }
  } catch (error) {
    console.error("Error updating event:", error)
    throw error
  }
}

export async function deleteEvent(id: string) {
  try {
    const docRef = doc(eventsCollection, id)
    await deleteDoc(docRef)
    return true
  } catch (error) {
    console.error("Error deleting event:", error)
    throw error
  }
}

export async function getEventsByCategory(category: string) {
  try {
    const q = query(eventsCollection, where("category", "==", category))
    const querySnapshot = await getDocs(q)

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as EventItem[]
  } catch (error) {
    console.error("Error getting events by category:", error)
    throw error
  }
}

export async function searchEvents(searchTerm: string) {
  try {
    // Get all events (in a real app, you'd use a proper search solution like Algolia)
    const querySnapshot = await getDocs(eventsCollection)
    const events = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as EventItem[]

    // Filter events client-side
    const searchTermLower = searchTerm.toLowerCase()
    return events.filter(
      (event) =>
        event.title.toLowerCase().includes(searchTermLower) ||
        event.description.toLowerCase().includes(searchTermLower) ||
        event.location.toLowerCase().includes(searchTermLower),
    )
  } catch (error) {
    console.error("Error searching events:", error)
    throw error
  }
}

// Ticket Functions
export async function purchaseTicket(eventId: string, quantity: number, price: number, userId: string, customerName: string) {
  try {
    // Validate inputs
    if (!eventId || !userId || quantity <= 0 || price <= 0) {
      console.error("Invalid ticket purchase parameters:", { eventId, userId, quantity, price })
      throw new Error("Invalid ticket purchase parameters")
    }

    console.log("Creating ticket with userId:", userId)

    // Use a transaction to ensure consistency
    return await runTransaction(db, async (transaction) => {
      // Get the event
      const eventRef = doc(db, "events", eventId)
      const eventDoc = await transaction.get(eventRef)

      if (!eventDoc.exists()) {
        throw new Error("Event not found")
      }

      const eventData = eventDoc.data()

      // Check if enough tickets are available
      if (eventData.ticketsAvailable < quantity) {
        throw new Error(`Not enough tickets available. Only ${eventData.ticketsAvailable} left.`)
      }

      // Create the ticket
      const ticketData: Omit<TicketProps, "id"> = {
        eventId,
        userId,
        quantity,
        totalPrice: price * quantity,
        purchaseDate: Timestamp.now(),
        status: "confirmed",
        eventName: eventData.title,
        customerName: customerName
      }

      // Update the event's available tickets
      const newTicketsAvailable = Math.max(0, eventData.ticketsAvailable - quantity)
      let ticketSold = `${Number(eventData.ticketsSold) + quantity}`
      console.log(ticketSold, 'ticket sold', Number(eventData.ticketsSold),'=>', quantity);
      transaction.update(eventRef, {
        ticketsAvailable: newTicketsAvailable,
        updatedAt: serverTimestamp(),
        ticketsSold: `${ticketSold}`,
      })

      // Add the ticket
      const ticketRef = doc(collection(db, "tickets"))
      transaction.set(ticketRef, ticketData)

      console.log("Ticket created with ID:", ticketRef.id)

      // Return the ticket with its ID
      return {
        id: ticketRef.id,
        ...ticketData,
      }
    })
  } catch (error) {
    console.error("Error purchasing ticket:", error)
    throw error
  }
}

export async function getUserTickets(userId: string) {
  try {
    const q = query(ticketsCollection, where("userId", "==", userId), orderBy("purchaseDate", "desc"))

    const querySnapshot = await getDocs(q)

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as TicketProps[]
  } catch (error) {
    console.error("Error getting user tickets:", error)
    throw error
  }
}

export async function getTicketById(id: string) {
  try {
    const docRef = doc(ticketsCollection, id)
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as TicketProps
    } else {
      return null
    }
  } catch (error) {
    console.error("Error getting ticket:", error)
    return null // fallback to null instead of throwing
  }
}

export async function updateTicketStatus(id: string, status: "confirmed" | "cancelled" | "used") {
  try {
    const docRef = doc(ticketsCollection, id)
    await updateDoc(docRef, { status })
    return true
  } catch (error) {
    console.error("Error updating ticket status:", error)
    throw error
  }
}

// Get upcoming events
export async function getUpcomingEvents(limitCount = 10) {
  const eventsCollection = collection(db, "events")
  const today = new Date().toISOString().split("T")[0] // Format: YYYY-MM-DD

  const q = query(eventsCollection, where("date", ">=", today), orderBy("date", "asc"), limit(limitCount))

  const querySnapshot = await getDocs(q)

  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as EventItem[]
}

// Create a new order
export async function createOrder(orderData: OrderInput) {
  const ordersCollection = collection(db, "orders")

  const newOrder = {
    ...orderData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  }

  const docRef = await addDoc(ordersCollection, newOrder)
  return docRef.id
}



// Get orders by user ID
export async function getOrdersByUserId(userId: string) {
  const ordersCollection = collection(db, "orders")
  const q = query(ordersCollection, where("userId", "==", userId), orderBy("createdAt", "desc"))

  const querySnapshot = await getDocs(q)

  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Order[]
}

// Update order status
export async function updateOrderStatus(id: string, status: "pending" | "completed" | "cancelled") {
  const orderDoc = doc(db, "orders", id)

  await updateDoc(orderDoc, {
    status,
    updatedAt: serverTimestamp(),
  })

  return id
}
