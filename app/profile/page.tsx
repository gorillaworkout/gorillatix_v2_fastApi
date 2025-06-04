"use client";

import { SetStateAction, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Loader2, User, Mail, Calendar, Ticket } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { TicketViewer } from "@/components/ticket-viewer";
import { useAuth } from "@/components/auth-provider";
import { TicketViewerProps } from "@/types/tickets";
import { getEventById, getUserTickets } from "@/lib/firebase-service";
import { formatRupiah } from "@/lib/utils";

// Mock data for tickets
// const mockTickets = [
//   {
//     id: "1",
//     eventName: "Summer Music Festival",
//     date: "2023-07-15",
//     time: "7:00 PM",
//     location: "Central Park, New York",
//     quantity: 2,
//     totalPrice: 99.98,
//     status: "confirmed",
//   },
//   {
//     id: "2",
//     eventName: "Tech Conference 2023",
//     date: "2023-08-10",
//     time: "9:00 AM",
//     location: "Convention Center, San Francisco",
//     quantity: 1,
//     totalPrice: 149.0,
//     status: "confirmed",
//   },
// ];

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isTicketViewerOpen, setIsTicketViewerOpen] = useState(false);
  const [ticketsLoading, setTicketsLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] =
    useState<TicketViewerProps | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tickets, setTickets] = useState<any[]>([]);
  const [ticketEvents, setTicketEvents] = useState<Record<string, any>>({});
  useEffect(() => {
    // If authentication is complete and user is not logged in, redirect to login
    if (!loading && !user) {
      router.push("/login");
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
          console.log(sortedTickets, "sorted tickets");

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
          console.log(events, "events tiket 75");
          setTicketEvents(events);
        } catch (err: any) {
          console.error("Error loading tickets:", err);

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

  const handleViewTicket = (
    ticket: SetStateAction<TicketViewerProps | null>
  ) => {
    setSelectedTicket(ticket);
    setIsTicketViewerOpen(true);
  };

  const handleDownloadTicket = (ticket: {
    id: any;
    eventName: any;
    date: any;
    time: any;
    location: any;
    quantity: any;
    totalPrice: any;
    status: any;
  }) => {
    // In a real app, this would generate a PDF using a library like jsPDF
    // For demo purposes, we'll just create a text file
    const ticketData = `
      TICKET: ${ticket.eventName}
      DATE: ${new Date(ticket.date).toLocaleDateString()}
      TIME: ${ticket.time}
      LOCATION: ${ticket.location}
      QUANTITY: ${ticket.quantity}
      TOTAL PRICE: $${ticket.totalPrice.toFixed(2)}
      TICKET ID: ${ticket.id}
      STATUS: ${ticket.status}
    `;

    const blob = new Blob([ticketData], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ticket-${ticket.id}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Separate tickets into upcoming and past
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
  console.log(upcomingTickets, 'upcoming tickets');
  if (loading) {
    return (
      <div className="container flex h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p>Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-10">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-3xl font-bold mb-6">My Profile</h1>

        <div className="grid gap-6 md:grid-cols-[250px_1fr]">
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col items-center">
                <div className="relative h-24 w-24 mb-4 overflow-hidden rounded-full">
                  {user?.photoURL ? (
                    <Image
                      src={user.photoURL || "/placeholder.svg"}
                      alt={user.displayName || "Profile"}
                      fill
                      sizes="96px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-24 w-24 items-center justify-center rounded-full bg-muted">
                      <User className="h-12 w-12 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <h2 className="text-xl font-bold">
                  {user?.displayName || "User"}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {user?.email || "user@example.com"}
                </p>

                <Separator className="my-4" />

                <div className="w-full space-y-2">
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    asChild
                  >
                    <a href="/profile">
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </a>
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    asChild
                  >
                    <a href="/orders">
                      <Ticket className="mr-2 h-4 w-4" />
                      My Tickets
                    </a>
                  </Button>
                  {user?.role === "admin" && (
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      asChild
                    >
                      <a href="/admin/dashboard">
                        <Calendar className="mr-2 h-4 w-4" />
                        Admin Dashboard
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Account Information</CardTitle>
                <CardDescription>
                  Manage your account details and preferences
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid gap-2">
                    <div className="font-medium">Name</div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <User className="h-4 w-4" />
                      {user?.displayName || "Not provided"}
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <div className="font-medium">Email</div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Mail className="h-4 w-4" />
                      {user?.email || "Not provided"}
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline">Edit Profile</Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>My Tickets</CardTitle>
                <CardDescription>
                  View your upcoming and past events
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="upcoming">
                  <TabsList className="mb-4">
                    <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                    <TabsTrigger value="past">Past</TabsTrigger>
                  </TabsList>
                  <TabsContent value="upcoming">
                    {upcomingTickets.length > 0 ? (
                      <div className="space-y-4">
                        {upcomingTickets.map((ticket) => (
                          <div
                            key={ticket.id}
                            className="flex items-center justify-between rounded-lg border p-4"
                          >
                            <div>
                              <h3 className="font-medium">
                                {ticket.eventName}
                              </h3>
                              <div className="flex items-center text-sm text-muted-foreground">
                                <Calendar className="mr-1 h-4 w-4" />
                                {new Date(ticket.date).toLocaleDateString()}
                                
                              </div>
                              <div className="text-sm text-muted-foreground mt-1">
                                {ticket.quantity}{" "}
                                {ticket.quantity === 1 ? "ticket" : "tickets"} •
                                {formatRupiah(ticket.totalPrice)}
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDownloadTicket(ticket)}
                              >
                                Download
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => handleViewTicket(ticket)}
                              >
                                View Ticket
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Ticket className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
                        <h3 className="font-medium">No upcoming tickets</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          When you purchase tickets, they will appear here
                        </p>
                        <Button className="mt-4" asChild>
                          <a href="/events">Browse Events</a>
                        </Button>
                      </div>
                    )}
                  </TabsContent>
                  <TabsContent value="past">
                    {pastTickets.length > 0 ? (
                      <div className="space-y-4">
                        {pastTickets.map((ticket) => {
                          console.log(ticket, 'ticket');
                          const event = ticketEvents[ticket.eventId];
                          if (!event) return null;
                          return (
                            <div
                              key={ticket.id}
                              className="flex items-center justify-between rounded-lg border p-4"
                            >
                              <div>
                                <h3 className="font-medium">
                                  {event.title}
                                </h3>
                                <div className="flex items-center text-sm text-muted-foreground">
                                  <Calendar className="mr-1 h-4 w-4" />
                                   {event.date} at {event.time}
                                </div>
                                <div className="text-sm text-muted-foreground mt-1">
                                  {ticket.quantity}{" "}
                                  {ticket.quantity === 1 ? "ticket" : "tickets"}{" "}
                                  • ${ticket.totalPrice.toFixed(2)}
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleDownloadTicket(ticket)}
                                >
                                  Download
                                </Button>
                                <Button
                                  size="sm"
                                  onClick={() => handleViewTicket(ticket)}
                                >
                                  View Ticket
                                </Button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Ticket className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
                        <h3 className="font-medium">No upcoming tickets</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          When you purchase tickets, they will appear here
                        </p>
                        <Button className="mt-4" asChild>
                          <a href="/events">Browse Events</a>
                        </Button>
                      </div>
                    )}
                    {/* <div className="text-center py-8">
                      <Ticket className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
                      <h3 className="font-medium">No past tickets</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Your ticket history will appear here after events
                      </p>
                    </div> */}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {selectedTicket && (
        <TicketViewer
          isOpen={isTicketViewerOpen}
          onClose={() => setIsTicketViewerOpen(false)}
          ticket={selectedTicket}
        />
      )}
    </div>
  );
}
