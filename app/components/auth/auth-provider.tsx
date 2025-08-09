"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
} from "react";
import { createClient } from "@/lib/supabase/client";
import { User as AuthUser } from "@supabase/supabase-js";
import { Database } from "@/lib/database.types";

type User = Database["public"]["Tables"]["users"]["Row"];
type Profile = Database["public"]["Tables"]["profiles"]["Row"];

interface AuthState {
  user: User | null;
  profile: Profile | null;
  authUser: AuthUser | null;
  loading: boolean;
  error: string | null;
}

interface AuthContextType extends AuthState {
  signOut: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<any>;
  signUpWithEmail: (
    email: string,
    password: string,
    metadata?: any,
  ) => Promise<any>;
  signInWithGoogle: () => Promise<any>;
  refreshUser: () => Promise<void>;
  supabase: any;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    profile: null,
    authUser: null,
    loading: true,
    error: null,
  });

  const supabase = createClient();
  const loadingRef = useRef(false);
  const subscriptionRef = useRef<any>(null);
  const initializationRef = useRef(false);

  useEffect(() => {
    // Prevent multiple initializations
    if (initializationRef.current) {
      console.log("🚫 AuthProvider already initialized, skipping...");
      return;
    }

    initializationRef.current = true;
    console.log("🔐 Initializing AuthProvider (single instance)...");

    // Set up auth state change listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log(
        "🔄 Auth state changed in provider:",
        event,
        "User ID:",
        session?.user?.id,
      );

      try {
        if (session?.user) {
          console.log("✅ User session found, loading data...");
          await loadUserData(session.user);
        } else {
          console.log("ℹ️ No user session, clearing state");
          setAuthState({
            user: null,
            profile: null,
            authUser: null,
            loading: false,
            error: null,
          });
        }
      } catch (error) {
        console.error("❌ Error in auth state change:", error);
        setAuthState({
          user: null,
          profile: null,
          authUser: null,
          loading: false,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    });

    subscriptionRef.current = subscription;

    return () => {
      console.log("🧹 Cleaning up AuthProvider subscription...");
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
        subscriptionRef.current = null;
      }
      initializationRef.current = false;
    };
  }, []);

  async function loadUserData(authUser: AuthUser) {
    // Prevent multiple simultaneous loads
    if (loadingRef.current) {
      console.log("⏳ Already loading user data, skipping...");
      return;
    }

    try {
      loadingRef.current = true;
      console.log("📊 Loading user data for:", authUser.email);

      // Email verification disabled: proceed regardless of email_confirmed_at

      const response = await fetch(`/api/user?email=${authUser.email}`);
      if (!response.ok) {
        // If user doesn't exist and this is an OAuth user, they need onboarding
        if (response.status === 404 && isOAuthUser) {
          console.log("👤 OAuth user needs onboarding:", authUser.email);

          // Only redirect if not already on onboarding page
          if (
            typeof window !== "undefined" &&
            !window.location.pathname.startsWith("/onboarding")
          ) {
            console.log("🔄 Redirecting to onboarding...");
            window.location.href = "/onboarding";
            return;
          }

          // If already on onboarding page, just set the state without redirect
          setAuthState({
            user: null,
            profile: null,
            authUser,
            loading: false,
            error: null,
          });
          return;
        }

        const errorData = await response.json();
        throw new Error(
          errorData.details || `HTTP error! status: ${response.status}`,
        );
      }

      const result = await response.json();

      if (result.success && result.user) {
        console.log("✅ User data loaded successfully");

        setAuthState({
          user: result.user,
          profile: result.profile,
          authUser,
          loading: false,
          error: null,
        });

        console.log("🎉 Authentication complete!");
        return;
      }

      throw new Error("Invalid response from user API");
    } catch (error) {
      console.error("❌ Error loading user data:", error);
      setAuthState({
        user: null,
        profile: null,
        authUser,
        loading: false,
        error: error instanceof Error ? error.message : "Failed to load user data",
      });
    } finally {
      loadingRef.current = false;
    }
  }

  async function signOut() {
    try {
      console.log("🚪 Signing out...");
      loadingRef.current = false; // Reset loading state
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("❌ Sign out error:", error);
        throw error;
      }
      console.log("✅ Sign out successful");
    } catch (error) {
      console.error("❌ Error signing out:", error);
      throw error;
    }
  }

  async function signInWithEmail(email: string, password: string) {
    try {
      console.log("🔐 Signing in with email:", email);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("❌ Sign in error:", error);
      } else {
        console.log("✅ Sign in successful for:", email);
      }

      return { data, error };
    } catch (error) {
      console.error("❌ Unexpected sign in error:", error);
      return {
        data: null,
        error: {
          message:
            error instanceof Error
              ? error.message
              : "Unexpected error during sign in",
        },
      };
    }
  }

  async function signUpWithEmail(
    email: string,
    password: string,
    metadata?: any,
  ) {
    try {
      console.log("📝 Signing up with email:", email);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
        },
      });

      if (error) {
        console.error("❌ Sign up error:", error);
      } else {
        console.log("✅ Sign up successful for:", email);
      }

      return { data, error };
    } catch (error) {
      console.error("❌ Unexpected sign up error:", error);
      return {
        data: null,
        error: {
          message:
            error instanceof Error
              ? error.message
              : "Unexpected error during sign up",
        },
      };
    }
  }

  async function signInWithGoogle() {
    try {
      console.log("🔐 Signing in with Google...");

      // Get the production URL or fallback to current origin
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin;
      const redirectUrl = `${baseUrl}/onboarding`;

      console.log("🔗 Using redirect URL:", redirectUrl);
      console.log("🌍 NEXT_PUBLIC_APP_URL:", process.env.NEXT_PUBLIC_APP_URL);
      console.log("🌍 window.location.origin:", window.location.origin);

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: redirectUrl,
        },
      });

      if (error) {
        console.error("❌ Google sign in error:", error);
      } else {
        console.log("✅ Google sign in initiated");
      }

      return { data, error };
    } catch (error) {
      console.error("❌ Unexpected Google sign in error:", error);
      return {
        data: null,
        error: {
          message:
            error instanceof Error
              ? error.message
              : "Unexpected error during Google sign in",
        },
      };
    }
  }

  async function refreshUser() {
    if (authState.authUser) {
      console.log("🔄 Refreshing user data...");
      await loadUserData(authState.authUser);
    }
  }

  const value: AuthContextType = {
    ...authState,
    signOut,
    signInWithEmail,
    signUpWithEmail,
    signInWithGoogle,
    refreshUser,
    supabase,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
