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
  setDoc,
  increment,
} from "firebase/firestore";
import { db, auth } from "./firebase";
// import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage"

import {
  EventItem,
  FirestoreEvent,
  Order,
  OrderInput,
  TicketProps,
} from "@/types/event";
import { StatusTicketProps } from "@/types/tickets";

// Events Collection
const eventsCollection = collection(db, "events");
const ticketsCollection = collection(db, "tickets");

// Event Functions
export async function createEvent(
  eventData: Omit<FirestoreEvent, "id" | "createdAt" | "updatedAt">
) {
  try {
    // Get current user ID
    const userId = auth.currentUser?.uid;

    if (!userId) {
      throw new Error("User not authenticated");
    }

    const eventWithMetadata = {
      ...eventData,
      userId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const docRef = await addDoc(eventsCollection, eventWithMetadata);
    return { id: docRef.id, ...eventWithMetadata };
  } catch (error) {
    console.error("Error creating event:", error);
    throw error;
  }
}

export async function getEvents() {
  try {
    const querySnapshot = await getDocs(eventsCollection);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as EventItem[];
  } catch (error) {
    console.error("Error getting events:", error);
    throw error;
  }
}

export async function getEventById(id: string) {
  try {
    const docRef = doc(eventsCollection, id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as EventItem;
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error getting event:", error);
    throw error;
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

export async function updateEvent(
  id: string,
  eventData: Partial<FirestoreEvent>
) {
  try {
    const docRef = doc(eventsCollection, id);

    // Get the current event data to preserve userId
    const eventDoc = await getDoc(docRef);
    if (!eventDoc.exists()) {
      throw new Error("Event not found");
    }

    const currentData = eventDoc.data();

    const updateData = {
      ...eventData,
      // Preserve the original userId to maintain ownership
      userId: currentData.userId,
      updatedAt: serverTimestamp(),
    };

    await updateDoc(docRef, updateData);
    return { id, ...updateData };
  } catch (error) {
    console.error("Error updating event:", error);
    throw error;
  }
}

export async function deleteEvent(id: string) {
  try {
    const docRef = doc(eventsCollection, id);
    await deleteDoc(docRef);
    return true;
  } catch (error) {
    console.error("Error deleting event:", error);
    throw error;
  }
}

export async function getEventsByCategory(category: string) {
  try {
    const q = query(eventsCollection, where("category", "==", category));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as EventItem[];
  } catch (error) {
    console.error("Error getting events by category:", error);
    throw error;
  }
}

export async function searchEvents(searchTerm: string) {
  try {
    // Get all events (in a real app, you'd use a proper search solution like Algolia)
    const querySnapshot = await getDocs(eventsCollection);
    const events = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as EventItem[];

    // Filter events client-side
    const searchTermLower = searchTerm.toLowerCase();
    return events.filter(
      (event) =>
        event.title.toLowerCase().includes(searchTermLower) ||
        event.description.toLowerCase().includes(searchTermLower) ||
        event.location.toLowerCase().includes(searchTermLower)
    );
  } catch (error) {
    console.error("Error searching events:", error);
    throw error;
  }
}

// Ticket Functions
export async function purchaseTicket(
  eventId: string,
  quantity: number,
  price: number,
  userId: string,
  customerName: string,
  venue: string,
  status: StatusTicketProps,
  orderId: string
) {
  try {
    if (
      !eventId ||
      !userId ||
      price <= 0 ||
      (quantity <= 0 && status === "confirmed")
    ) {
      throw new Error("Invalid ticket purchase parameters");
    }

    return await runTransaction(db, async (transaction) => {
      const eventRef = doc(db, "events", eventId);
      const eventDoc = await transaction.get(eventRef);

      if (!eventDoc.exists()) throw new Error("Event not found");

      const eventData = eventDoc.data();

      const ticketData: Omit<TicketProps, "id"> = {
        eventId,
        userId,
        quantity,
        totalPrice: price,
        purchaseDate: Timestamp.now(),
        venue,
        status,
        eventName: eventData.title,
        customerName,
        orderId
      };

      // ✅ Jangan kurangi ticketsAvailable lagi
      const ticketSold = `${Number(eventData.ticketsSold) + quantity}`;

      transaction.update(eventRef, {
        ticketsSold: ticketSold,
        updatedAt: serverTimestamp(),
      });

      const ticketRef = doc(collection(db, "tickets"));
      transaction.set(ticketRef, ticketData);

      return { id: ticketRef.id, ...ticketData };
    });
  } catch (error) {
    console.error("Error purchasing ticket:", error);
    throw error;
  }
}

export async function getUserTickets(userId: string) {
  try {
    const q = query(
      ticketsCollection,
      where("userId", "==", userId),
      orderBy("purchaseDate", "desc")
    );

    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as TicketProps[];
  } catch (error) {
    console.error("Error getting user tickets:", error);
    throw error;
  }
}

export async function getTicketById(id: string) {
  try {
    const docRef = doc(ticketsCollection, id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as TicketProps;
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error getting ticket:", error);
    return null; // fallback to null instead of throwing
  }
}

// export async function updateTicketStatus(
//   id: string,
//   status: StatusTicketProps
// ) {
//   try {
//     const docRef = doc(ticketsCollection, id);
//     await updateDoc(docRef, { status });
//     return true;
//   } catch (error) {
//     console.error("Error updating ticket status:", error);
//     throw error;
//   }
// }

// Get upcoming events
export async function getUpcomingEvents(limitCount = 10) {
  const eventsCollection = collection(db, "events");
  const today = new Date().toISOString().split("T")[0]; // Format: YYYY-MM-DD

  const q = query(
    eventsCollection,
    where("date", ">=", today),
    orderBy("date", "asc"),
    limit(limitCount)
  );

  const querySnapshot = await getDocs(q);

  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as EventItem[];
}

// Create a new order
export async function createOrder(orderData: OrderInput) {
  const ordersCollection = collection(db, "orders");

  const newOrder = {
    ...orderData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  const docRef = await addDoc(ordersCollection, newOrder);
  return docRef.id;
}

// Get orders by user ID
export async function getOrdersByUserId(userId: string) {
  const ordersCollection = collection(db, "orders");
  const q = query(
    ordersCollection,
    where("userId", "==", userId),
    orderBy("createdAt", "desc")
  );

  const querySnapshot = await getDocs(q);

  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Order[];
}

// Update order status
export async function updateOrderStatus(
  id: string,
  status: "pending" | "completed" | "cancelled"
) {
  const orderDoc = doc(db, "orders", id);

  await updateDoc(orderDoc, {
    status,
    updatedAt: serverTimestamp(),
  });

  return id;
}


// import { doc, runTransaction } from "firebase/firestore";
// import { firestore } from "./firebaseClient"; // import instance Firestore kamu

// Fungsi untuk hold tiket (kurangi stok)
export async function reserveTickets(eventId: string, quantity: number) {
  const eventRef = doc(db, "events", eventId);
  await runTransaction(db, async (transaction) => {
    const eventDoc = await transaction.get(eventRef);
    if (!eventDoc.exists()) {
      throw new Error("Event not found");
    }

    const currentStock = eventDoc.data().ticketsAvailable;

    if (currentStock < quantity) {
      // Instead of a technical error, return a business-friendly message
      throw new Error("Tickets are sold out or currently being held by other users.");
    }

    transaction.update(eventRef, {
      ticketsAvailable: currentStock - quantity,
    });
  });
}

// Fungsi untuk rollback tiket (kembalikan stok)
export async function releaseTickets(eventId: string, quantity: number) {
  const eventRef = doc(db, "events", eventId);
  await runTransaction(db, async (transaction) => {
    const eventDoc = await transaction.get(eventRef);
    if (!eventDoc.exists()) throw new Error("Event not found");

    const currentStock = eventDoc.data().ticketsAvailable;

    transaction.update(eventRef, {
      ticketsAvailable: currentStock + quantity,
    });
  });
}
type TicketData = {
  eventId: string;
  quantity: number;
};
export async function releaseTicketsByOrderId(orderId: string) {
  // 1. Cari tiket berdasarkan field orderId
  const ticketsRef = collection(db, "tickets");
  const q = query(ticketsRef, where("orderId", "==", orderId));
  const querySnapshot = await getDocs(q);

  if (querySnapshot.empty) {
    throw new Error("Ticket not found for orderId: " + orderId);
  }

  const ticketSnap = querySnapshot.docs[0]; // ambil 1 dokumen saja
  const ticketData = ticketSnap.data() as TicketData;

  const { eventId, quantity } = ticketData;

  if (!eventId || typeof quantity !== "number") {
    throw new Error("Missing or invalid eventId or quantity in ticket data");
  }

  const eventRef = doc(db, "events", eventId);

  // 2. Jalankan transaksi untuk mengembalikan tiket
  await runTransaction(db, async (transaction) => {
    const eventSnap = await transaction.get(eventRef);
    if (!eventSnap.exists) {
      throw new Error("Event not found");
    }

    const eventData = eventSnap.data();
    const currentStock = eventData?.ticketsAvailable ?? 0;

    console.log(
      currentStock,
      "current ticketsAvailable — will add back",
      quantity
    );

    transaction.update(eventRef, {
      ticketsAvailable: currentStock + quantity,
    });
  });
}



// 🔧 helper: update ticket status
export async function updateTicketStatus(ticketId: string, status: string) {
  const ticketRef = doc(db, "tickets", ticketId);

  try {
    await updateDoc(ticketRef, { status });
  } catch (error) {
    console.error("Failed to update ticket status:", error);
    throw new Error("Unable to update ticket status");
  }
}

export async function createTicket(ticketData: {
  customerName: string;
  eventId: string;
  eventName: string;
  orderId: string;
  purchaseDate: Date;
  quantity: number;
  status: string;
  totalPrice: number;
  userId: string;
  venue: string;
}) {
  try {
    // 1. Simpan tiket ke koleksi "tickets"
    const ticketRef = doc(db, "tickets", ticketData.orderId);
    await setDoc(ticketRef, ticketData);

    // 2. Tambahkan quantity ke field ticketsSold di event terkait
    const eventRef = doc(db, "events", ticketData.eventId);
    await updateDoc(eventRef, {
      ticketsSold: increment(ticketData.quantity),
    });

    return true;
  } catch (error) {
    console.error("Error creating ticket and updating event:", error);
    throw error;
  }
}