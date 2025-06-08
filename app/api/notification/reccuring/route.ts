// pages/api/notification/recurring.ts
import type { NextApiRequest, NextApiResponse } from "next"
import crypto from "crypto"

const MIDTRANS_SERVER_KEY = process.env.MIDTRANS_SERVER_KEY || ""

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).end("Method Not Allowed")
  }

  try {
    const body = req.body

    // Signature verification
    const { order_id, status_code, gross_amount, signature_key } = body
    const expectedSignature = crypto
      .createHash("sha512")
      .update(order_id + status_code + gross_amount + MIDTRANS_SERVER_KEY)
      .digest("hex")

    if (signature_key !== expectedSignature) {
      return res.status(403).json({ message: "Invalid signature" })
    }

    // Process recurring transaction status
    const transactionStatus = body.transaction_status
    const subscriptionId = body.subscription_id

    console.log("Recurring payment notification received")
    console.log("Status:", transactionStatus)
    console.log("Order ID:", order_id)
    console.log("Subscription ID:", subscriptionId)

    // ✅ Handle status
    if (transactionStatus === "settlement" || transactionStatus === "capture") {
      // Subscription charged successfully
      // TODO: Update user subscription in database, extend period, etc
      console.log('Subscription charged successfully reccuring.ts')
    } else if (transactionStatus === "pending") {
      // Still pending
      console.log('Subscription pending reccuring.ts')
    } else if (transactionStatus === "expire" || transactionStatus === "cancel") {
      // Subscription failed or cancelled
      console.log('Subscription failed or cancelled reccuring.ts')
    }

    return res.status(200).json({ message: "Recurring notification processed" })
  } catch (error) {
    console.error("Recurring notification error:", error)
    return res.status(500).json({ message: "Internal Server Error" })
  }
}
