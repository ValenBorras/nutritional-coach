"use client";

import { useEffect, useState } from "react";
import { Button } from "@/app/components/ui/button";
import { Download, X } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}

// Enhanced service worker registration function
async function registerServiceWorkerRobust() {
  if (!("serviceWorker" in navigator)) {
    console.log("❌ Service Worker not supported");
    return null;
  }

  console.log("🔍 Starting service worker registration process...");
  console.log("🔍 Current URL:", window.location.href);
  console.log("🔍 Protocol:", window.location.protocol);

  try {
    // First, verify the service worker file is accessible
    const swFileCheck = await fetch("/sw.js", { method: "HEAD" });
    console.log("🔍 SW file accessibility check:", swFileCheck.status);

    if (!swFileCheck.ok) {
      console.error(
        "❌ Service worker file not accessible:",
        swFileCheck.status,
      );
      return null;
    }

    // Check for existing registrations first
    const existingRegistrations =
      await navigator.serviceWorker.getRegistrations();
    console.log(
      `🔍 Found ${existingRegistrations.length} existing SW registrations`,
    );

    // Log details of existing registrations
    existingRegistrations.forEach((reg, index) => {
      console.log(`🔍 Registration ${index + 1}:`, {
        scope: reg.scope,
        active: !!reg.active,
        installing: !!reg.installing,
        waiting: !!reg.waiting,
        updateViaCache: reg.updateViaCache,
      });
    });

    // If we have a registration, check if it's ready
    if (existingRegistrations.length > 0) {
      try {
        console.log("⏳ Waiting for existing SW to be ready...");
        const registration = await Promise.race([
          navigator.serviceWorker.ready,
          new Promise<ServiceWorkerRegistration>((_, reject) =>
            setTimeout(() => reject(new Error("Timeout")), 5000),
          ),
        ]);
        console.log("✅ Existing SW is ready:", registration.scope);
        return registration;
      } catch (error) {
        console.log(
          "⚠️ Existing SW not ready within timeout, will re-register",
        );
      }
    }

    // Register new service worker
    console.log("🔄 Registering new service worker...");
    const registration = await navigator.serviceWorker.register("/sw.js", {
      scope: "/",
      updateViaCache: "none",
    });

    console.log("✅ SW registered successfully:", {
      scope: registration.scope,
      active: !!registration.active,
      installing: !!registration.installing,
      waiting: !!registration.waiting,
    });

    // Wait for the service worker to be ready with timeout
    console.log("⏳ Waiting for SW to be ready...");
    const readyPromise = navigator.serviceWorker.ready;
    const timeoutPromise = new Promise<ServiceWorkerRegistration>((_, reject) =>
      setTimeout(
        () => reject(new Error("SW ready timeout after 15 seconds")),
        15000,
      ),
    );

    try {
      const readyRegistration = await Promise.race([
        readyPromise,
        timeoutPromise,
      ]);
      console.log("✅ SW ready:", {
        scope: readyRegistration.scope,
        active: !!readyRegistration.active,
        pushManager: !!readyRegistration.pushManager,
      });
      return readyRegistration;
    } catch (timeoutError) {
      console.log(
        "⚠️ SW ready timeout, but registration exists. This might still work.",
      );
      return registration;
    }
  } catch (error) {
    console.error("❌ SW registration failed:", error);

    // For Safari, try alternative registration approach with different options
    const isSafari =
      /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);
    if (isSafari) {
      console.log(
        "🍎 Safari detected, trying alternative registration approach...",
      );

      try {
        // Wait a bit and try again with minimal options
        await new Promise((resolve) => setTimeout(resolve, 2000));

        console.log("🔄 Safari retry: registering with minimal options...");
        const retryRegistration =
          await navigator.serviceWorker.register("/sw.js");
        console.log("✅ Safari SW registration successful on retry");

        // Don't wait for ready on Safari retry, just return the registration
        return retryRegistration;
      } catch (retryError) {
        console.error("❌ Safari SW retry also failed:", retryError);

        // Final Safari attempt with even longer delay
        try {
          console.log("🍎 Safari final attempt with longer delay...");
          await new Promise((resolve) => setTimeout(resolve, 3000));

          const finalRegistration = await navigator.serviceWorker.register(
            "/sw.js",
            { scope: "/" },
          );
          console.log("✅ Safari final attempt successful");
          return finalRegistration;
        } catch (finalError) {
          console.error("❌ All Safari attempts failed:", finalError);
        }
      }
    }

    return null;
  }
}

export default function PWAInstaller() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const DISMISS_KEY = 'pwa-install-dismissed';

  useEffect(() => {
    // Register service worker IMMEDIATELY and with robust error handling
    const initServiceWorker = async () => {
      console.log("🚀 Initializing service worker...");

      // Try registration immediately
      let registration = await registerServiceWorkerRobust();

      // If first attempt failed, try again after a short delay (Safari sometimes needs this)
      if (!registration) {
        console.log("🔄 First registration failed, retrying in 2 seconds...");
        await new Promise((resolve) => setTimeout(resolve, 2000));
        registration = await registerServiceWorkerRobust();
      }

      // Final attempt with longer delay for Safari
      if (!registration) {
        const isSafari =
          /Safari/.test(navigator.userAgent) &&
          !/Chrome/.test(navigator.userAgent);
        if (isSafari) {
          console.log("🍎 Safari final attempt in 5 seconds...");
          await new Promise((resolve) => setTimeout(resolve, 5000));
          registration = await registerServiceWorkerRobust();
        }
      }

      if (registration) {
        console.log("🎉 Service Worker fully initialized");

        // Mark as ready in localStorage for other components
        localStorage.setItem("sw-ready", "true");
        localStorage.setItem("sw-ready-time", Date.now().toString());

        // Dispatch custom event for other components
        window.dispatchEvent(
          new CustomEvent("sw-ready", {
            detail: { registration },
          }),
        );
      } else {
        console.log("❌ Service Worker initialization failed completely");
        localStorage.setItem("sw-ready", "false");
      }
    };

    // Start service worker initialization immediately
    initServiceWorker();

    // Check if app is already installed
    if (
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia("(display-mode: standalone)").matches
    ) {
      setIsInstalled(true);
    }

    // Respect prior dismissal: if user closed/"Ahora no", don't show again
    const previouslyDismissed =
      typeof window !== 'undefined' && localStorage.getItem(DISMISS_KEY) === 'true';

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      if (previouslyDismissed || isInstalled) {
        // Do not show again if user dismissed before or app is installed
        return;
      }
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowInstallPrompt(true);
    };

    // Listen for app installed event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowInstallPrompt(false);
      setDeferredPrompt(null);

      // Mark app as installed in localStorage for future PWA detection
      localStorage.setItem("pwa-installed", "true");
      localStorage.setItem("app-installed", new Date().toISOString());
      console.log("✅ PWA installed successfully");
    };

    if (!previouslyDismissed && !isInstalled) {
      window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    }
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt,
      );
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      console.log("User accepted the install prompt");
      // Mark app as installed
      localStorage.setItem("pwa-installed", "true");
      localStorage.setItem("app-installed", new Date().toISOString());
    } else {
      console.log("User dismissed the install prompt");
      // Do not show again
      localStorage.setItem(DISMISS_KEY, 'true');
    }

    setDeferredPrompt(null);
    setShowInstallPrompt(false);
  };

  const handleDismiss = () => {
    setShowInstallPrompt(false);
    // Do not show again on subsequent visits
    try {
      localStorage.setItem(DISMISS_KEY, 'true');
    } catch {}
  };

  if (isInstalled || !showInstallPrompt) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:w-80">
      <div className="bg-[#F5EBDD] dark:bg-[#4A4A4A] border border-[#F7CAC9] dark:border-[#A8CBB7] rounded-lg shadow-lg p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Download className="h-5 w-5 text-[#F88379]" />
            <h3 className="font-semibold text-sm text-[#4A4A4A] dark:text-[#F5EBDD]">
              Instalar NutriGuide
            </h3>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            className="h-6 w-6 p-0 text-[#4A4A4A] dark:text-[#F5EBDD] hover:bg-[#F7CAC9] dark:hover:bg-[#A8CBB7]"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-sm text-[#4A4A4A] dark:text-[#F5EBDD] mb-3">
          Instala NutriGuide en tu dispositivo para acceso rápido y
          funcionalidad offline.
        </p>
        <div className="flex space-x-2">
          <Button
            onClick={handleInstallClick}
            className="flex-1 bg-[#F88379] hover:bg-[#F88379]/90 text-white"
          >
            Instalar
          </Button>
          <Button
            variant="outline"
            onClick={handleDismiss}
            className="border-[#F7CAC9] text-[#4A4A4A] hover:bg-[#F7CAC9]"
          >
            Ahora no
          </Button>
        </div>
      </div>
    </div>
  );
}
