import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get("id")

  if (!id) {
    return NextResponse.json({ error: "Ticket ID is required" }, { status: 400 })
  }

  // In a real app, you would verify the ticket exists and belongs to the user
  // For demo purposes, we'll redirect to a QR code generator service
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=TICKET-${id}`

  return NextResponse.redirect(qrCodeUrl)
}
