"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/app/components/ui/button"
import { cn } from "@/lib/utils"

const navLinks = [
  { href: "/#features", label: "Características" },
  { href: "/#how-it-works", label: "Cómo Funciona" },
  { href: "/#testimonials", label: "Testimonios" },
]

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const pathname = usePathname()

  const isActive = (href: string) => {
    if (href === "/") return pathname === href
    return pathname.startsWith(href)
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-charcoal/95 backdrop-blur-sm">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="text-2xl font-marcellus text-mist-white">
            NutriGuide
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "text-mist-white hover:text-white transition-colors font-marcellus",
                  isActive(link.href) && "text-coral"
                )}
              >
                {link.label}
              </Link>
            ))}
            <div className="flex items-center space-x-4">
              <Button
                asChild
                className="bg-coral hover:bg-coral/90 text-white font-marcellus"
              >
                <Link href="/login">Comenzar</Link>
              </Button>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-mist-white"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <svg
              className="h-6 w-6"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {isMenuOpen ? (
                <path d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 space-y-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "block text-mist-white hover:text-white transition-colors font-marcellus",
                  isActive(link.href) && "text-coral"
                )}
                onClick={() => setIsMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="flex flex-col space-y-4 pt-4">
              <Button
                asChild
                className="bg-coral hover:bg-coral/90 text-white font-marcellus w-full"
              >
                <Link href="/login" onClick={() => setIsMenuOpen(false)}>
                  Comenzar
                </Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
