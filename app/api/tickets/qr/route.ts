
import { NextResponse } from "next/server"
import { getTicketById } from "@/lib/firebase-service"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get("id")

  if (!id) {
    return NextResponse.json({ error: "Ticket ID is required" }, { status: 400 })
  }

  const ticket = await getTicketById(id)

  if (!ticket) {
    // 1x1 transparent PNG fallback
    const transparentPng = Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAEklEQVR42mP8/5+hHgAHggJ/PfpZGgAAAABJRU5ErkJggg==",
      "base64"
    )
    return new NextResponse(transparentPng, {
      status: 200,
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "no-store"
      }
    })
  }

  // Fetch QR image from external service and return it directly
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=116x116&data=${id}`

  const qrRes = await fetch(qrUrl)

  if (!qrRes.ok) {
    return NextResponse.json({ error: "Failed to fetch QR" }, { status: 500 })
  }

  const qrBuffer = await qrRes.arrayBuffer()

  return new NextResponse(Buffer.from(qrBuffer), {
    status: 200,
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "no-store"
    }
  })
}
