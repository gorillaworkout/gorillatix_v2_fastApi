"use client"

import { useEffect, useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getRecentSales } from "@/lib/admin-service"
import { Loader2 } from "lucide-react"
import { formatRupiah } from "@/lib/utils"

export function AdminRecentSales() {
  const [sales, setSales] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchRecentSales() {
      try {
        const recentSales = await getRecentSales(5)
        setSales(recentSales)
      } catch (error) {
        console.error("Error fetching recent sales:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchRecentSales()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[300px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  // If no sales, show placeholder
  if (sales.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[300px] text-muted-foreground">
        <p>No recent sales available</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {sales.map((sale) => (
        <div key={sale.id} className="flex items-center">
          <Avatar className="h-9 w-9">
            <AvatarImage src={sale.userAvatar || "/favicon-96x96.png"} alt="Avatar" />
            <AvatarFallback>{sale.userName.substring(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="ml-4 space-y-1">
            <p className="text-sm font-medium leading-none">{sale.userName}</p>
            <p className="text-sm text-muted-foreground">
              {sale.eventName} - {sale.quantity} {sale.quantity === 1 ? "ticket" : "tickets"}
            </p>
          </div>
          <div className="ml-auto font-medium">{formatRupiah(sale.totalPrice)}</div>
        </div>
      ))}
    </div>
  )
}
