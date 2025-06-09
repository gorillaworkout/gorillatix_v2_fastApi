import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import 'leaflet/dist/leaflet.css';
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ClientProviders } from "@/components/client-providers"; // ✅ new wrapper

const inter = Inter({ subsets: ["latin"] });
const midtransClientKey = process.env.MIDTRANS_CLIENT_KEY;

export const metadata: Metadata = {
  title: "Beli Tiket Online Murah & Aman | GorillaTix",
  description:
    "GorillaTix adalah platform beli tiket online terpercaya untuk konser, event, seminar, dan hiburan lainnya. Mudah, cepat, dan aman.",
  generator: "GorillaTix",
  keywords: [
    "beli tiket online",
    "tiket konser murah",
    "tiket event",
    "platform tiket Indonesia",
    "gorillatix",
    "tiket seminar",
    "tiket pertunjukan",
    "online ticketing platform",
    "tiket digital",
  ],
  authors: [{ name: "GorillaTix", url: "https://www.gorillatix.com" }],
  creator: "GorillaTix",
  publisher: "Gorilla Inovasi Digital",
  robots:
    "index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1",
  openGraph: {
    title: "Beli Tiket Online Murah & Aman | GorillaTix",
    description:
      "Beli tiket konser, seminar, dan event favorit Anda di GorillaTix. Proses cepat, aman, dan langsung dapat e-ticket.",
    url: "https://www.gorillatix.com",
    siteName: "GorillaTix",
    images: [
      {
        url: "https://www.gorillatix.com/images/gorillatix-logo.png",
        width: 1200,
        height: 630,
        alt: "GorillaTix - Beli Tiket Online",
      },
    ],
    locale: "id_ID",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Beli Tiket Online Murah & Aman | GorillaTix",
    description:
      "GorillaTix adalah platform beli tiket online terpercaya untuk konser dan event. Langsung dapat e-ticket!",
    site: "@gorillatix",
    images: ["https://www.gorillatix.com/images/gorillatix-logo.png"],
  },
  metadataBase: new URL("https://www.gorillatix.com"),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="google-site-verification" content="bmaYcGO0TFIfmsT1g0dt7F6c4NO_DWIhfPWrvn8QPX8" />
        
        <meta property="og:image" content="https://www.gorillatix.com/images/gorillatix-logo.png" />
        <meta name="twitter:image" content="https://www.gorillatix.com/images/gorillatix-logo.png" />
        <script
          async
          src="https://app.sandbox.midtrans.com/snap/snap.js"
          data-client-key={midtransClientKey}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "GorillaTix",
              url: "https://www.gorillatix.com",
              logo: "https://www.gorillatix.com/images/gorillatix-logo.png",
              sameAs: [
                "https://www.instagram.com/gorillatix",
                "https://www.facebook.com/gorillatix",
              ],
            }),
          }}
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
  );
}
