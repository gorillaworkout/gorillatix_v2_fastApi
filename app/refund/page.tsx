import React from "react";

const RefundPolicy = () => {
  return (
    <main className="max-w-4xl mx-auto p-8 bg-background shadow-lg rounded-lg my-10 text-gray-200">
      <h1 className="text-4xl font-bold mb-6 text-white">Refund Policy</h1>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-3 text-white">1. Ticket Refunds</h2>
        <p className="leading-relaxed text-gray-300">
          All ticket purchases on <span className="font-semibold text-indigo-400">GorillaTix</span> are generally non-refundable, as each ticket contains a unique QR code used for entry.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-3 text-white">2. Event Cancellation</h2>
        <p className="leading-relaxed text-gray-300">
          If an event is canceled by the organizer, you are eligible for a refund. The refund amount will be **the full ticket price minus QRIS transaction fees and service charges**.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-3 text-white">3. Refund Requests</h2>
        <p className="leading-relaxed text-gray-300">
          Refund requests must be submitted within 7 days after the event cancellation notice is issued. Send your request to <a href="mailto:gorillatix@gmail.com" className="text-indigo-400 underline">gorillatix@gmail.com</a> with your ticket and transaction details.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-3 text-white">4. No-Show & Other Cases</h2>
        <p className="leading-relaxed text-gray-300">
          No refunds will be issued for failure to attend the event or for tickets that have already been scanned or exchanged for wristbands.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-3 text-white">5. Fee Breakdown</h2>
        <p className="leading-relaxed text-gray-300">
          When applicable, the following fees are non-refundable:
        </p>
        <ul className="list-disc list-inside text-gray-300 mt-2 space-y-1">
          <li>QRIS transaction fee</li>
          <li>Service/processing charges</li>
        </ul>
      </section>
    </main>
  );
};

export default RefundPolicy;
