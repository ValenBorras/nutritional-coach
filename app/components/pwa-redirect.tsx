"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/components/auth/auth-provider";
import { usePWADetection } from "@/hooks/use-pwa-detection";
import PWALoading from "./pwa-loading";

export default function PWARedirect() {
  const router = useRouter();
  const { user, loading, authUser } = useAuth();
  const { isPWA, platform, source } = usePWADetection();
  const [hasRedirected, setHasRedirected] = useState(false);
  const [showLoading, setShowLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("Cargando...");

  useEffect(() => {
    // Prevent multiple redirections or redirect during loading
    if (hasRedirected) return;

    if (isPWA) {
      console.log(
        `🔄 PWA access detected (${platform}, ${source}), checking authentication...`,
      );
      setShowLoading(true);
      setLoadingMessage("Verificando sesión...");

      // Check if we have any form of authentication
      const hasAuth = user || authUser;

      if (!loading && hasAuth) {
        // User is authenticated, redirect to dashboard
        console.log("✅ Authenticated user detected, redirecting to dashboard");
        setLoadingMessage("Redirigiendo al dashboard...");
        setHasRedirected(true);
        setTimeout(() => {
          router.replace("/dashboard");
        }, 500);
      } else if (!loading && !hasAuth) {
        // Check localStorage for any persisted session info
        const checkStoredSession = () => {
          try {
            // Check multiple possible localStorage keys for Supabase session
            const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
            const projectRef = supabaseUrl?.split("//")[1]?.split(".")[0];

            const possibleKeys = [
              "supabase.auth.token",
              `sb-${projectRef}-auth-token`,
              "supabase-auth-token",
              "auth-token",
            ];

            const hasStoredSession = possibleKeys.some((key) => {
              const stored = localStorage.getItem(key);
              return stored && stored !== "null" && stored !== "undefined";
            });

            return hasStoredSession;
          } catch (error) {
            console.warn("Error checking localStorage:", error);
            return false;
          }
        };

        const hasStoredSession = checkStoredSession();

        if (hasStoredSession) {
          console.log("🔄 Found stored session, waiting for auth to load...");
          setLoadingMessage("Restaurando sesión...");
          // Wait a bit more for auth to initialize
          const timeoutId = setTimeout(() => {
            if (!user && !authUser && !hasRedirected) {
              console.log(
                "🔐 No valid session found after waiting, redirecting to login",
              );
              setLoadingMessage("Redirigiendo al login...");
              setHasRedirected(true);
              setTimeout(() => {
                router.replace("/login");
              }, 500);
            }
          }, 3000); // Increased timeout for better reliability

          // Cleanup timeout if component unmounts
          return () => clearTimeout(timeoutId);
        } else {
          // No stored session, redirect to login immediately
          console.log("🔐 No authentication found, redirecting to login");
          setLoadingMessage("Redirigiendo al login...");
          setHasRedirected(true);
          setTimeout(() => {
            router.replace("/login");
          }, 500);
        }
      }
    } else {
      // Not PWA, hide loading
      setShowLoading(false);
    }
  }, [user, loading, authUser, router, hasRedirected, isPWA, platform, source]);

  // Show loading component if PWA and redirecting
  return <PWALoading show={showLoading && isPWA} message={loadingMessage} />;
}
