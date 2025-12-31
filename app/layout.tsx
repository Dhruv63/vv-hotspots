import type React from "react"
import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"
import "./globals.css"
import { Toaster } from "sonner"
import { ThemeProvider } from "@/components/theme-provider"

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" })

export const metadata: Metadata = {
  title: "VV Hotspots | Discover Vasai-Virar",
  description:
    "Discover the hottest hangout spots in Vasai-Virar. Check-in, connect, and explore cafes, parks, gaming zones, and street food spots.",
  keywords: ["Vasai", "Virar", "hangout", "social", "cafes", "gaming", "food"],
  generator: "v0.app",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
}

export const viewport: Viewport = {
  themeColor: "#06b6d4",
  width: "device-width",
  initialScale: 1,
}

import { ServiceWorkerRegistration } from "@/components/service-worker-registration"
import { NotificationPermissionModal } from "@/components/notification-permission-modal"
import { QueryProvider } from "@/components/query-provider"

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <ServiceWorkerRegistration />
        <NotificationPermissionModal />
        <QueryProvider>
          <ThemeProvider>
            {children}
            <Toaster position="top-center" theme="system" />
          </ThemeProvider>
        </QueryProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
