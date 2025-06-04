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
import { Copy, Key, Plus, Check } from "lucide-react";

export default function GeneratePatientKey() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateKey = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch("/api/nutritionist/generate-patient-key", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error al generar la clave");
      }

      const data = await response.json();
      setGeneratedKey(data.key);
    } catch (err) {
      console.error("Error generating key:", err);
      setError(err instanceof Error ? err.message : "Error inesperado");
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = async () => {
    if (!generatedKey) return;

    try {
      await navigator.clipboard.writeText(generatedKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Error copying to clipboard:", err);
    }
  };

  return (
    <Card className="bg-gradient-to-br from-warm-sand to-warm-sand/80 border-soft-rose/20 shadow-lg">
      <CardHeader>
        <CardTitle className="text-lg font-medium flex items-center gap-2">
          <Key className="w-5 h-5 text-coral" />
          Generar Clave para Nuevo Paciente
        </CardTitle>
        <CardDescription>
          Crea una clave única para que un nuevo paciente pueda registrarse y
          conectarse contigo
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="text-sm text-red-500 bg-red-50 p-3 rounded-lg">
            {error}
          </div>
        )}

        {!generatedKey ? (
          <Button
            onClick={generateKey}
            disabled={isGenerating}
            className="w-full bg-coral hover:bg-coral/90 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            {isGenerating ? "Generando..." : "Generar Nueva Clave"}
          </Button>
        ) : (
          <div className="space-y-3">
            <div className="bg-white p-4 rounded-lg border border-soft-rose/20">
              <label className="text-sm font-medium text-charcoal mb-2 block">
                Clave Generada:
              </label>
              <div className="flex items-center gap-2">
                <Input
                  value={generatedKey}
                  readOnly
                  className="font-mono text-center text-lg bg-sage-green/10 border-sage-green/30"
                />

                <Button
                  variant="outline"
                  size="icon"
                  onClick={copyToClipboard}
                  className="flex-shrink-0"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-green-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>

            <div className="bg-blue-50 p-3 rounded-lg text-sm text-blue-800">
              <p className="font-medium mb-1">
                📱 Comparte esta clave con tu paciente:
              </p>
              <ul className="text-xs space-y-1">
                <li>• La clave es de un solo uso</li>
                <li>• El paciente la necesita para registrarse</li>
                <li>• Se conectará automáticamente contigo</li>
              </ul>
            </div>

            <Button
              variant="outline"
              onClick={() => {
                setGeneratedKey(null);
                setCopied(false);
              }}
              className="w-full"
            >
              Generar Otra Clave
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
