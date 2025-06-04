"use client"

import { useState, useRef, useEffect } from "react"
import { doc, getDoc, updateDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function TicketScanner() {
  const [ticketId, setTicketId] = useState("")
  const [ticketData, setTicketData] = useState<any>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [error, setError] = useState("")

  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    // Fokus input agar hasil scan langsung masuk ke input (jika pakai scanner)
    inputRef.current?.focus()
  }, [])

  const handleScan = async (scanned: string) => {
    const id = scanned.trim()
    if (!id) return

    setTicketId(id)
    setTicketData(null)
    setError("")
    setDialogOpen(false)

    try {
      const ticketRef = doc(db, "tickets", id)
      const snap = await getDoc(ticketRef)

      if (!snap.exists()) {
        setError("❌ Ticket not found.")
        setTicketData({ scannedId: id })
        return
      }

      const data = snap.data()

      if (data.status === "exchanged") {
        setError("⚠️ Ticket has already been exchanged.")
        setTicketData(data)
        return
      }

      setTicketData(data)
      setDialogOpen(true)
    } catch (err) {
      console.error(err)
      setError("❌ Error verifying ticket.")
    }
  }

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Untuk scanner hardware: langsung scan masuk input ini
    handleScan(e.target.value)
    e.target.value = ""
  }

  const onManualCheck = () => {
    if (ticketId.trim() === "") {
      setError("Please enter a ticket ID to check.")
      return
    }
    handleScan(ticketId)
  }

  return (
    <div className="container py-10">
      <Card className="max-w-xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">🎟️ Ticket QR Scanner</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">

          {/* Input tersembunyi untuk scanner hardware */}
          <input
            ref={inputRef}
            type="text"
            onChange={onInputChange}
            className="opacity-0 absolute top-0 left-0 w-0 h-0"
            autoComplete="off"
            autoFocus
          />

          {/* Input visible untuk manual input */}
          <div className="flex gap-2 items-center">
            <input
              type="text"
              placeholder="Enter ticket ID manually"
              value={ticketId}
              onChange={(e) => setTicketId(e.target.value)}
              className="border rounded px-3 py-2 flex-grow"
            />
            <button
              onClick={onManualCheck}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Check Ticket
            </button>
          </div>

          {error && (
            <div className="p-3 bg-red-100 text-red-700 rounded-md font-medium">
              {error}
            </div>
          )}

          {/* Show scanned ticket ID when not found */}
          {error === "❌ Ticket not found." && ticketData?.scannedId && (
            <div className="p-3 bg-yellow-100 text-yellow-800 rounded-md font-medium mt-2">
              <p>Scanned Ticket ID:</p>
              <pre className="select-all">{ticketData.scannedId}</pre>
              <p>Please verify manually.</p>
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg">Confirm Ticket Exchange</AlertDialogTitle>
            <div className="text-sm text-muted-foreground space-y-1">
              <p><strong>Event ID:</strong> {ticketData?.eventId}</p>
              <p><strong>Email:</strong> {ticketData?.email}</p>
              <div>
                <strong>Status:</strong>{" "}
                <Badge variant={ticketData?.status === "confirmed" ? "default" : "destructive"}>
                  {ticketData?.status}
                </Badge>
              </div>
            </div>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (!ticketId) return
                const ticketRef = doc(db, "tickets", ticketId)
                await updateDoc(ticketRef, { status: "exchanged" })
                setDialogOpen(false)
                alert("✅ Ticket marked as exchanged.")
              }}
              className="bg-green-600 text-white hover:bg-green-700"
            >
              Confirm Exchange
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
