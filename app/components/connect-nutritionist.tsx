"use client";

import { useState } from "react";
import { Button } from "@/app/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { UserPlus, Check, AlertCircle, X } from "lucide-react";
import { useAuth } from "@/app/components/auth/auth-provider";

interface ConnectNutritionistProps {
  onSuccess?: () => void;
}

export default function ConnectNutritionist({
  onSuccess,
}: ConnectNutritionistProps) {
  const { user, refreshUser } = useAuth();
  const [patientKey, setPatientKey] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [connectedNutritionist, setConnectedNutritionist] = useState<any>(null);

  const hasNutritionist = user?.nutritionist_id;

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!patientKey.trim()) {
      setError("La clave de nutricionista es obligatoria");
      return;
    }

    setIsConnecting(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch("/api/patient/connect-nutritionist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          patient_key: patientKey.trim(),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess("¡Conectado exitosamente con tu nutricionista!");
        setConnectedNutritionist(data.nutritionist);
        setPatientKey("");

        // Refrescar datos del usuario
        await refreshUser();

        // Callback para el componente padre
        if (onSuccess) {
          onSuccess();
        }

        // Limpiar mensaje después de unos segundos
        setTimeout(() => {
          setSuccess(null);
        }, 5000);
      } else {
        setError(data.error || "Error al conectar con la nutricionista");
      }
    } catch (err) {
      setError("Error de conexión. Inténtalo de nuevo.");
    } finally {
      setIsConnecting(false);
    }
  };

  // Si ya tiene nutricionista, mostrar el estado conectado
  if (hasNutritionist) {
    return (
      <Card className="bg-gradient-to-br from-green-50 to-emerald-100 border-green-200 shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-green-800 flex items-center gap-2">
            <Check className="w-5 h-5 text-green-600" />
            Nutricionista Conectada
          </CardTitle>
          <CardDescription className="text-green-700">
            Ya tienes una nutricionista asignada para ayudarte con tus objetivos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3 p-4 bg-white/60 rounded-lg border border-green-200">
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
              <UserPlus className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="font-medium text-green-800">Estado: Conectado</p>
              <p className="text-sm text-green-600">
                Tu nutricionista puede personalizar tus recomendaciones
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-warm-sand to-warm-sand/80 border-soft-rose/20 shadow-lg">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-charcoal flex items-center gap-2">
          <UserPlus className="w-5 h-5 text-coral" />
          Conectar con Nutricionista
        </CardTitle>
        <CardDescription>
          Si tienes una clave de nutricionista, conéctate para recibir consejos
          personalizados
        </CardDescription>
      </CardHeader>

      <CardContent>
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />

            <span className="text-sm text-red-700">{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
            <Check className="w-4 h-4 text-green-500 flex-shrink-0" />

            <span className="text-sm text-green-700">{success}</span>
          </div>
        )}

        <form onSubmit={handleConnect} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="patientKey">Clave de Nutricionista</Label>
            <Input
              id="patientKey"
              type="text"
              value={patientKey}
              onChange={(e) => setPatientKey(e.target.value)}
              placeholder="Ej: NUT-ABC123-XYZ456"
              className="font-mono"
              disabled={isConnecting}
            />

            <p className="text-xs text-charcoal/60">
              Tu nutricionista te proporcionará esta clave única
            </p>
          </div>

          <div className="flex gap-3">
            <Button
              type="submit"
              disabled={isConnecting || !patientKey.trim()}
              className="flex-1 bg-coral hover:bg-coral/90 text-white"
            >
              {isConnecting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Conectando...
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Conectar
                </>
              )}
            </Button>

            {patientKey && (
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => setPatientKey("")}
                disabled={isConnecting}
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        </form>

        {/* Info Box */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h4 className="font-medium text-blue-900 mb-2">
            ¿Qué pasa cuando me conecto?
          </h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>
              • Tu nutricionista podrá personalizar las respuestas de la IA
            </li>
            <li>• Recibirás consejos basados en su filosofía profesional</li>
            <li>• Las recomendaciones serán más específicas para ti</li>
            <li>• Podrás acceder a planes y seguimiento personalizado</li>
          </ul>
        </div>

        {/* Optional: No key yet */}
        <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-700 mb-2 font-medium">
            ¿No tienes una clave de nutricionista?
          </p>
          <p className="text-xs text-gray-600">
            Puedes usar NutriGuide sin conectarte a una nutricionista. El
            asistente de IA te dará consejos generales de nutrición. Más
            adelante podrás conectarte cuando tengas una clave.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
