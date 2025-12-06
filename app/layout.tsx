import type React from "react"
import type { Metadata, Viewport } from "next"
import { Inter, Fira_Code } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { Toaster } from "sonner"
import { ThemeProvider } from "@/components/theme-provider"

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" })
const firaCode = Fira_Code({ subsets: ["latin"], variable: "--font-mono" })

export const metadata: Metadata = {
  title: "VV Hotspots | Discover Vasai-Virar",
  description:
    "Discover the hottest hangout spots in Vasai-Virar. Check-in, connect, and explore cafes, parks, gaming zones, and street food spots.",
  keywords: ["Vasai", "Virar", "hangout", "social", "cafes", "gaming", "food"],
  generator: "v0.app",
  icons: {
    icon: [
      { url: "/icon-light-32x32.png", media: "(prefers-color-scheme: light)" },
      { url: "/icon-dark-32x32.png", media: "(prefers-color-scheme: dark)" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: "/apple-icon.png",
  },
}

export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${firaCode.variable} font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          storageKey="vv-theme"
        >
          {children}
          <Toaster position="top-center" theme="system" />
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}
