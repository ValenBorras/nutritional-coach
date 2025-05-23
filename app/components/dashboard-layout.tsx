"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/app/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/app/components/ui/avatar"
import { Home, Calendar, PieChart, Settings, MessageSquare, Menu, X, User, LogOut, Bell, Users } from "lucide-react"
import { useMediaQuery } from "@/hooks/use-media-query"
import { useAuth } from "@/hooks/use-auth"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const isMobile = useMediaQuery("(max-width: 1024px)")
  const { user, signOut } = useAuth()
  const pathname = usePathname()

  // Different navigation items based on user role
  const getNavItems = () => {
    const baseItems = [
      { icon: <Home size={20} />, label: "Dashboard", href: "/dashboard" },
    ]

    if (user?.role === 'nutritionist') {
      return [
        ...baseItems,
        { icon: <Users size={20} />, label: "Pacientes", href: "/dashboard/patients" },
        { icon: <MessageSquare size={20} />, label: "Messages", href: "/dashboard/messages" },
        { icon: <Settings size={20} />, label: "Settings", href: "/dashboard/settings" },
      ]
    } else {
      return [
        ...baseItems,
        { icon: <PieChart size={20} />, label: "Nutrition", href: "/dashboard/nutrition" },
        { icon: <Calendar size={20} />, label: "Meal Plans", href: "/dashboard/meal-plans" },
        { icon: <MessageSquare size={20} />, label: "Messages", href: "/dashboard/messages" },
        { icon: <Settings size={20} />, label: "Settings", href: "/dashboard/settings" },
      ]
    }
  }

  const navItems = getNavItems()

  // Function to check if a navigation item is active
  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === "/dashboard"
    }
    return pathname.startsWith(href)
  }

  const handleLogout = async () => {
    try {
      await signOut()
      // The auth state change will automatically redirect to login
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  return (
    <div className="min-h-screen bg-mist-white flex">
      {/* Sidebar for desktop */}
      {!isMobile && (
        <aside className="w-64 bg-warm-sand border-r border-soft-rose/20 p-6 flex flex-col">
          <div className="flex items-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-full bg-soft-rose flex items-center justify-center">
              <span className="font-marcellus text-lg text-charcoal">NG</span>
            </div>
            <span className="font-marcellus text-xl text-charcoal">NutriGuide</span>
          </div>

          <nav className="flex-1">
            <ul className="space-y-2">
              {navItems.map((item, index) => (
                <li key={index}>
                  <Link
                    href={item.href}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg text-charcoal hover:bg-soft-rose/10 transition-colors ${
                      isActive(item.href) ? "bg-soft-rose/10 text-coral" : ""
                    }`}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </aside>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Top navigation */}
        <header className="bg-warm-sand border-b border-soft-rose/20 p-4">
          <div className="flex items-center justify-between">
            {isMobile && (
              <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
                {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
              </Button>
            )}

            {isMobile && (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-soft-rose flex items-center justify-center">
                  <span className="font-marcellus text-lg text-charcoal">NG</span>
                </div>
                <span className="font-marcellus text-xl text-charcoal">NutriGuide</span>
              </div>
            )}

            {/* User Profile Section */}
            <div className={`flex items-center gap-4 ${isMobile ? "" : "ml-auto"}`}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-sage-green/20 flex items-center justify-center">
                  <span className="font-semibold text-sage-green">
                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
                <div className="hidden md:block">
                  <p className="font-medium text-charcoal">{user?.name || 'Usuario'}</p>
                  <p className="text-xs text-charcoal/60">{user?.email || 'Sin email'}</p>
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                className="border-soft-rose/20 text-charcoal hover:bg-soft-rose/10 gap-2"
                onClick={handleLogout}
              >
                <LogOut size={16} />
                <span className="hidden md:inline">Log Out</span>
              </Button>
            </div>
          </div>
        </header>

        {/* Mobile sidebar */}
        {isMobile && isSidebarOpen && (
          <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setIsSidebarOpen(false)}>
            <aside
              className="w-64 h-full bg-warm-sand p-6 flex flex-col animate-in slide-in-from-left"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-soft-rose flex items-center justify-center">
                    <span className="font-marcellus text-lg text-charcoal">NG</span>
                  </div>
                  <span className="font-marcellus text-xl text-charcoal">NutriGuide</span>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(false)}>
                  <X size={20} />
                </Button>
              </div>

              <nav className="flex-1">
                <ul className="space-y-2">
                  {navItems.map((item, index) => (
                    <li key={index}>
                      <Link
                        href={item.href}
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg text-charcoal hover:bg-soft-rose/10 transition-colors ${
                          isActive(item.href) ? "bg-soft-rose/10 text-coral" : ""
                        }`}
                        onClick={() => setIsSidebarOpen(false)}
                      >
                        {item.icon}
                        <span>{item.label}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            </aside>
          </div>
        )}

        {/* Page content */}
        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  )
}
