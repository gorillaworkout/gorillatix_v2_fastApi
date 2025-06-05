// import type React from "react"
// import type { Metadata } from "next"
// import { Inter } from "next/font/google"
// import "./globals.css"
// import { ThemeProvider } from "@/components/theme-provider"
// import { Toaster } from "@/components/ui/toaster"
// import { AuthProvider } from "@/components/auth-provider"
// import { SiteHeader } from "@/components/site-header"
// import { SiteFooter } from "@/components/site-footer"
// import { EventProvider } from "@/context/event-context"
// import { ClientProviders } from "@/components/client-providers" // ✅ new wrapper

// const inter = Inter({ subsets: ["latin"] })

// export const metadata: Metadata = {
//   title: "GorillaTix - Online Ticketing Platform",
//   description: "Purchase tickets for your favorite events",
//     generator: 'v0.dev'
// }

// export default function RootLayout({
//   children,
// }: Readonly<{
//   children: React.ReactNode
// }>) {
//   return (
//     <html lang="en" suppressHydrationWarning className="dark">
//       <body className={inter.className}>
//         <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} disableTransitionOnChange>
//           <AuthProvider>
//             <EventProvider>
//               <div className="relative flex min-h-screen flex-col">
//                 <SiteHeader />
//                 <main className="flex-1">{children}</main>
//                 <SiteFooter />
//               </div>
//               <Toaster />
//             </EventProvider>
//           </AuthProvider>
//         </ThemeProvider>
//       </body>
//     </html>
//   )
// }
import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { ClientProviders } from "@/components/client-providers" // ✅ new wrapper

const inter = Inter({ subsets: ["latin"] })
const midtransClientKey = process.env.MIDTRANS_CLIENT_KEY

export const metadata: Metadata = {
  title: "GorillaTix - Online Ticketing Platform",
  description: "Purchase tickets for your favorite events",
  generator: "v0.dev",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          async
          src="https://app.sandbox.midtrans.com/snap/snap.js"
          data-client-key={midtransClientKey}
        />
      </head>
      <body className={inter.className}>
        <ClientProviders>
          <div className="relative flex min-h-screen flex-col">
            <SiteHeader />
            <main className="flex-1">{children}</main>
            <SiteFooter />
          </div>
        </ClientProviders>
      </body>
    </html>
  )
}
