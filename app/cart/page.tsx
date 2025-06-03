"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ShoppingCart, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/components/auth-provider"

export default function CartPage() {
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()

  useEffect(() => {
    // If authentication is complete and user is not logged in, redirect to login
    if (!authLoading && !user) {
      router.push("/login?redirect=/cart")
    } else {
      setLoading(false)
    }
  }, [authLoading, user, router])

  if (loading || authLoading) {
    return (
      <div className="container flex h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p>Loading your cart...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-10">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-3xl font-bold mb-6">Your Cart</h1>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Shopping Cart</CardTitle>
            <CardDescription>Review your items before checkout</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <ShoppingCart className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-xl font-medium mb-2">Your cart is empty</h3>
              <p className="text-muted-foreground mb-6">Add tickets to events to see them here</p>
              <Button asChild>
                <Link href="/events">Browse Events</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
