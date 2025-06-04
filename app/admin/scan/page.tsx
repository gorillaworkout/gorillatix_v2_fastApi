// app/admin/scan/page.tsx or pages/admin/scan.tsx (depending on your project)

import TicketScanner from "@/components/qr-ticket-scan"

export default function ScanPage() {
  return (
    <main className="container py-10">
      <TicketScanner />
    </main>
  )
}
