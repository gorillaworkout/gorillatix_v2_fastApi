import { NextRequest, NextResponse } from "next/server"
import crypto from "crypto"

const MIDTRANS_SERVER_KEY = process.env.NEXT_PUBLIC_MIDTRANS_SERVER_KEY || ""

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { order_id, status_code, gross_amount, signature_key, transaction_status } = body

    // Verifikasi signature
    const expectedSignature = crypto
      .createHash("sha512")
      .update(order_id + status_code + gross_amount + MIDTRANS_SERVER_KEY)
      .digest("hex")

    if (signature_key !== expectedSignature) {
      return NextResponse.json({ message: "Invalid signature" }, { status: 403 })
    }

    console.log("✅ Pay Account Notification Received")
    console.log("Order ID:", order_id)
    console.log("Transaction Status:", transaction_status)

    if (transaction_status === "settlement") {
      console.log("Pembayaran berhasil, pay-account.ts")
    } else if (transaction_status === "pending") {
      console.log("Menunggu pembayaran, pay-account.ts")
    } else if (transaction_status === "expire") {
      console.log("Pembayaran expired, pay-account.ts")
    }

    return NextResponse.json({ message: "Pay Account notification handled" })
  } catch (error) {
    console.error("Pay Account notification error:", error)
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 })
  }
}
