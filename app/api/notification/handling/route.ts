import { NextRequest } from "next/server"
import crypto from "crypto"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const {
      order_id,
      status_code,
      gross_amount,
      signature_key,
      transaction_status,
    } = body

    const serverKey = process.env.MIDTRANS_SERVER_KEY || ""

    const input = order_id + status_code + gross_amount + serverKey
    const expectedSignature = crypto.createHash("sha512").update(input).digest("hex")

    if (expectedSignature !== signature_key) {
      return new Response(JSON.stringify({ message: "Invalid signature" }), {
        status: 403,
      })
    }

    // ✅ Handle payment status
    if (transaction_status === "capture" || transaction_status === "settlement") {
      console.log("✅ Payment successful:", order_id, 'payment-handling.ts')
      // TODO: update Firestore/ticket DB here
    } else if (transaction_status === "pending") {
      console.log("⏳ Payment pending:", order_id)
    } else if (
      transaction_status === "deny" ||
      transaction_status === "cancel" ||
      transaction_status === "expire"
    ) {
      console.log("❌ Payment failed:", order_id)
    }

    return new Response(JSON.stringify({ message: "Notification received" }), {
      status: 200,
    })
  } catch (error) {
    console.error("❌ Notification error:", error)
    return new Response(JSON.stringify({ message: "Internal Server Error" }), {
      status: 500,
    })
  }
}
