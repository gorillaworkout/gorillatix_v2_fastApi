// components/HiddenTicketDownload.tsx

import { formatRupiah } from "@/lib/utils";
import React from "react";

interface HiddenTicketDownloadProps {
  ticket: {
    id: string;
    quantity: number;
    totalPrice: number;
    customerName: string
  };
  event: {
    title: string;
    date: string;
    time: string;
    venue: string;
  };
//   formatRupiah: (amount: number) => string;
}

const HiddenTicketDownload: React.FC<HiddenTicketDownloadProps> = ({
  ticket,
  event,
//   formatRupiah,
}) => (
  <div
    style={{
      position: "absolute",
      left: "-9999px",
      top: 0,
    }}
  >
    <div
      id={`ticket-download-${ticket.id}`}
      className="w-[400px] rounded-xl bg-white shadow-lg border border-gray-200 overflow-hidden text-black font-sans"
    >
      <div className="p-5 border-b border-gray-300">
        <h2 className="text-xl font-bold text-gray-800">{event.title}</h2>
        <div className="text-sm text-gray-600 mt-1">
          <p>
            {event.date} • {event.time}
          </p>
          <p className="text-gray-500">📍 {event.venue}</p>
        </div>
      </div>

      <div className="p-5 flex flex-col gap-2 text-sm">
        <div className="flex justify-between">
          <span className="font-medium">Order #</span>
          <span className="font-mono">{ticket.id}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-medium">Name</span>
          <span className="font-mono">{ticket.customerName}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-medium">Quantity</span>
          <span>{ticket.quantity}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-medium">Total</span>
          <span className="font-semibold">
            {formatRupiah(ticket.totalPrice)}
          </span>
        </div>
      </div>

      <div className="p-5 border-t border-dashed border-gray-300 flex flex-col items-center gap-2">
        <img
          src={`/api/tickets/qr?id=${ticket.id}`}
          alt="QR Code"
          width={120}
          height={120}
          className="rounded"
        />
        <p className="text-xs text-gray-400 text-center">
          Scan this QR code at the event entrance
        </p>
      </div>
    </div>
  </div>
);

export default HiddenTicketDownload;
