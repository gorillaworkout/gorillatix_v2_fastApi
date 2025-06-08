// pages/api/notification/pay-account.ts
import type { NextApiRequest, NextApiResponse } from "next"
import crypto from "crypto"

const MIDTRANS_SERVER_KEY = process.env.MIDTRANS_SERVER_KEY || ""

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" })
  }

  try {
    const body = req.body

    // Ambil data penting dari payload
    const { order_id, status_code, gross_amount, signature_key, transaction_status } = body

    // Verifikasi signature
    const expectedSignature = crypto
      .createHash("sha512")
      .update(order_id + status_code + gross_amount + MIDTRANS_SERVER_KEY)
      .digest("hex")

    if (signature_key !== expectedSignature) {
      return res.status(403).json({ message: "Invalid signature" })
    }

    console.log("✅ Pay Account Notification Received")
    console.log("Order ID:", order_id)
    console.log("Transaction Status:", transaction_status)

    // TODO: Lakukan update ke database atau proses lainnya sesuai status
    if (transaction_status === "settlement") {
      // Pembayaran berhasil
      console.log('Pembayaran berhasil, pay-account.ts')
    } else if (transaction_status === "pending") {
      // Menunggu pembayaran
      console.log('Menunggu pembayaran, pay-account.ts')
    } else if (transaction_status === "expire") {
      // Pembayaran expired
      console.log('Pembayaran expired, pay-account.ts')
    }

    return res.status(200).json({ message: "Pay Account notification handled" })
  } catch (error) {
    console.error("Pay Account notification error:", error)
    return res.status(500).json({ message: "Internal Server Error" })
  }
}
