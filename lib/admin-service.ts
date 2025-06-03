import { collection, query, where, orderBy, getDocs, Timestamp, getDoc, doc, limit } from "firebase/firestore"
import { db } from "./firebase"

// Types
export interface SalesData {
  month: string
  total: number
}

export interface RecentSale {
  id: string
  userId: string
  userName: string
  userAvatar: string
  eventName: string
  quantity: number
  totalPrice: number
  date: Timestamp
}

// Get monthly sales data for the current year
export async function getMonthlySalesData(): Promise<SalesData[]> {
  try {
    const ticketsCollection = collection(db, "tickets")
    const currentYear = new Date().getFullYear()
    const startOfYear = new Date(currentYear, 0, 1)
    const endOfYear = new Date(currentYear, 11, 31, 23, 59, 59)

    const q = query(
      ticketsCollection,
      where("purchaseDate", ">=", Timestamp.fromDate(startOfYear)),
      where("purchaseDate", "<=", Timestamp.fromDate(endOfYear)),
      orderBy("purchaseDate", "asc"),
    )

    const querySnapshot = await getDocs(q)

    // Initialize monthly data
    const monthlyData: Record<string, number> = {
      Jan: 0,
      Feb: 0,
      Mar: 0,
      Apr: 0,
      May: 0,
      Jun: 0,
      Jul: 0,
      Aug: 0,
      Sep: 0,
      Oct: 0,
      Nov: 0,
      Dec: 0,
    }

    // Aggregate sales by month
    querySnapshot.forEach((doc) => {
      const data = doc.data()
      const date = data.purchaseDate.toDate()
      const month = date.toLocaleString("en-US", { month: "short" })
      monthlyData[month] += data.totalPrice || 0
    })

    // Convert to array format for chart
    return Object.entries(monthlyData).map(([month, total]) => ({
      month,
      total,
    }))
  } catch (error) {
    console.error("Error getting monthly sales data:", error)
    return []
  }
}

// Get recent sales with user details
export async function getRecentSales(limitCount = 5): Promise<RecentSale[]> {
  try {
    const ticketsCollection = collection(db, "tickets")
    const q = query(ticketsCollection, orderBy("purchaseDate", "desc"), limit(limitCount))

    const querySnapshot = await getDocs(q)
    const sales: RecentSale[] = []

    for (const ticketDoc of querySnapshot.docs) {
      const ticketData = ticketDoc.data()

      // Get user details
      const userDoc = await getDoc(doc(db, "users", ticketData.userId))
      const userData = userDoc.exists() ? userDoc.data() : null

      // Get event details
      const eventDoc = await getDoc(doc(db, "events", ticketData.eventId))
      const eventData = eventDoc.exists() ? eventDoc.data() : null

      sales.push({
        id: ticketDoc.id,
        userId: ticketData.userId,
        userName: userData?.displayName || "Anonymous User",
        userAvatar: userData?.photoURL || "/placeholder.svg?height=36&width=36",
        eventName: eventData?.title || "Unknown Event",
        quantity: ticketData.quantity || 1,
        totalPrice: ticketData.totalPrice || 0,
        date: ticketData.purchaseDate,
      })
    }

    return sales
  } catch (error) {
    console.error("Error getting recent sales:", error)
    return []
  }
}

// Get total revenue
export async function getTotalRevenue(): Promise<{ total: number; percentChange: number }> {
  try {
    const ticketsCollection = collection(db, "tickets")

    // Get current month data
    const currentDate = new Date()
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
    const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0, 23, 59, 59)

    const currentMonthQuery = query(
      ticketsCollection,
      where("purchaseDate", ">=", Timestamp.fromDate(startOfMonth)),
      where("purchaseDate", "<=", Timestamp.fromDate(endOfMonth)),
    )

    // Get previous month data
    const startOfPrevMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
    const endOfPrevMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0, 23, 59, 59)

    const prevMonthQuery = query(
      ticketsCollection,
      where("purchaseDate", ">=", Timestamp.fromDate(startOfPrevMonth)),
      where("purchaseDate", "<=", Timestamp.fromDate(endOfPrevMonth)),
    )

    // Execute queries
    const [currentMonthSnapshot, prevMonthSnapshot] = await Promise.all([
      getDocs(currentMonthQuery),
      getDocs(prevMonthQuery),
    ])

    // Calculate totals
    let currentMonthTotal = 0
    let prevMonthTotal = 0

    currentMonthSnapshot.forEach((doc) => {
      currentMonthTotal += doc.data().totalPrice || 0
    })

    prevMonthSnapshot.forEach((doc) => {
      prevMonthTotal += doc.data().totalPrice || 0
    })

    // Calculate percentage change
    const percentChange =
      prevMonthTotal === 0
        ? 100 // If previous month was 0, consider it 100% increase
        : ((currentMonthTotal - prevMonthTotal) / prevMonthTotal) * 100

    // Get all-time total
    const allTicketsQuery = query(ticketsCollection)
    const allTicketsSnapshot = await getDocs(allTicketsQuery)

    let totalRevenue = 0
    allTicketsSnapshot.forEach((doc) => {
      totalRevenue += doc.data().totalPrice || 0
    })

    return {
      total: totalRevenue,
      percentChange,
    }
  } catch (error) {
    console.error("Error getting total revenue:", error)
    return { total: 0, percentChange: 0 }
  }
}

// Get total tickets sold
export async function getTicketsSold(): Promise<{ total: number; percentChange: number }> {
  try {
    const ticketsCollection = collection(db, "tickets")

    // Get current month data
    const currentDate = new Date()
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
    const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0, 23, 59, 59)

    const currentMonthQuery = query(
      ticketsCollection,
      where("purchaseDate", ">=", Timestamp.fromDate(startOfMonth)),
      where("purchaseDate", "<=", Timestamp.fromDate(endOfMonth)),
    )

    // Get previous month data
    const startOfPrevMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
    const endOfPrevMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0, 23, 59, 59)

    const prevMonthQuery = query(
      ticketsCollection,
      where("purchaseDate", ">=", Timestamp.fromDate(startOfPrevMonth)),
      where("purchaseDate", "<=", Timestamp.fromDate(endOfPrevMonth)),
    )

    // Execute queries
    const [currentMonthSnapshot, prevMonthSnapshot, allTicketsSnapshot] = await Promise.all([
      getDocs(currentMonthQuery),
      getDocs(prevMonthQuery),
      getDocs(query(ticketsCollection)),
    ])

    // Calculate totals
    let currentMonthTotal = 0
    let prevMonthTotal = 0
    let totalTickets = 0

    currentMonthSnapshot.forEach((doc) => {
      currentMonthTotal += doc.data().quantity || 0
    })

    prevMonthSnapshot.forEach((doc) => {
      prevMonthTotal += doc.data().quantity || 0
    })

    allTicketsSnapshot.forEach((doc) => {
      totalTickets += doc.data().quantity || 0
    })

    // Calculate percentage change
    const percentChange =
      prevMonthTotal === 0
        ? 100 // If previous month was 0, consider it 100% increase
        : ((currentMonthTotal - prevMonthTotal) / prevMonthTotal) * 100

    return {
      total: totalTickets,
      percentChange,
    }
  } catch (error) {
    console.error("Error getting tickets sold:", error)
    return { total: 0, percentChange: 0 }
  }
}

// Get active events count
export async function getActiveEventsCount(): Promise<{ total: number; newThisWeek: number }> {
  try {
    const eventsCollection = collection(db, "events")

    // Get current date
    const currentDate = new Date()
    const today = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate())

    // Get active events (events with future dates)
    const activeEventsQuery = query(eventsCollection, where("date", ">=", today.toISOString().split("T")[0]))

    // Get events created in the last week
    const oneWeekAgo = new Date(currentDate.getTime() - 7 * 24 * 60 * 60 * 1000)
    const newEventsQuery = query(eventsCollection, where("createdAt", ">=", Timestamp.fromDate(oneWeekAgo)))

    // Execute queries
    const [activeEventsSnapshot, newEventsSnapshot] = await Promise.all([
      getDocs(activeEventsQuery),
      getDocs(newEventsQuery),
    ])

    return {
      total: activeEventsSnapshot.size,
      newThisWeek: newEventsSnapshot.size,
    }
  } catch (error) {
    console.error("Error getting active events count:", error)
    return { total: 0, newThisWeek: 0 }
  }
}

// Get total users count
export async function getUsersCount(): Promise<{ total: number; newThisWeek: number }> {
  try {
    const usersCollection = collection(db, "users")

    // Get all users
    const allUsersSnapshot = await getDocs(usersCollection)

    // Get users created in the last week
    const currentDate = new Date()
    const oneWeekAgo = new Date(currentDate.getTime() - 7 * 24 * 60 * 60 * 1000)

    const newUsersQuery = query(usersCollection, where("createdAt", ">=", Timestamp.fromDate(oneWeekAgo)))

    const newUsersSnapshot = await getDocs(newUsersQuery)

    return {
      total: allUsersSnapshot.size,
      newThisWeek: newUsersSnapshot.size,
    }
  } catch (error) {
    console.error("Error getting users count:", error)
    return { total: 0, newThisWeek: 0 }
  }
}
