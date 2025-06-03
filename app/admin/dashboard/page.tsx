"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { CalendarDays, CreditCard, DollarSign, Download, LineChart, Loader2, Ticket, Users } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AdminSalesChart } from "@/components/admin/sales-chart"
import { AdminRecentSales } from "@/components/admin/recent-sales"
import { AdminEventsList } from "@/components/admin/events-list"
import { getTotalRevenue, getTicketsSold, getActiveEventsCount, getUsersCount } from "@/lib/admin-service"
import { useAuth } from "@/components/auth-provider"
import { useRouter } from "next/navigation"

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    revenue: { total: 0, percentChange: 0 },
    tickets: { total: 0, percentChange: 0 },
    events: { total: 0, newThisWeek: 0 },
    users: { total: 0, newThisWeek: 0 },
  })
  const [loading, setLoading] = useState(true)
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Check if user is admin
    if (!authLoading && (!user || user.role !== "admin")) {
      router.push("/")
      return
    }

    async function fetchDashboardData() {
      try {
        const [revenue, tickets, events, users] = await Promise.all([
          getTotalRevenue(),
          getTicketsSold(),
          getActiveEventsCount(),
          getUsersCount(),
        ])

        setStats({
          revenue,
          tickets,
          events,
          users,
        })
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
      } finally {
        setLoading(false)
      }
    }

    if (!authLoading && user && user.role === "admin") {
      fetchDashboardData()
    }
  }, [user, authLoading, router])

  if (authLoading || loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p>Loading dashboard data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Download Report
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${stats.revenue.total.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.revenue.percentChange >= 0 ? "+" : ""}
                  {stats.revenue.percentChange.toFixed(1)}% from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tickets Sold</CardTitle>
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
                <CardTitle className="text-sm font-medium">Active Events</CardTitle>
                <CalendarDays className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.events.total}</div>
                <p className="text-xs text-muted-foreground">+{stats.events.newThisWeek} new events this week</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.users.total}</div>
                <p className="text-xs text-muted-foreground">+{stats.users.newThisWeek} new users this week</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Sales Overview</CardTitle>
                <CardDescription>Monthly revenue for the current year</CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                <AdminSalesChart />
              </CardContent>
            </Card>

            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Recent Sales</CardTitle>
                <CardDescription>Latest transactions across all events</CardDescription>
              </CardHeader>
              <CardContent>
                <AdminRecentSales />
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Upcoming Events</CardTitle>
                <CardDescription>Manage your upcoming events</CardDescription>
              </div>
              <Button asChild>
                <Link href="/admin/events/new">Add Event</Link>
              </Button>
            </CardHeader>
            <CardContent>
              <AdminEventsList />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Analytics</CardTitle>
              <CardDescription>Detailed analytics for your events and sales</CardDescription>
            </CardHeader>
            <CardContent className="h-[400px] flex items-center justify-center">
              <div className="flex flex-col items-center gap-2 text-muted-foreground">
                <LineChart className="h-10 w-10" />
                <p>Detailed analytics will be displayed here</p>
              </div>
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
  )
}
