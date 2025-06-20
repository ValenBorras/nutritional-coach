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

      // Fetch subscription
      const { data: subscriptionData, error: subError } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", user!.id)
        .maybeSingle();

      if (subError && subError.code !== "PGRST116") {
        throw subError;
      }

      setSubscription(subscriptionData);

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

      // Fetch trial info for patients
      if (user?.role === "patient") {
        const { data: trialData, error: trialError } = await supabase
          .from("patient_trials")
          .select("*")
          .eq("user_id", user!.id)
          .maybeSingle();

        if (trialError && trialError.code !== "PGRST116") {
          console.error("Error fetching trial:", trialError);
        } else {
          setTrial(trialData);
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

  const isTrialActive = () => {
    if (!trial) return false;
    return new Date(trial.trial_end) > new Date();
  };

  const getTrialDaysRemaining = () => {
    if (!trial || !isTrialActive()) return 0;
    const now = new Date();
    const trialEnd = new Date(trial.trial_end);
    const diffTime = Math.abs(trialEnd.getTime() - now.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const formatPrice = (amount: number, currency: string = "usd") => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(amount / 100);
  };

  const getSubscriptionStatusText = () => {
    if (!subscription) {
      if (user?.role === "patient" && isTrialActive()) {
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
    isTrialActive: isTrialActive(),
    trialDaysRemaining: getTrialDaysRemaining(),
    subscriptionStatusText: getSubscriptionStatusText(),
    formatPrice,
    createCustomerPortalSession,
    refetch: fetchSubscriptionData,
  };
} 