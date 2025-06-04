"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { CheckCircle, Loader2, Ticket } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { getTicketById } from "@/lib/firebase-service"
import { useAuth } from "@/components/auth-provider"
import { formatRupiah } from "@/lib/utils"

export default function PaymentSuccessPage() {
  const [loading, setLoading] = useState(true)
  const [ticket, setTicket] = useState<any>(null)
  const [event, setEvent] = useState<any>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const ticketId = searchParams.get("ticketId")
  const { user } = useAuth()

  useEffect(() => {
    async function loadTicket() {
      if (!ticketId) {
        router.push("/events")
        return
      }

      try {
        const ticketData = await getTicketById(ticketId)
        if (ticketData) {
          setTicket(ticketData)

          // Get event details
          const { getEventById } = await import("@/lib/firebase-service")
          const eventData = await getEventById(ticketData.eventId)
          if (eventData) {
            setEvent(eventData)
          }
        } else {
          router.push("/events")
        }
      } catch (error) {
        console.error("Error loading ticket:", error)
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      loadTicket()
    }
  }, [ticketId, router, user])

  if (loading) {
    return (
      <div className="container flex h-[50vh] items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p>Loading your ticket...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container flex flex-col items-center justify-center py-12">
      <div className="mb-8 text-center">
        <div className="flex justify-center mb-4">
          <CheckCircle className="h-16 w-16 text-green-500" />
        </div>
        <h1 className="text-3xl font-bold mb-2">Payment Successful!</h1>
        <p className="text-muted-foreground">Your ticket has been confirmed and sent to your email.</p>
      </div>

      {ticket && event && (
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Ticket Details</CardTitle>
            <CardDescription>Keep this information for your records</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-medium">Event</h3>
              <p>{event.title}</p>
            </div>
            <div>
              <h3 className="font-medium">Date & Time</h3>
              <p>
                {event.date} at {event.time}
              </p>
            </div>
            <div>
              <h3 className="font-medium">Location</h3>
              <p>{event.location}</p>
            </div>
            <div>
              <h3 className="font-medium">Quantity</h3>
              <p>
                {ticket.quantity} {ticket.quantity === 1 ? "ticket" : "tickets"}
              </p>
            </div>
            <div>
              <h3 className="font-medium">Total Price</h3>
              <p>{formatRupiah(ticket.totalPrice)}</p>
            </div>
            <div>
              <h3 className="font-medium">Ticket ID</h3>
              <p className="font-mono text-sm">{ticket.id}</p>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button className="w-full" asChild>
              <Link href="/orders">
                <Ticket className="mr-2 h-4 w-4" />
                View My Tickets
              </Link>
            </Button>
            <Button variant="outline" className="w-full" asChild>
              <Link href="/events">Browse More Events</Link>
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  )
}
