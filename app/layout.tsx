import { Geist_Mono, Inter } from "next/font/google"
import type { Metadata } from "next"
import { Toaster } from "sonner"

import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { cn } from "@/lib/utils"

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" })

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export const metadata: Metadata = {
  title: "3D Model Maker — AI Studio & BlackBullet Compatible",
  description: "Professional browser-based 3D modeling platform with AI generation, UV tools, PBR materials, and BlackBullet compatibility.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("antialiased", fontMono.variable, "font-sans", inter.variable, "dark")}
    >
      <body className="overflow-hidden bg-[#0d0f12] text-zinc-100 antialiased selection:bg-emerald-500/30 selection:text-emerald-200">
        <ThemeProvider>
          {children}
          <Toaster position="bottom-right" richColors theme="dark" />
        </ThemeProvider>
      </body>
    </html>
  )
}
