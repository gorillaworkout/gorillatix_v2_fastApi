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
import { TicketViewerProps } from "@/types/tickets";
import html2canvas from "html2canvas";
import HiddenTicketDownload from "./hidden-ticket-download";

interface TicketViewProps {
  isOpen: boolean;
  onClose: () => void;
  ticket: TicketViewerProps;
  event: any;
}

export function TicketViewer({ isOpen, onClose, ticket, event }: TicketViewProps) {
  console.log(ticket, 'ticket viewer');
  // console.log(event, 'event ticket viewer')
  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Ticket Details</DialogTitle>
            <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
              <X className="h-4 w-4 text-muted-foreground" />
              <span className="sr-only text-muted-foreground">Close</span>
            </DialogClose>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-center">
              <h3 className="font-bold text-lg text-muted-foreground">
                {ticket.eventName}
              </h3>
              <div className="flex items-center justify-center text-sm text-muted-foreground mt-1">
                <Calendar className="mr-1 h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">
                  {event.date} at {event.time}
                </span>
                {/* <Clock className="ml-2 mr-1 h-4 w-4 text-muted-foreground" /> */}
                <span className="text-muted-foreground">{ticket.time}</span>
              </div>
              <div className="flex items-center justify-center text-sm text-muted-foreground mt-1">
                <MapPin className="mr-1 h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">{ticket.venue}</span>
              </div>
            </div>

            <div className="relative flex justify-center items-center h-[150px] w-full">
              <Image
                src={`/api/tickets/qr?id=${ticket.id}`}
                alt="Ticket QR Code"
                width={116}
                height={116}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                // onError={(e) => {
                //   e.currentTarget.src = `https://api.qrserver.com/v1/create-qr-code/?size=116x116&data=${ticket.id}`;
                // }}
              />
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="font-medium text-muted-foreground">Ticket ID</div>
                <div className="text-muted-foreground font-bold">{ticket.id}</div>
              </div>
              <div>
                <div className="font-medium text-muted-foreground">Status</div>
                <div className="text-muted-foreground font-bold capitalize">
                  {ticket.status}
                </div>
              </div>
              <div>
                <div className="font-medium text-muted-foreground">Quantity</div>
                <div className="flex items-center text-muted-foreground font-bold">
                  <Users className="mr-1 h-4 w-4" />
                  {ticket.quantity}{" "}
                  {ticket.quantity === 1 ? "ticket" : "tickets"}
                </div>
              </div>
              <div>
                <div className="font-medium text-muted-foreground">Total Price</div>
                <div className="text-muted-foreground font-bold">
                  {formatRupiah(ticket.totalPrice)}
                </div>
              </div>
            </div>

            <div className="flex justify-center ">
              <Button
                variant={"outline"}
                onClick={() => downloadTicket(ticket)}
              >
                Download Ticket
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      <HiddenTicketDownload ticket={ticket} event={event} />
    </>
  );
}

const downloadTicket = async (ticket: any) => {
  console.log("handleDownloadTicket, on profile my ticket");

  const ticketElement = document.getElementById(`ticket-download-${ticket.id}`);
  if (!ticketElement) return;

  const canvas = await html2canvas(ticketElement);
  const image = canvas.toDataURL("image/png");

  const a = document.createElement("a");
  console.log("download ticket as an image");
  a.href = image;
  a.download = `ticket-${ticket.id}.png`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
};
