// pages/api/notification/handling.ts
import type { NextApiRequest, NextApiResponse } from "next"
import crypto from "crypto"

const MIDTRANS_SERVER_KEY = process.env.MIDTRANS_SERVER_KEY || ""

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).end("Method Not Allowed")
  }

  try {
    const body = req.body

    // 🛡️ Midtrans Signature verification
    const { order_id, status_code, gross_amount, signature_key } = body
    const input = order_id + status_code + gross_amount + MIDTRANS_SERVER_KEY
    const expectedSignature = crypto.createHash("sha512").update(input).digest("hex")

    if (expectedSignature !== signature_key) {
      return res.status(403).json({ message: "Invalid signature" })
    }

    // ✅ Handle payment status
    const transactionStatus = body.transaction_status

    if (transactionStatus === "capture" || transactionStatus === "settlement") {
      // Mark order/ticket as paid in database
      console.log("Payment successful:", order_id)
    } else if (transactionStatus === "pending") {
      console.log("Payment pending:", order_id)
    } else if (transactionStatus === "deny" || transactionStatus === "cancel" || transactionStatus === "expire") {
      console.log("Payment failed:", order_id)
    }

    return res.status(200).json({ message: "Notification received" })
  } catch (error) {
    console.error("Notification error:", error)
    return res.status(500).json({ message: "Internal Server Error" })
  }
}
