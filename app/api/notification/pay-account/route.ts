import { NextRequest } from "next/server"
import crypto from "crypto"
import { db } from "@/lib/firebase-admin"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const {
      order_id,
      status_code,
      gross_amount,
      signature_key,
      transaction_status,
      payment_type,
      transaction_time
    } = body

    const serverKey = process.env.MIDTRANS_SERVER_KEY || ""
    const input = order_id + status_code + gross_amount + serverKey
    const expectedSignature = crypto.createHash("sha512").update(input).digest("hex")

    if (expectedSignature !== signature_key) {
      return new Response(JSON.stringify({ message: "Invalid signature" }), {
        status: 403,
      })
    }

    // ✅ Save to Firestore
    await db.collection("payments").doc(order_id).set({
      order_id,
      gross_amount,
      status_code,
      transaction_status,
      payment_type,
      transaction_time,
      updated_at: new Date().toISOString()
    }, { merge: true })

    console.log("✅ Payment saved:", order_id)

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
