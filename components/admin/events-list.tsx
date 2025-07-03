"use client";

import { useState } from "react";
import Link from "next/link";
import {
  CalendarDays,
  Edit,
  MoreHorizontal,
  Trash,
  Download,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { formatDate, formatRupiah } from "@/lib/utils";
import { useEvents } from "@/context/event-context";
import { getDocs, collection, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase"; // adjust this to your path
import { exportToExcelWithTitle } from "@/scripts/excel";
import { deleteEventById, getFirebaseIdToken } from "@/lib/firebase-auth";
import { useToast } from "@/hooks/use-toast";


export function AdminEventsList() {
  const { events, deleteEvent } = useEvents();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const { toast } = useToast();
  const handleDelete = async (id: string) => {
    setSelectedEventId(id);

    const token = await getFirebaseIdToken();
    if (!token) {
      console.error("User not logged in");
      toast({
        title: "Unauthorized",
        description: "You must be logged in to delete an event.",
        variant: "destructive",
      });
      return;
    }

    try {
      await deleteEventById(id, token);
      console.log(`✅ Event ${id} deleted successfully`);

      toast({
        title: "Event deleted",
        description: `Event with ID ${id} was successfully deleted.`,
      })

      setDeleteDialogOpen(false);

      // Tunggu 1 detik baru reload
      setTimeout(() => {
        window.location.reload();
        
      }, 1000);

    } catch (error: any) {
      console.error("❌ Deletion failed", error);

      toast({
        title: "Failed to delete event",
        description: error?.message || "An unknown error occurred.",
        variant: "destructive",
      });
    }
  };



  const confirmDelete = () => {
    if (selectedEventId) {
      deleteEvent(selectedEventId);
    }
    setDeleteDialogOpen(false);
  };

  const handleDownloadReport = async (eventId: string) => {
    try {
      const q = query(
        collection(db, "tickets"),
        where("eventId", "==", eventId)
      );

      const querySnapshot = await getDocs(q);
      const tickets = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          "Customer Name": data.customerName,
          "User ID": data.userId,
          "Order ID": data.orderId,
          "Event Name": data.eventName,
          "Purchase Date": data.purchaseDate.toDate().toLocaleString(),
          "Quantity": data.quantity,
          "Status": data.status,
          "Total Price": formatRupiah(data.totalPrice),
          "Venue": data.venue,
        };
      });

      if (tickets.length === 0) {
        alert("No tickets found for this event.");
        return;
      }

      const title = `Ticket Report for ${tickets[0]["Event Name"]}`;
      exportToExcelWithTitle(tickets, `tickets-${eventId}`, title);
    } catch (error) {
      console.error("Error exporting tickets:", error);
      alert("Failed to download Excel. Check console for details.");
    }
  };

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Event</TableHead>
            <TableHead>Event Date</TableHead>
            <TableHead>Event Date Start Selling</TableHead>
            <TableHead>Event Date End Selling</TableHead>
            <TableHead>Time Selling</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Tickets Sold</TableHead>
            <TableHead>Available</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {events.map((event) => (
            <TableRow key={event.id}>
              <TableCell className="font-medium">{event.title}</TableCell>
              <TableCell>
                <div className="flex items-center">
                  <CalendarDays className="mr-1 h-4 w-4 text-muted-foreground" />
                  {formatDate(event.date)}
                </div>
              </TableCell>
              <TableCell>{event.startSellingDate}</TableCell>
              <TableCell>{event.endSellingDate}</TableCell>
              <TableCell>{event.timeSelling}</TableCell>
              <TableCell>
                <Badge variant="outline">{event.category}</Badge>
              </TableCell>
              <TableCell>
                <Badge
                  variant={event.ticketsAvailable > 0 ? "default" : "secondary"}
                >
                  {event.ticketsAvailable > 0 ? "Active" : "Sold"}
                </Badge>
              </TableCell>
              <TableCell>{event.ticketsSold}</TableCell>
              <TableCell>{event.ticketsAvailable}</TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">Open menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      // className="text-destructive focus:text-destructive"
                      onClick={() => handleDownloadReport(event.id)}
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={`/admin/events/${event.id}`}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive"
                      onClick={() => handleDelete(event.id)}
                    >
                      <Trash className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              event and all associated tickets and transactions.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}