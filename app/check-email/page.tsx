"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { Mail, RefreshCw, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

function CheckEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  const [isResending, setIsResending] = useState(false);
  const [resendMessage, setResendMessage] = useState("");

  const handleResendVerification = async () => {
    if (!email) {
      setResendMessage("No se encontró la dirección de email");
      return;
    }

    setIsResending(true);
    setResendMessage("");

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: email,
      });

      if (error) {
        throw error;
      }

      setResendMessage("✅ Email de verificación reenviado exitosamente");
    } catch (error) {
      console.error("Error resending verification:", error);
      setResendMessage(
        `❌ Error: ${error instanceof Error ? error.message : "No se pudo reenviar el email"}`,
      );
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-warm-sand via-warm-sand/90 to-sage/20 py-12 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="w-full max-w-md mx-auto shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
          <CardHeader className="text-center pb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="mx-auto mb-4 w-16 h-16 rounded-full bg-coral/10 flex items-center justify-center"
            >
              <Mail className="w-8 h-8 text-coral" />
            </motion.div>

            <CardTitle className="text-2xl font-marcellus text-charcoal">
              ¡Revisa tu Email!
            </CardTitle>

            <CardDescription className="text-charcoal/70 font-marcellus">
              Te hemos enviado un enlace de verificación para activar tu cuenta
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-center space-y-4"
            >
              <div className="bg-coral/5 border border-coral/20 rounded-lg p-4">
                <p className="text-sm text-charcoal font-marcellus mb-2">
                  <strong>Email enviado a:</strong>
                </p>
                <p className="text-coral font-marcellus font-medium break-all">
                  {email || "tu email registrado"}
                </p>
              </div>

              <div className="text-left space-y-2">
                <h3 className="font-marcellus font-medium text-charcoal">
                  Pasos a seguir:
                </h3>
                <ol className="text-sm text-charcoal/70 font-marcellus space-y-1 list-decimal list-inside">
                  <li>Revisa tu bandeja de entrada</li>
                  <li>Busca un email de NutriGuide</li>
                  <li>Haz clic en el enlace &quot;Verificar Email&quot;</li>
                  <li>Serás redirigido para completar tu registro</li>
                </ol>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <p className="text-xs text-amber-700 font-marcellus">
                  <strong>¿No ves el email?</strong> Revisa tu carpeta de spam o
                  correos no deseados. El email puede tardar unos minutos en
                  llegar.
                </p>
              </div>
            </motion.div>

            {resendMessage && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`text-center p-3 rounded-lg text-sm font-marcellus ${
                  resendMessage.includes("✅")
                    ? "bg-green-50 text-green-700 border border-green-200"
                    : "bg-red-50 text-red-700 border border-red-200"
                }`}
              >
                {resendMessage}
              </motion.div>
            )}

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="space-y-3"
            >
              <Button
                onClick={handleResendVerification}
                disabled={isResending || !email}
                className="w-full bg-coral hover:bg-coral/90 text-white font-marcellus"
              >
                {isResending ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Reenviando...
                  </>
                ) : (
                  <>
                    <Mail className="w-4 h-4 mr-2" />
                    Reenviar Email de Verificación
                  </>
                )}
              </Button>

              <Button
                onClick={() => router.push("/login")}
                variant="outline"
                className="w-full font-marcellus"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver al Login
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="text-center"
            >
              <p className="text-xs text-charcoal/50 font-marcellus">
                ¿Problemas con la verificación?
                <button
                  onClick={() => router.push("/register")}
                  className="ml-1 text-coral hover:text-coral/80 underline"
                >
                  Intenta registrarte nuevamente
                </button>
              </p>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

export default function CheckEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-warm-sand via-warm-sand/90 to-sage/20">
          <div className="w-16 h-16 rounded-full bg-coral/10 flex items-center justify-center">
            <Mail className="w-8 h-8 text-coral animate-pulse" />
          </div>
        </div>
      }
    >
      <CheckEmailContent />
    </Suspense>
  );
}
