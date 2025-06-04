// lib/handle-scan.ts
import { doc, getDoc, updateDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"

export async function handleScan(ticketId: string) {
  const ticketRef = doc(db, "tickets", ticketId)
  const ticketSnap = await getDoc(ticketRef)

  if (!ticketSnap.exists()) {
    alert("❌ Ticket not found!")
    return
  }

  const ticketData = ticketSnap.data()

  if (ticketData.status === "exchanged") {
    alert("⚠️ Ticket has already been exchanged.")
    return
  }

  const confirm = window.confirm(
    `🎫 Ticket: ${ticketData.eventId}\nExchange this ticket?`
  )

  if (confirm) {
    await updateDoc(ticketRef, { status: "exchanged" })
    alert("✅ Ticket successfully exchanged!")
  }
}
