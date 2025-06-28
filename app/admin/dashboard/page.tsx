"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  CalendarDays,
  CreditCard,
  DollarSign,
  Download,
  Loader2,
  Ticket,
  Users,
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
import { AdminSalesChart } from "@/components/admin/sales-chart";
import { AdminRecentSales } from "@/components/admin/recent-sales";
import { AdminEventsList } from "@/components/admin/events-list";
import {
  getTotalRevenue,
  getTicketsSold,
  getActiveEventsCount,
  getUsersCount,
} from "@/lib/admin-service";
import { useAuth } from "@/components/auth-provider";
import { useRouter } from "next/navigation";
import { formatRupiah } from "@/lib/utils";
import TicketsPage from "@/components/admin/tickets-list";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { exportToExcelWithTitle } from "@/scripts/excel";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    revenue: { total: 0, percentChange: 0 },
    tickets: { total: 0, percentChange: 0 },
    events: { total: 0, newThisWeek: 0 },
    users: { total: 0, newThisWeek: 0 },
  });
  const [loading, setLoading] = useState(true);
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Check if user is admin
    if (!authLoading && (!user || user.role !== "admin")) {
      router.push("/");
      return;
    }

    async function fetchDashboardData() {
      try {
        const [revenue, tickets, events, users] = await Promise.all([
          getTotalRevenue(),
          getTicketsSold(),
          getActiveEventsCount(),
          getUsersCount(),
        ]);

        setStats({
          revenue,
          tickets,
          events,
          users,
        });
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    }

    if (!authLoading && user && user.role === "admin") {
      fetchDashboardData();
    }
  }, [user, authLoading, router]);

  if (authLoading || loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p>Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  // download function
  //     const handleDownloadAllReports = async () => {
  //   try {
  //     const querySnapshot = await getDocs(collection(db, "tickets"));
  //     const tickets = querySnapshot.docs.map(doc => {
  //       const data = doc.data();
  //       return {
  //         "Customer Name": data.customerName,
  //         "User ID": data.userId,
  //         "Order ID": data.orderId,
  //         "Event Name": data.eventName,
  //         "Purchase Date": data.purchaseDate?.toDate?.().toLocaleString?.() || "-",
  //         "Quantity": data.quantity,
  //         "Status": data.status,
  //         "Total Price": formatRupiah(data.totalPrice),
  //         "Venue": data.venue,
  //       };
  //     });

  //     if (tickets.length === 0) {
  //       alert("No tickets found.");
  //       return;
  //     }

  //     const title = "All Ticket Reports";
  //     exportToExcelWithTitle(tickets, "all-tickets-report", title);
  //   } catch (error) {
  //     console.error("❌ Error exporting all tickets:", error);
  //     alert("Failed to download Excel. Check console for details.");
  //   }
  // };
  const handleDownloadAllReports = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "tickets"));

      const tickets = querySnapshot.docs
        .map((doc) => doc.data())
        .filter((data) => ["paid", "confirmed","exchanged"].includes(data.status)) // 🎯 hanya paid & confirmed
        .map((data) => ({
          "Customer Name": data.customerName || "-",
          "User ID": data.userId || "-",
          "Order ID": data.orderId || "-",
          "Event Name": data.eventName || "-",
          "Purchase Date":
            data.purchaseDate?.toDate?.().toLocaleString?.() || "-",
          Quantity: data.quantity ?? "-",
          Status: data.status || "-",
          "Total Price": data.totalPrice ? formatRupiah(data.totalPrice) : "-",
          Venue: data.venue || "-",
        }));

      if (tickets.length === 0) {
        alert("No paid or confirmed tickets found.");
        return;
      }

      const title = "Paid & Confirmed Ticket Reports";
      exportToExcelWithTitle(tickets, "paid-confirmed-tickets-report", title);
    } catch (error) {
      console.error("❌ Error exporting tickets:", error);
      alert("Failed to download Excel. Check console for details.");
    }
  };

  //
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <div className="flex items-center space-x-2">
          {/* <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Download Report
          </Button> */}
        </div>
      </div>

      <Tabs defaultValue="tickets" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="tickets">Tickets</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Revenue
                </CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatRupiah(stats.revenue.total)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {stats.revenue.percentChange >= 0 ? "+" : ""}
                  {stats.revenue.percentChange.toFixed(1)}% from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Tickets Sold
                </CardTitle>
                <Ticket className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">+{stats.tickets.total}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.tickets.percentChange >= 0 ? "+" : ""}
                  {stats.tickets.percentChange.toFixed(1)}% from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Active Events
                </CardTitle>
                <CalendarDays className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.events.total}</div>
                <p className="text-xs text-muted-foreground">
                  +{stats.events.newThisWeek} new events this week
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Users
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.users.total}</div>
                <p className="text-xs text-muted-foreground">
                  +{stats.users.newThisWeek} new users this week
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Sales Overview</CardTitle>
                <CardDescription>
                  Monthly revenue for the current year
                </CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                <AdminSalesChart />
              </CardContent>
            </Card>

            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Recent Sales</CardTitle>
                <CardDescription>
                  Latest transactions across all events
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AdminRecentSales />
              </CardContent>
            </Card>
          </div>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Add Ticket Manual</CardTitle>
                <CardDescription>Manage your ticket events</CardDescription>
              </div>
              <Button asChild>
                <Link href="/admin/events/addTicket">Add Ticket</Link>
              </Button>
            </CardHeader>
            {/* <CardContent>
              <AdminEventsList />
            </CardContent> */}
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Upcoming Events</CardTitle>
                <CardDescription>Manage your upcoming events</CardDescription>
              </div>
              <div className="gap-x-4 flex flex-row">
                <Button asChild>
                  <Link href="/admin/events/new">Add Event</Link>
                </Button>
                <Button variant="outline" onClick={handleDownloadAllReports}>
                  <Download className="mr-2 h-4 w-4" />
                  Download All Repoort
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <AdminEventsList />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tickets" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Tickets</CardTitle>
              <CardDescription>Ticket Detailed</CardDescription>
            </CardHeader>
            <CardContent>
              <TicketsPage />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Reports</CardTitle>
              <CardDescription>Generate and download reports</CardDescription>
            </CardHeader>
            <CardContent className="h-[400px] flex items-center justify-center">
              <div className="flex flex-col items-center gap-2 text-muted-foreground">
                <CreditCard className="h-10 w-10" />
                <p>Report generation tools will be displayed here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
