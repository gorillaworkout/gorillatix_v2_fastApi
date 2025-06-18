"use client";

import Link from "next/link";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Loader2,
  Calendar,
  Ticket,
  Download,
  ExternalLink,
  AlertTriangle,
  MapPin,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { TicketViewer } from "@/components/ticket-viewer";
import { useAuth } from "@/components/auth-provider";
import { getUserTickets, getEventById } from "@/lib/firebase-service";
import { formatRupiah } from "@/lib/utils";
import { TicketViewerProps } from "@/types/tickets";
import html2canvas from "html2canvas";
import HiddenTicketDownload from "@/components/hidden-ticket-download";
export default function OrdersPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [tickets, setTickets] = useState<any[]>([]);
  const [ticketsLoading, setTicketsLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] =
    useState<TicketViewerProps | null>(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isTicketViewerOpen, setIsTicketViewerOpen] = useState(false);
  const [ticketEvents, setTicketEvents] = useState<Record<string, any>>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // If authentication is complete and user is not logged in, redirect to login
    if (!loading && !user) {
      router.push("/login?redirect=/orders");
      return;
    }

    async function loadTickets() {
      if (!user) return;

      try {
        setTicketsLoading(true);
        setError(null);

        // Create the Firestore index if it doesn't exist
        // This is needed for the query: where userId == X order by purchaseDate desc
        try {
          const userTickets = await getUserTickets(user.uid);
          // Sort tickets by purchase date (newest first)
          const sortedTickets = [...userTickets].sort((a, b) => {
            return b.purchaseDate.toMillis() - a.purchaseDate.toMillis();
          });

          setTickets(sortedTickets);

          // Load event details for each ticket
          const events: Record<string, any> = {};
          for (const ticket of sortedTickets) {
            if (!events[ticket.eventId]) {
              const event = await getEventById(ticket.eventId);
              if (event) {
                events[ticket.eventId] = event;
              }
            }
          }
          setTicketEvents(events);
        } catch (err: any) {
          // console.error("Error loading tickets:", err);

          // Check if it's an index error
          if (err.message && err.message.includes("index")) {
            setError(
              "The database index is being created. Please try again in a few minutes."
            );
          } else {
            setError("Failed to load your tickets. Please try again later.");
          }

          setTickets([]);
        }
      } finally {
        setTicketsLoading(false);
      }
    }

    if (user) {
      loadTickets();
    }
  }, [loading, user, router]);

  const handleViewTicket = (ticket: {
    eventId: string | number;
    id: any;
    quantity: any;
    totalPrice: any;
    status: any;
  }) => {
    // Prepare ticket with event details for the viewer
    const event = ticketEvents[ticket.eventId];
    if (event) {
      const viewerTicket = {
        id: ticket.id,
        eventName: event.title,
        date: event.date,
        time: event.time,
        location: event.location,
        venue: event.venue,
        quantity: ticket.quantity,
        totalPrice: ticket.totalPrice,
        status: ticket.status,
        customerName: event.customerName,
      };
      setSelectedTicket(viewerTicket);
      setSelectedEvent(event);
      setIsTicketViewerOpen(true);
    }
  };
  // Separate tickets into upcoming and past
  const handleDownloadTicket = async (ticket: {
    eventId: string | number;
    quantity: any;
    totalPrice: number;
    id: any;
    status: any;
  }) => {
    const event = ticketEvents[ticket.eventId];
    if (!event) return;
    const ticketElement = document.getElementById(
      `ticket-download-${ticket.id}`
    );
    if (!ticketElement) return;

    const canvas = await html2canvas(ticketElement);
    const image = canvas.toDataURL("image/png");

    const a = document.createElement("a");
    a.href = image;
    a.download = `ticket-${ticket.id}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };
  const today = new Date();
  const upcomingTickets = tickets.filter((ticket) => {
    const event = ticketEvents[ticket.eventId];
    if (!event) return false;
    const eventDate = new Date(event.date);
    return eventDate >= today;
  });
  const pastTickets = tickets.filter((ticket) => {
    const event = ticketEvents[ticket.eventId];
    if (!event) return false;
    const eventDate = new Date(event.date);
    return eventDate < today;
  });

  if (loading || ticketsLoading) {
    return (
      <div className="container flex h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p>Loading your tickets...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-10">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-3xl font-bold mb-6">My Tickets</h1>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="upcoming" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="upcoming">Upcoming Events</TabsTrigger>
            <TabsTrigger value="past">Past Events</TabsTrigger>
          </TabsList>
          <TabsContent value="upcoming">
            {upcomingTickets.length > 0 ? (
              <div className="space-y-6">
                {upcomingTickets.map((ticket) => {
                  const event = ticketEvents[ticket.eventId];
                  if (!event) return null;

                  return (
                    <Card key={ticket.id}>
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle>{event.title}</CardTitle>
                            <CardDescription className="mt-2">
                              <div className="flex items-center">
                                <Calendar className="mr-1 h-4 w-4" />
                                {event.date} at {event.time}
                              </div>
                              <div className="mt-2 flex flex-row">
                                {" "}
                                <MapPin className="mr-1 h-4 w-4 text-white" />
                                {event.venue}
                              </div>
                            </CardDescription>
                          </div>
                          <Badge>{ticket.status}</Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid gap-4 md:grid-cols-2">
                          <div>
                            <div className="text-sm font-medium">
                              Order Details
                            </div>
                            <div className="mt-1 text-sm text-muted-foreground">
                              <div>Order #: {ticket.id}</div>
                              <div>
                                {ticket.quantity}{" "}
                                {ticket.quantity === 1 ? "ticket" : "tickets"}
                              </div>
                              <div>
                                Total: {formatRupiah(ticket.totalPrice)}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDownloadTicket(ticket)}
                            >
                              <Download className="mr-2 h-4 w-4" />
                              Download
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleViewTicket(ticket)}
                            >
                              <Ticket className="mr-2 h-4 w-4" />
                              View Tickets
                            </Button>
                          </div>
                        </div>
                        <HiddenTicketDownload ticket={ticket} event={event} />
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <Ticket className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-xl font-medium mb-2">
                  No upcoming tickets
                </h3>
                <p className="text-muted-foreground mb-6">
                  You don't have any upcoming event tickets
                </p>
                <Button asChild>
                  <Link href="/events">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Browse Events
                  </Link>
                </Button>
              </div>
            )}
          </TabsContent>
          <TabsContent value="past">
            {pastTickets.length > 0 ? (
              <div className="space-y-6">
                {pastTickets.map((ticket) => {
                  const eventItem = ticketEvents[ticket.eventId];
                  if (!eventItem) return null;

                  return (
                    <Card key={ticket.id}>
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle>{eventItem.title}</CardTitle>
                            <CardDescription className="mt-2">
                              <div className="flex items-center">
                                <Calendar className="mr-1 h-4 w-4" />
                                {eventItem.date} at {eventItem.time}
                              </div>
                              <div className="mt-2 flex flex-row">
                                {" "}
                                <MapPin className="mr-1 h-4 w-4 text-white" />
                                {eventItem.venue}
                              </div>
                            </CardDescription>
                          </div>
                          <Badge variant="outline">{ticket.status}</Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid gap-4 md:grid-cols-2">
                          <div>
                            <div className="text-sm font-medium">
                              Order Details
                            </div>
                            <div className="mt-1 text-sm text-muted-foreground">
                              <div>Order #: {ticket.id}</div>
                              <div>
                                {ticket.quantity}{" "}
                                {ticket.quantity === 1 ? "ticket" : "tickets"}
                              </div>
                              <div>
                                Total: {formatRupiah(ticket.totalPrice)}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDownloadTicket(ticket)}
                            >
                              <Download className="mr-2 h-4 w-4" />
                              Download
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleViewTicket(ticket)}
                            >
                              <Ticket className="mr-2 h-4 w-4" />
                              View Tickets
                            </Button>
                          </div>
                        </div>
                        <HiddenTicketDownload
                          ticket={ticket}
                          event={eventItem}
                        />
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <Ticket className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-xl font-medium mb-2">No past tickets</h3>
                <p className="text-muted-foreground">
                  Your past event tickets will appear here
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {selectedTicket && (
        <TicketViewer
          isOpen={isTicketViewerOpen}
          onClose={() => setIsTicketViewerOpen(false)}
          ticket={selectedTicket}
          event={selectedEvent}
        />
      )}
    </div>
  );
}
