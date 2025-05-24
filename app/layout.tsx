import type { Metadata } from "next"
import { Inter, Marcellus } from "next/font/google"
import { Toaster } from "sonner"
import "./globals.css"
import { Providers } from "./providers"
import LayoutContent from "./components/layout-content"
import { ThemeProvider } from "./components/theme-provider"

const inter = Inter({ subsets: ["latin"] })
const marcellus = Marcellus({ 
  weight: "400",
  subsets: ["latin"],
  variable: "--font-marcellus",
})

export const metadata: Metadata = {
  title: "NutriGuide - Tu Guía de Nutrición Personal",
  description: "Plataforma de nutrición personalizada que te ayuda a alcanzar tus objetivos de salud y bienestar.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${inter.className} ${marcellus.variable}`}>
        <Providers>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <LayoutContent>{children}</LayoutContent>
            <Toaster richColors position="top-center" />
          </ThemeProvider>
        </Providers>
      </body>
    </html>
  )
}
