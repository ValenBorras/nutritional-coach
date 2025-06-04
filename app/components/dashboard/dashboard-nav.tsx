"use client";

import { useAuth } from "@/hooks/use-auth";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogoutButton } from "../auth/logout-button";
import { cn } from "@/lib/utils";

const navItems = [
  {
    name: "Dashboard",
    href: "/dashboard",
  },
  {
    name: "Nutrición",
    href: "/dashboard/nutrition",
  },
  {
    name: "Planes de Comidas",
    href: "/dashboard/meal-plans",
  },
];

export function DashboardNav() {
  const { user, loading } = useAuth();
  const pathname = usePathname();

  if (loading) {
    return null; // or a loading spinner
  }

  return (
    <nav className="border-b border-charcoal/20 bg-charcoal/95">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center space-x-8">
            <Link
              href="/dashboard"
              className="text-2xl font-marcellus text-mist-white tracking-wide"
            >
              NutriGuide
            </Link>
            <div className="hidden md:flex md:space-x-4">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "px-3 py-2 text-sm font-marcellus tracking-wide rounded-md transition-colors",
                    pathname === item.href
                      ? "bg-charcoal text-white"
                      : "text-mist-white hover:bg-charcoal/80 hover:text-white",
                  )}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="hidden md:block text-sm font-marcellus text-mist-white">
              {user?.name}
            </div>
            <LogoutButton />
          </div>
        </div>
      </div>
    </nav>
  );
}
