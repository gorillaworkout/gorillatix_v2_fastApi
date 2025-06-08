// pages/payment/unfinish.tsx
"use client"
import { useRouter } from "next/router"
import Head from "next/head"

export default function PaymentUnfinishPage() {
  const router = useRouter()

  return (
    <>
      <Head>
        <title>Payment Not Completed | GorillaTix</title>
      </Head>
      <main className="min-h-screen flex flex-col justify-center items-center bg-yellow-50">
        <h1 className="text-3xl font-bold text-yellow-600 mb-4">⚠️ Payment Not Completed</h1>
        <p className="text-gray-700 mb-6">
          You did not complete the payment. Please try again if you still want to order.
        </p>
        <button
          onClick={() => router.push("/events")}
          className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
        >
          Back to Events
        </button>
      </main>
    </>
  )
}
