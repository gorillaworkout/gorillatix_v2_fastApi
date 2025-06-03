"use client"
import Image from "next/image"
import { Calendar, Clock, MapPin, Users, X } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { formatRupiah } from "@/lib/utils"

interface TicketViewerProps {
  isOpen: boolean
  onClose: () => void
  ticket: {
    id: string
    eventName: string
    date: string
    time: string
    location: string
    quantity: number
    totalPrice: number
    status: string
  }
}

export function TicketViewer({ isOpen, onClose, ticket }: TicketViewerProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Ticket Details</DialogTitle>
          <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </DialogClose>
        </DialogHeader>
        <div className="space-y-4">
          <div className="text-center">
            <h3 className="font-bold text-lg">{ticket.eventName}</h3>
            <div className="flex items-center justify-center text-sm text-muted-foreground mt-1">
              <Calendar className="mr-1 h-4 w-4" />
              <span>{new Date(ticket.date).toLocaleDateString()}</span>
              <Clock className="ml-2 mr-1 h-4 w-4" />
              <span>{ticket.time}</span>
            </div>
            <div className="flex items-center justify-center text-sm text-muted-foreground mt-1">
              <MapPin className="mr-1 h-4 w-4" />
              <span>{ticket.location}</span>
            </div>
          </div>

          <div className="relative mx-auto h-64 w-64">
            <Image
              src={`/api/tickets/qr?id=${ticket.id}`}
              alt="Ticket QR Code"
              fill
              className="object-contain"
              // Fallback to a generated QR code for demo
              onError={(e) => {
                e.currentTarget.src = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=TICKET-${ticket.id}`
              }}
            />
          </div>

          <Separator />

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="font-medium">Ticket ID</div>
              <div className="text-muted-foreground">{ticket.id}</div>
            </div>
            <div>
              <div className="font-medium">Status</div>
              <div className="text-muted-foreground capitalize">{ticket.status}</div>
            </div>
            <div>
              <div className="font-medium">Quantity</div>
              <div className="flex items-center text-muted-foreground">
                <Users className="mr-1 h-4 w-4" />
                {ticket.quantity} {ticket.quantity === 1 ? "ticket" : "tickets"}
              </div>
            </div>
            <div>
              <div className="font-medium">Total Price</div>
              <div className="text-muted-foreground">{formatRupiah(ticket.totalPrice)}</div>
            </div>
          </div>

          <div className="flex justify-center">
            <Button onClick={() => downloadTicket(ticket)}>Download Ticket</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Function to download ticket as PDF (simulated)
function downloadTicket(ticket: any) {
  // In a real app, this would generate a PDF using a library like jsPDF
  // For demo purposes, we'll just create a text file
  const ticketData = `
    TICKET: ${ticket.eventName}
    DATE: ${new Date(ticket.date).toLocaleDateString()}
    TIME: ${ticket.time}
    LOCATION: ${ticket.location}
    QUANTITY: ${ticket.quantity}
    TOTAL PRICE: ${formatRupiah(ticket.totalPrice)}
    TICKET ID: ${ticket.id}
    STATUS: ${ticket.status}
  `

  const blob = new Blob([ticketData], { type: "text/plain" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `ticket-${ticket.id}.txt`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
