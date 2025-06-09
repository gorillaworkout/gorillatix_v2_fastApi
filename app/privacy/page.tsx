import React from "react";

const PrivacyPolicy = () => {
  return (
    <main className="max-w-4xl mx-auto p-8 bg-background shadow-lg rounded-lg my-10 text-gray-200">
      <h1 className="text-4xl font-bold mb-6 text-white">Privacy Policy</h1>
      <p className="mb-6 text-gray-300">
        At <span className="font-semibold text-indigo-400">GorillaTix</span>, protecting your personal information is our priority. This policy explains what data we collect and how we use it.
      </p>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-3 text-white">1. Information We Collect</h2>
        <ul className="list-disc list-inside text-gray-300 leading-relaxed space-y-1">
          <li>Personal details (name, email, phone number)</li>
          <li>Payment and billing information</li>
          <li>Device and usage data through cookies and analytics</li>
        </ul>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-3 text-white">2. How We Use Your Data</h2>
        <p className="leading-relaxed text-gray-300">
          We use your data to:
        </p>
        <ul className="list-disc list-inside text-gray-300 leading-relaxed space-y-1 ml-5">
          <li>Process ticket purchases and issue QR codes</li>
          <li>Send event updates and customer support</li>
          <li>Improve our website and services</li>
        </ul>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-3 text-white">3. Data Security</h2>
        <p className="leading-relaxed text-gray-300">
          We employ technical and organizational safeguards to protect your personal data from unauthorized access, alteration, or destruction.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-3 text-white">4. Data Sharing</h2>
        <p className="leading-relaxed text-gray-300">
          Your information is not sold or rented to third parties. We only share data with trusted partners who support payment processing and event management under strict confidentiality agreements.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-3 text-white">5. Your Rights</h2>
        <p className="leading-relaxed text-gray-300">
          You have the right to access, update, or request deletion of your personal information. Contact us at <a href="mailto:gorillatix@gmail.com" className="text-indigo-400 underline">gorillatix@gmail.com</a> for assistance.
        </p>
      </section>
    </main>
  );
};

export default PrivacyPolicy;
