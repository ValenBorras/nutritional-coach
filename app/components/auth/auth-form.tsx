"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { PulsingDots } from "../ui/loading-spinner";
import { GoogleLoginButton } from "./google-login-button";

interface AuthFormProps {
  mode: "login" | "register";
}

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const {
    signInWithEmail,
    loading: authLoading,
    error: authError,
    user,
    authUser,
  } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Handle auth errors from the useAuth hook
  useEffect(() => {
    if (authError) {
      setError(authError);
      setIsLoading(false);
    }
  }, [authError]);

  // Handle successful authentication
  useEffect(() => {
    if (authUser && !authLoading) {
      if (user) {
        // User data loaded successfully, redirect to dashboard
        router.push("/dashboard");
        router.refresh();
      } else if (!authError) {
        // Auth user exists but no user data - this indicates a data inconsistency
        setError(
          "Account data incomplete. Please contact support or try registering again.",
        );
        setIsLoading(false);
      }
    }
  }, [authUser, user, authLoading, authError, router]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const name = formData.get("name") as string;

    try {
      if (mode === "register") {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password, name, role: "patient" }),
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.message || "Error al registrar usuario");
        }

        // After successful registration, redirect to check email page
        router.push(`/check-email?email=${encodeURIComponent(email)}`);
        return; // Don't continue with sign in
      } else {
        const { error: signInError } = await signInWithEmail(email, password);

        if (signInError) {
          throw new Error(signInError.message);
        }

        // Don't redirect here - let the useEffect handle it after user data loads
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ocurrió un error");
      setIsLoading(false);
    }
  };

  // Show loading state while auth is loading or form is submitting
  const showLoading = isLoading || authLoading;

  return (
    <Card className="w-full max-w-md mx-auto shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
      <CardHeader className="pb-8">
        <CardTitle className="text-3xl font-marcellus tracking-wide text-center text-charcoal">
          {mode === "login" ? "Iniciar Sesión" : "Registrarse"}
        </CardTitle>
        <CardDescription className="text-center font-marcellus text-charcoal/70">
          {mode === "login"
            ? "Ingresa tus credenciales para acceder a tu cuenta"
            : "Crea una cuenta para comenzar tu viaje de nutrición"}
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          {mode === "register" && (
            <div className="space-y-2">
              <Label htmlFor="name" className="font-marcellus text-charcoal">
                Nombre
              </Label>
              <Input
                id="name"
                name="name"
                type="text"
                required
                placeholder="Tu nombre"
                disabled={showLoading}
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email" className="font-marcellus text-charcoal">
              Email
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              required
              placeholder="tu@email.com"
              disabled={showLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="font-marcellus text-charcoal">
              Contraseña
            </Label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              placeholder="••••••••"
              disabled={showLoading}
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="text-sm text-red-600 font-marcellus">
                {error}
                {error.includes("User data not found") && (
                  <div className="mt-2">
                    <Button
                      type="button"
                      variant="link"
                      className="p-0 h-auto text-xs text-red-600 underline"
                      onClick={() => router.push("/register")}
                    >
                      Try registering again
                    </Button>
                  </div>
                )}
                {error.includes("Email not verified") && (
                  <div className="mt-2 space-y-2">
                    <Button
                      type="button"
                      variant="link"
                      className="p-0 h-auto text-xs text-red-600 underline block"
                      onClick={() => {
                        const email = (
                          document.getElementById("email") as HTMLInputElement
                        )?.value;
                        router.push(
                          `/check-email?email=${encodeURIComponent(email || "")}`,
                        );
                      }}
                    >
                      Check your email for verification link
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex flex-col space-y-6 pt-6">
          <Button
            type="submit"
            className="w-full font-marcellus text-lg h-12 bg-gradient-to-r from-coral to-coral/90 hover:from-coral/90 hover:to-coral shadow-lg"
            disabled={showLoading}
          >
            {showLoading ? (
              <div className="flex items-center space-x-2">
                <PulsingDots color="white" size="sm" />
                <span>Cargando...</span>
              </div>
            ) : mode === "login" ? (
              "Iniciar Sesión"
            ) : (
              "Registrarse"
            )}
          </Button>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-gray-500 font-medium">O</span>
            </div>
          </div>

          {/* Google Login Button */}
          <GoogleLoginButton disabled={showLoading} />

          <div className="text-sm text-center font-marcellus text-charcoal/70">
            {mode === "login" ? (
              <p>
                ¿No tienes una cuenta?{" "}
                <Button
                  variant="link"
                  className="p-0 font-marcellus text-coral hover:text-coral/80"
                  onClick={() => router.push("/register")}
                  disabled={showLoading}
                >
                  Regístrate aquí
                </Button>
              </p>
            ) : (
              <p>
                ¿Ya tienes una cuenta?{" "}
                <Button
                  variant="link"
                  className="p-0 font-marcellus text-coral hover:text-coral/80"
                  onClick={() => router.push("/login")}
                  disabled={showLoading}
                >
                  Inicia sesión aquí
                </Button>
              </p>
            )}
          </div>
        </CardFooter>
      </form>
    </Card>
  );
}
