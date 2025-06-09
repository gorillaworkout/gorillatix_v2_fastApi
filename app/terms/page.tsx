import React from "react";

const TermsOfService = () => {
  return (
    <main className="max-w-4xl mx-auto p-8 bg-background shadow-lg rounded-lg my-10 text-gray-200">
      <h1 className="text-4xl font-bold mb-6 text-white">Terms of Service</h1>
      <p className="mb-6 text-gray-300">
        Welcome to <span className="font-semibold text-indigo-400">GorillaTix</span>! By accessing or using our ticketing services, you agree to comply with the following terms:
      </p>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-3 text-white">1. Ticket Purchase</h2>
        <p className="leading-relaxed text-gray-300">
          All tickets sold via GorillaTix are final. Each ticket contains a unique QR code that will be exchanged for a wristband at the event entrance.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-3 text-white">2. Ticket Use & Entry</h2>
        <p className="leading-relaxed text-gray-300">
          Tickets are personal and non-transferable unless explicitly authorized by GorillaTix. The QR code must be presented for scanning to gain entry. Duplicate or fraudulent tickets will be invalid.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-3 text-white">3. Event Changes & Cancellations</h2>
        <p className="leading-relaxed text-gray-300">
          GorillaTix reserves the right to change event details or cancel events. If canceled, refunds will be processed according to our Refund Policy.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-3 text-white">4. User Responsibilities</h2>
        <p className="leading-relaxed text-gray-300">
          You are responsible for safeguarding your QR code. Loss or theft of tickets may result in denied entry, and GorillaTix is not liable for lost or stolen tickets.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-3 text-white">5. Liability Limitations</h2>
        <p className="leading-relaxed text-gray-300">
          GorillaTix is not responsible for any injuries, damages, or losses resulting from your attendance or use of our services.
        </p>
      </section>

      <p className="mt-10 text-gray-300">
        For more information, please see our <a href="/privacy-policy" className="text-indigo-400 underline">Privacy Policy</a> and <a href="/refund-policy" className="text-indigo-400 underline">Refund Policy</a>.
      </p>
    </main>
  );
};

export default TermsOfService;
