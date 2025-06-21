// app/checkout/page.tsx
import { Suspense } from "react"
import CheckoutPageWrapper from "./CheckoutWrapper"
import Loader from "@/components/loading";

export default function CheckoutPage() {
  return (
    <Suspense fallback={<Loader title="Loading..."/>}>
      {/* <CheckoutPageWrapper /> */}
    </Suspense>
  )
}
