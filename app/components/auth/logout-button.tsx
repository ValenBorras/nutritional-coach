"use client";

import { useAuth } from "@/hooks/use-auth";
import { Button } from "../ui/button";
import { useRouter } from "next/navigation";
import { usePWADetection } from "@/hooks/use-pwa-detection";

export function LogoutButton() {
  const router = useRouter();
  const { signOut } = useAuth();
  const { isPWA } = usePWADetection();

  const handleLogout = async () => {
    await signOut();

    // If we're in PWA mode, redirect directly to login
    // Otherwise, redirect to homepage
    if (isPWA) {
      console.log("🔐 PWA logout detected, redirecting to login");
      router.push("/login");
    } else {
      router.push("/");
    }

    router.refresh();
  };

  return (
    <Button
      variant="ghost"
      onClick={handleLogout}
      className="text-mist-white hover:text-white hover:bg-charcoal/80 font-marcellus"
    >
      Cerrar Sesión
    </Button>
  );
}
