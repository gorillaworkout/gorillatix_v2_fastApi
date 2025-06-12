"use server"

import { purchaseTicket } from "@/lib/firebase-service"
export async function processTicketPurchase(formData: FormData) {
  try {
    const eventId = formData.get("eventId") as string
    const quantity = Number.parseInt(formData.get("quantity") as string)
    const price = Number.parseFloat(formData.get("price") as string)
    const userId = formData.get("userId") as string
    const customerName = formData.get("customerName") as string
    const venue = formData.get("venue") as string
    const status = formData.get("status") as "confirmed" | "cancelled" | "used"
    console.log("Processing ticket purchase:", { eventId, quantity, price, userId })

    if (!eventId || isNaN(quantity) || isNaN(price)) {
      console.error("Invalid form data:", { eventId, quantity, price })
      return {
        success: false,
        message: "Invalid form data",
      }
    }

    if (!userId) {
      console.error("User not authenticated")
      return {
        success: false,
        message: "User not authenticated. Please log in and try again.",
      }
    }

    // In a real app, you'd process payment here

    // Purchase ticket
    console.log("Purchasing ticket with userId:", userId)
    const ticket = await purchaseTicket(eventId, quantity, price, userId, customerName, venue, status)

    if (ticket) {
      console.log("Ticket purchased successfully:", ticket)
      return {
        success: true,
        message: "Ticket purchased successfully",
        ticketId: ticket.id,
      }
    } else {
      console.error("Failed to purchase ticket - no ticket returned")
      return {
        success: false,
        message: "Failed to purchase ticket",
      }
    }
  } catch (error) {
    console.error("Error processing ticket purchase:", error)
    return {
      success: false,
      message: error instanceof Error ? error.message : "An error occurred while processing your purchase",
    }
  }
}