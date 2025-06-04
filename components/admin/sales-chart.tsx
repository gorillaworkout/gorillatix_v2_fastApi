"use client"

import { useEffect, useState } from "react"
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "@/components/ui/chart"
import { getMonthlySalesData } from "@/lib/admin-service"
import { Loader2 } from "lucide-react"
import { formatRupiah } from "@/lib/utils"

export function AdminSalesChart() {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchSalesData() {
      try {
        const salesData = await getMonthlySalesData()
        setData(salesData)
      } catch (error) {
        console.error("Error fetching sales data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchSalesData()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[350px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  // If no data, show placeholder
  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[350px] text-muted-foreground">
        <p>No sales data available</p>
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="name" tickLine={false} axisLine={false} fontSize={12} tickMargin={10} />
        <YAxis tickLine={false} axisLine={false} fontSize={12} tickMargin={10} tickFormatter={(value) => `$${value}`} />
        <Tooltip
          cursor={{ fill: "hsl(var(--muted))" }}
          content={({ active, payload }) => {
            if (active && payload && payload.length) {
              return (
                <div className="rounded-lg border bg-background p-2 shadow-sm">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex flex-col">
                      <span className="text-[0.70rem] uppercase text-muted-foreground">Month</span>
                      <span className="font-bold text-muted-foreground">{payload[0].payload.name}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[0.70rem] uppercase text-muted-foreground">Revenue</span>
                      {}
                      <span className="font-bold"> {formatRupiah(payload[0].value as number)}</span>
                    </div>
                  </div>
                </div>
              )
            }
            return null
          }}
        />
        <Bar dataKey="total" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
