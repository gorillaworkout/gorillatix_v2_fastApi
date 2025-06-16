// pages/payment/finish.tsx
"use client"
import { useRouter } from "next/router"
import Head from "next/head"

export default function PaymentFinishPage() {
  const router = useRouter()
  return (
    <>
      <Head>
        <title>Payment Success | GorillaTix</title>
      </Head>
      <main className="min-h-screen flex flex-col justify-center items-center bg-green-50">
        <h1 className="text-3xl font-bold text-green-600 mb-4">🎉 Payment Successful!</h1>
        <p className="text-gray-700 mb-6">
          Thank you! Your payment has been completed successfully.
        </p>
        <button
          onClick={() => router.push("/my-tickets")}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          View My Tickets
        </button>
      </main>
    </>
  )
}
