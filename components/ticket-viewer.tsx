"use client";
import Image from "next/image";
import { Calendar, Clock, MapPin, Users, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { formatRupiah } from "@/lib/utils";

interface TicketViewerProps {
  isOpen: boolean;
  onClose: () => void;
  ticket: {
    id: string;
    eventName: string;
    date: string;
    time: string;
    location: string;
    quantity: number;
    totalPrice: number;
    status: string;
  };
}

export function TicketViewer({ isOpen, onClose, ticket }: TicketViewerProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Ticket Details</DialogTitle>
          <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
            <X className="h-4 w-4 text-background" />
            <span className="sr-only text-background">Close</span>
          </DialogClose>
        </DialogHeader>
        <div className="space-y-4">
          <div className="text-center">
            <h3 className="font-bold text-lg text-background">{ticket.eventName}</h3>
            <div className="flex items-center justify-center text-sm text-muted-foreground mt-1">
              <Calendar className="mr-1 h-4 w-4 text-background" />
              <span className="text-background">{new Date(ticket.date).toLocaleDateString()}</span>
              <Clock className="ml-2 mr-1 h-4 w-4 text-background" />
              <span className="text-background">{ticket.time}</span>
            </div>
            <div className="flex items-center justify-center text-sm text-muted-foreground mt-1">
              <MapPin className="mr-1 h-4 w-4 text-background" />
              <span className="text-background">{ticket.location}</span>
            </div>
          </div>

          <div className="relative flex justify-center items-center h-[150px] w-full">
            <Image
              src={`/api/tickets/qr?id=${ticket.id}`}
              alt="Ticket QR Code"
              width={116}
              height={116}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
              onError={(e) => {
                e.currentTarget.src = `https://api.qrserver.com/v1/create-qr-code/?size=116x116&data=${ticket.id}`;
              }}
            />
          </div>

          <Separator />

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="font-medium text-background">Ticket ID</div>
              <div className="text-background font-bold">{ticket.id}</div>
            </div>
            <div>
              <div className="font-medium text-background">Status</div>
              <div className="text-background font-bold capitalize">
                {ticket.status}
              </div>
            </div>
            <div>
              <div className="font-medium text-background">Quantity</div>
              <div className="flex items-center text-background font-bold">
                <Users className="mr-1 h-4 w-4" />
                {ticket.quantity} {ticket.quantity === 1 ? "ticket" : "tickets"}
              </div>
            </div>
            <div>
              <div className="font-medium text-background">Total Price</div>
              <div className="text-background font-bold">
                {formatRupiah(ticket.totalPrice)}
              </div>
            </div>
          </div>

          <div className="flex justify-center ">
            <Button variant={"outline"} onClick={() => downloadTicket(ticket)}>
              Download Ticket
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
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
  `;

  const blob = new Blob([ticketData], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${ticket.id}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
