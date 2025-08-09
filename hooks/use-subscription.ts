"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/use-auth";

interface Subscription {
  id: string;
  user_id: string;
  user_type: "nutritionist" | "patient";
  stripe_customer_id: string;
  stripe_subscription_id: string;
  status: string;
  price_id: string;
  current_period_start: string;
  current_period_end: string;
  trial_end?: string;
  cancel_at_period_end: boolean;
  created_at: string;
  updated_at: string;
}

interface Price {
  id: string;
  product_id: string;
  user_type: "nutritionist" | "patient";
  active: boolean;
  currency: string;
  unit_amount: number;
  interval: string;
  interval_count: number;
  trial_period_days?: number;
  metadata: any;
}

interface PatientTrial {
  id: string;
  user_id: string;
  trial_start: string;
  trial_end: string;
  trial_used: boolean;
  created_at: string;
}

export function useSubscription() {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [price, setPrice] = useState<Price | null>(null);
  const [trial, setTrial] = useState<PatientTrial | null>(null);
  const [trialActive, setTrialActive] = useState<boolean>(false);
  const [trialDaysLeft, setTrialDaysLeft] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    fetchSubscriptionData();
  }, [user?.id]);

  const fetchSubscriptionData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch latest subscription for this user (order by updated_at desc)
      const { data: subs, error: subError } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", user!.id)
        .order("updated_at", { ascending: false })
        .limit(1);

      if (subError && subError.code !== "PGRST116") {
        throw subError;
      }

      const subscriptionData = Array.isArray(subs) ? subs[0] : null;
      setSubscription(subscriptionData || null);

      // Fetch price info if subscription exists
      if (subscriptionData?.price_id) {
        const { data: priceData, error: priceError } = await supabase
          .from("prices")
          .select("*")
          .eq("id", subscriptionData.price_id)
          .single();

        if (priceError) {
          console.error("Error fetching price:", priceError);
        } else {
          setPrice(priceData);
        }
      }

      // Fetch trial info for patients (use server-side datetime via RPC for status)
      if (user?.role === "patient") {
        const [trialRow, hasTrialRes, daysRes] = await Promise.all([
          supabase
            .from("patient_trials")
            .select("*")
            .eq("user_id", user!.id)
            .maybeSingle(),
          supabase.rpc('has_active_trial', { user_id_param: user!.id }),
          supabase.rpc('trial_days_remaining', { user_id_param: user!.id })
        ])

        const trialData = (trialRow as any)?.data || null
        const trialRowError = (trialRow as any)?.error
        if (trialRowError && trialRowError.code !== "PGRST116") {
          console.error("Error fetching trial:", trialRowError)
        } else {
          setTrial(trialData)
        }

        if (!hasTrialRes.error) setTrialActive(Boolean(hasTrialRes.data))
        if (!daysRes.error) setTrialDaysLeft(daysRes.data || 0)
      }

      // Fallback: if no subscription was found, try to sync from Stripe once
      if (!subscriptionData) {
        try {
          const resp = await fetch('/api/stripe/sync-subscription', { method: 'POST' });
          if (resp.ok) {
            // Re-fetch after syncing
            const { data: subs2 } = await supabase
              .from("subscriptions")
              .select("*")
              .eq("user_id", user!.id)
              .order("updated_at", { ascending: false })
              .limit(1);
            const subscriptionData2 = Array.isArray(subs2) ? subs2[0] : null;
            if (subscriptionData2) {
              setSubscription(subscriptionData2);
              if (subscriptionData2?.price_id) {
                const { data: priceData2 } = await supabase
                  .from("prices")
                  .select("*")
                  .eq("id", subscriptionData2.price_id)
                  .single();
                if (priceData2) setPrice(priceData2);
              }
            }
          }
        } catch (_) {
          // ignore fallback errors
        }
      }
    } catch (err) {
      console.error("Error fetching subscription data:", err);
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  const createCustomerPortalSession = async () => {
    try {
      const response = await fetch("/api/stripe/create-portal-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Error al crear sesión del portal");
      }

      const { url } = await response.json();
      window.location.href = url;
    } catch (error) {
      console.error("Error creating customer portal session:", error);
      throw error;
    }
  };

  const cancelSubscription = async () => {
    const resp = await fetch('/api/stripe/cancel-subscription', { method: 'POST' })
    if (!resp.ok) {
      const data = await resp.json().catch(() => ({}))
      throw new Error(data?.error || 'Error al cancelar suscripción')
    }
    await fetchSubscriptionData()
  }

  // isTrialActive and trialDaysRemaining derived from server-side RPC

  const formatPrice = (amount: number, currency: string = "usd") => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(amount / 100);
  };

  const getSubscriptionStatusText = () => {
    if (!subscription) {
      if (user?.role === "patient" && trialActive) {
        return "Período de prueba activo";
      }
      return "Sin suscripción";
    }

    switch (subscription.status) {
      case "active":
        return "Activa";
      case "canceled":
        return "Cancelada";
      case "incomplete":
        return "Incompleta";
      case "incomplete_expired":
        return "Incompleta (Expirada)";
      case "past_due":
        return "Pago pendiente";
      case "trialing":
        return "Período de prueba";
      case "unpaid":
        return "Sin pagar";
      default:
        return subscription.status;
    }
  };

  return {
    subscription,
    price,
    trial,
    loading,
    error,
    isTrialActive: trialActive,
    trialDaysRemaining: trialDaysLeft,
    subscriptionStatusText: getSubscriptionStatusText(),
    formatPrice,
    createCustomerPortalSession,
    cancelSubscription,
    refetch: fetchSubscriptionData,
  };
} 