import type { Metadata } from "next"
import { Inter, Marcellus } from "next/font/google"
import { Toaster } from "sonner"
import "./globals.css"
import { Providers } from "./providers"
import LayoutContent from "./components/layout-content"
import { ThemeProvider } from "./components/theme-provider"
import PWAInstaller from "./components/pwa-installer"
import OfflineIndicator from "./components/offline-indicator"

const inter = Inter({ subsets: ["latin"] })
const marcellus = Marcellus({ 
  weight: "400",
  subsets: ["latin"],
  variable: "--font-marcellus",
})

export const metadata: Metadata = {
  title: "NutriGuide - Tu Guía de Nutrición Personal",
  description: "Plataforma de nutrición personalizada que te ayuda a alcanzar tus objetivos de salud y bienestar.",
  manifest: "/manifest.json",
  themeColor: "#F88379",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "NutriGuide",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    siteName: "NutriGuide",
    title: "NutriGuide - Tu Guía de Nutrición Personal",
    description: "Plataforma de nutrición personalizada que te ayuda a alcanzar tus objetivos de salud y bienestar.",
  },
  twitter: {
    card: "summary",
    title: "NutriGuide - Tu Guía de Nutrición Personal",
    description: "Plataforma de nutrición personalizada que te ayuda a alcanzar tus objetivos de salud y bienestar.",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#F88379" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="NutriGuide" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-TileColor" content="#F88379" />
        <meta name="msapplication-tap-highlight" content="no" />
        
        {/* Apple Touch Icons */}
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="apple-touch-icon" sizes="152x152" href="/icons/apple-touch-icon-152x152.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/apple-touch-icon-180x180.png" />
        
        {/* Favicon */}
        <link rel="icon" type="image/png" sizes="32x32" href="/icons/icon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/icons/icon-16x16.png" />
        <link rel="shortcut icon" href="/favicon.png" />
        
        {/* Splash screens for iOS */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        
        {/* Viewport for PWA */}
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0, viewport-fit=cover" />
      </head>
      <body className={`${inter.className} ${marcellus.variable}`}>
        <Providers>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <OfflineIndicator />
            <LayoutContent>{children}</LayoutContent>
            <PWAInstaller />
            <Toaster richColors position="top-center" />
          </ThemeProvider>
        </Providers>
      </body>
    </html>
  )
}
