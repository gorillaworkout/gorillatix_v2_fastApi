import { Timestamp } from "firebase/firestore";

// Event types
export interface EventItem {
  id: string;
  slug: string;
  title: string;
  date: string;
  time: string;
  location: string;
  venue: string;
  address: string;
  category: string;
  description: string;
  imageUrl: string;
  price: number;
  ticketsAvailable: number;
  organizer: string;
  organizerDescription: string;
  createdAt: any; // Firestore timestamp, use proper type if using Firebase SDK types
  updatedAt: any; // same here
  userId?: string;
  status: "Active" | "upcoming" | "completed";
  ticketsSold: number;
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
  totalPrice: number
  purchaseDate: Timestamp
  status: "confirmed" | "cancelled" | "used"
}
// Define the event type
// export interface EventItem {
//   id: string
//   slug: string
//   title: string
//   description: string
//   date: string
//   time: string
//   location: string
//   venue: string
//   address: string
//   city?: string
//   imageUrl: string
//   price: number
//   category: string
//   ticketsAvailable: number
//   ticketsSold: number
//   organizer: string
//   organizerDescription?: string
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
