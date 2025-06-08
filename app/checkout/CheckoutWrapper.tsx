"use client"

import { useSearchParams } from "next/navigation"
import CheckoutClient from "./checkoutClient"

export default function CheckoutWrapper() {
  const searchParams = useSearchParams()
  const eventId = searchParams.get("eventId")

  return <CheckoutClient eventId={eventId} />
}
