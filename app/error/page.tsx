// pages/error.tsx
import { useRouter } from "next/router"
import Head from "next/head"

export default function PaymentErrorPage() {
  const router = useRouter()

  return (
    <>
      <Head>
        <title>Payment Error | GorillaTix</title>
      </Head>
      <main className="min-h-screen flex flex-col justify-center items-center bg-red-50">
        <h1 className="text-3xl font-bold text-red-600 mb-4">❌ Payment Failed</h1>
        <p className="text-gray-700 mb-6">
          An error occurred during the payment process. Please try again or contact support if the issue persists.
        </p>
        <button
          onClick={() => router.push("/events")}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          Back to Events
        </button>
      </main>
    </>
  )
}
