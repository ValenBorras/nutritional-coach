"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/use-auth";

interface Plan {
  id: string;
  product_id: string;
  user_type: "nutritionist" | "patient";
  active: boolean;
  currency: string;
  unit_amount: number;
  interval: string;
  interval_count: number;
  trial_period_days?: number;
  metadata: {
    name?: string;
    description?: string;
    features?: string[];
    popular?: boolean;
    tier?: string;
  };
}

export function usePlans() {
  const { user } = useAuth();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    if (!user?.role) {
      setLoading(false);
      return;
    }

    fetchPlans();
  }, [user?.role]);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: plansData, error: plansError } = await supabase
        .from("prices")
        .select("*")
        .eq("user_type", user!.role)
        .eq("active", true)
        .order("unit_amount", { ascending: true });

      if (plansError) {
        throw plansError;
      }

      setPlans(plansData || []);
    } catch (err) {
      console.error("Error fetching plans:", err);
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  const createCheckoutSession = async (priceId: string) => {
    try {
      const response = await fetch("/api/stripe/create-checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ priceId }),
      });

      if (!response.ok) {
        throw new Error("Error al crear la sesión de checkout");
      }

      const { sessionId, url } = await response.json();
      
      // If we get a URL, redirect directly. If we get a sessionId, use Stripe.js
      if (url) {
        window.location.href = url;
      } else if (sessionId) {
        // Dynamic import to avoid build issues if stripe-js is not available
        try {
          const { loadStripe } = await import("@stripe/stripe-js");
          const stripe = await loadStripe(
            process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
          );
          
          if (stripe) {
            await stripe.redirectToCheckout({ sessionId });
          }
        } catch (stripeError) {
          console.error("Stripe.js not available, redirecting to checkout URL");
          // Fallback: construct checkout URL manually or show error
          throw new Error("Error al cargar el sistema de pagos");
        }
      }
    } catch (error) {
      console.error("Error creating checkout session:", error);
      throw error;
    }
  };

  const formatPrice = (amount: number, currency: string = "usd") => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(amount / 100);
  };

  return {
    plans,
    loading,
    error,
    createCheckoutSession,
    formatPrice,
    refetch: fetchPlans,
  };
} 