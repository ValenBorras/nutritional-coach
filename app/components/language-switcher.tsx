"use client"

import { Button } from "@/app/components/ui/button"
import { Languages } from "lucide-react"
import { useState } from "react"

export default function LanguageSwitcher() {
  const [language, setLanguage] = useState<"en" | "es">("es")

  const toggleLanguage = () => {
    setLanguage(language === "en" ? "es" : "en")
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleLanguage}
      className="text-charcoal hover:bg-soft-rose/10"
      aria-label={`Switch to ${language === "en" ? "Spanish" : "English"}`}
    >
      <Languages className="h-5 w-5" />
      <span className="sr-only">{language === "en" ? "Cambiar a Español" : "Switch to English"}</span>
    </Button>
  )
} 