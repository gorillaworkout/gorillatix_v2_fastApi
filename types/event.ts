import { Timestamp } from "firebase/firestore";
import { StatusTicketProps } from "./tickets";

// Event types
export interface EventItem {
  id: string;
  address: string;
  category: string;
  createdAt: any; // Firestore timestamp, use proper type if using Firebase SDK types
  date: string;
  description: string;
  endSellingDate: string;
  holdTickets?: number;
  imageUrl: string;
  latitude: string;
  location: string;
  longitude: string;
  organizer: string;
  organizerDescription: string;
  price: number;
  slug: string;
  startSellingDate: string;
  status: "Active" | "upcoming" | "completed";
  stuckPending?: number;
  ticketsAvailable: number;
  ticketsSold: number;
  time: string;
  timeSelling: string;
  title: string;
  updatedAt: any; // same here
  userId?: string;
  venue: string;
}

export interface EventInput {
  slug: string
  title: string
  description: string
  date: string
  time: string
  location: string
  venue: string
  address: string
  imageUrl: string
  price: number
  category: string
  ticketsAvailable: number
  organizer: string
  organizerDescription: string
}

export interface Order {
  id: string
  userId: string
  eventId: string
  quantity: number
  totalPrice: number
  status: "pending" | "completed" | "cancelled"
  paymentId?: string
  createdAt: Timestamp
  updatedAt: Timestamp
}

export interface OrderInput {
  userId: string
  eventId: string
  quantity: number
  totalPrice: number
  status: "pending" | "completed" | "cancelled"
  paymentId?: string
}

export interface TicketProps {
  id?: string
  eventId: string
  userId: string
  quantity: number
  venue: string
  totalPrice: number
  purchaseDate: Timestamp
  status: StatusTicketProps
  eventName: string
  customerName: string
  orderId?: string
}

// export interface Ticket {
//   id?: string
//   eventId: string
//   userId: string
//   quantity: number
//   totalPrice: number
//   purchaseDate: Timestamp
//   status: "confirmed" | "cancelled" | "used"

// }

export interface EventInput {
  slug: string
  title: string
  description: string
  date: string
  time: string
  location: string
  venue: string
  address: string
  imageUrl: string
  price: number
  category: string
  ticketsAvailable: number
  organizer: string
  organizerDescription: string
}

// Order types
export interface Order {
  id: string
  userId: string
  eventId: string
  quantity: number
  totalPrice: number
  status: "pending" | "completed" | "cancelled"
  paymentId?: string
  createdAt: Timestamp
  updatedAt: Timestamp
}

export interface OrderInput {
  userId: string
  eventId: string
  quantity: number
  totalPrice: number
  status: "pending" | "completed" | "cancelled"
  paymentId?: string
}

// Types
export interface FirestoreEvent extends Omit<EventItem, "id"> {
  id?: string
  createdAt: Timestamp
  updatedAt: Timestamp
  userId: string
  slug: string
}
