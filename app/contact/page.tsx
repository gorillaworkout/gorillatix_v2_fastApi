"use client"

import { useState } from "react"

export default function ContactPage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const whatsappMessage = `Hello, my name is *${name}* (%0AEmail: ${email})%0A%0A${message}`
    const phone = "6287700600208" // Ganti ke nomor WhatsApp kamu
    const whatsappURL = `https://wa.me/${phone}?text=${encodeURIComponent(whatsappMessage)}`
    
    window.open(whatsappURL, "_blank")

    setName("")
    setEmail("")
    setMessage("")
  }

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-lg bg-background border border-gray-800 rounded-2xl p-8 shadow-lg">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold mb-2">Contact Me</h1>
          <p className="text-gray-400 text-sm">Let's talk about your idea or project. Your message will be sent to my WhatsApp.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm mb-1">Your Name</label>
            <input
              type="text"
              required
              className="w-full bg-black border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Your Email</label>
            <input
              type="email"
              required
              className="w-full bg-black border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Message</label>
            <textarea
              rows={4}
              required
              className="w-full bg-black border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 transition-colors text-white font-semibold py-2 px-4 rounded-lg"
          >
            Send via WhatsApp
          </button>
        </form>
      </div>
    </div>
  )
}
