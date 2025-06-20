import React from "react";

interface HiddenTicketDownloadProps {
  ticket: {
    id: string;
    customerName: string;
    quantity: number;
    totalPrice: number;
  };
  event: {
    title: string;
    date: string;
    time: string;
    venue: string;
    imageUrl: string;
  };
}

const formatRupiah = (amount: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);

const HiddenTicketDownload: React.FC<HiddenTicketDownloadProps> = ({}) => (
  <div
  // style={{
  //   position: "absolute",
  //   left: "-9999px",
  //   top: 0,
  // }}
  >
    <div
      id={`ticket-download-1`}
      className="w-[500px] h-[500px] rounded-xl overflow-hidden text-white font-sans border border-gray-300 shadow-xl"
      style={{
        backgroundImage: `url('/images/tickets_lts.png')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Overlay */}
      <div className="bg-black/70 w-full h-full p-5">
        {/* Logo */}
        <div className="flex justify-end mb-4 ">
          <img
            src={"/web-app-manifest-512x512.png"}
            alt="Event Logo"
            className="h-16 object-contain rounded-xl  relative right-[50px] top-[12px]"
          />
        </div>
        {/* QR Code */}
        <div className="flex flex-col justify-end items-end gap-1 mt-2 relative right-[25px] rotate-[4deg] bottom-[10px]">
          <img
            // src={`/api/tickets/qr?id=${ticket.id}`}
            src={`/api/tickets/qr?id=1231231`}
            alt="QR Code"
            width={110}
            height={110}
            className="bg-white p-2 rounded-lg"
          />
        </div>

        {/* Title */}
        <div className="bg-white text-black rounded-xl p-4 text-sm mb-4 opacity-50 relative top-[20px]">
          <h2 className="text-xl font-bold text-center mb-2 text-black">
            PRESALE 1 REG ICANC 2025
          </h2>
          <div className="text-end text-sm text-gray-200 mb-6">
            <p className="text-black font-bold">2025 • 14.30</p>
            <p className="text-black font-bold">📍 YOYOGI Stadium</p>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">Order ID</span>
            <span className="font-mono">12312313213</span>
          </div>
          <div className="flex justify-between mt-1">
            <span className="font-medium">Name</span>
            <span className="font-mono">Bayu Darmawan</span>
          </div>
          <div className="flex justify-between mt-1">
            <span className="font-medium">Quantity</span>
            <span>5</span>
          </div>
          <div className="flex justify-between mt-1">
            <span className="font-medium">Total</span>
            <span className="font-semibold">Rp. 130.000</span>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default HiddenTicketDownload;
