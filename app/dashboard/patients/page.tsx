// This page is commented out for MVP focus
// TODO: Re-enable after core AI chat functionality is complete

/*
COMPLEX PATIENT MANAGEMENT IMPLEMENTATION COMMENTED OUT FOR MVP

This file originally contained:
- Patient key management for nutritionists
- List of generated and used keys  
- Patient registration tracking
- Key generation with copy functionality
- Patient-nutritionist relationship management

Will be re-enabled post-MVP when core AI chat is stable.
*/

"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/app/components/dashboard-layout";
import { Button } from "@/app/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { UserAvatar } from "@/app/components/ui/user-avatar";
import { Plus, Copy, Check, User, Clock, Key } from "lucide-react";
import { useAuth } from "@/app/components/auth/auth-provider";

interface PatientKey {
  id: string;
  key: string;
  used: boolean;
  used_at: string | null;
  created_at: string | null;
  patient_id: string | null;
  users: {
    name: string;
    email: string;
    image?: string | null;
  } | null;
  isVirtual?: boolean; // Flag for patients connected post-registration
}

export default function PatientsPage() {
  const [patientKeys, setPatientKeys] = useState<PatientKey[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user?.role === "nutritionist") {
      fetchPatientKeys();
    }
  }, [user]);

  const fetchPatientKeys = async () => {
    try {
      const response = await fetch("/api/nutritionist/patient-keys");
      if (response.ok) {
        const data = await response.json();
        setPatientKeys(data.keys || []);
      } else {
        setError("Error al cargar las claves");
      }
    } catch (error) {
      console.error("Error fetching patient keys:", error);
      setError("Error al cargar las claves");
    } finally {
      setIsLoading(false);
    }
  };

  const generateNewKey = async () => {
    setIsGenerating(true);
    setError(null);
    try {
      const response = await fetch("/api/nutritionist/generate-patient-key", {
        method: "POST",
      });

      if (response.ok) {
        const data = await response.json();
        await fetchPatientKeys(); // Refresh the list
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Error al generar la clave");
      }
    } catch (error) {
      console.error("Error generating key:", error);
      setError("Error al generar la clave");
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = async (key: string) => {
    try {
      await navigator.clipboard.writeText(key);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    } catch (error) {
      setError("Error al copiar la clave");
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Fecha no disponible";
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (user?.role !== "nutritionist") {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-charcoal/70">
            Esta página solo está disponible para nutricionistas.
          </p>
        </div>
      </DashboardLayout>
    );
  }

  const unusedKeys = patientKeys.filter((key) => !key.used);
  const usedKeys = patientKeys.filter((key) => key.used);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-marcellus text-charcoal">
              Gestión de Pacientes
            </h1>
            <p className="text-charcoal/70 mt-1">
              Genera claves únicas para añadir nuevos pacientes a tu práctica
            </p>
          </div>
          <Button
            onClick={generateNewKey}
            disabled={isGenerating}
            className="bg-coral hover:bg-coral/90 text-mist-white gap-2"
          >
            <Plus size={16} />
            {isGenerating ? "Generando..." : "Añadir Paciente"}
          </Button>
        </div>

        {error && (
          <div className="text-sm text-red-500 bg-red-50 p-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-warm-sand border-soft-rose/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium flex items-center gap-2">
                <User className="w-5 h-5 text-sage-green" />
                Pacientes Activos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-marcellus text-charcoal">
                {usedKeys.length}
              </div>
              <p className="text-sm text-charcoal/70">
                Total de pacientes conectados
              </p>
            </CardContent>
          </Card>

          <Card className="bg-warm-sand border-soft-rose/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium flex items-center gap-2">
                <Key className="w-5 h-5 text-coral" />
                Claves Disponibles
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-marcellus text-charcoal">
                {unusedKeys.length}
              </div>
              <p className="text-sm text-charcoal/70">Listas para usar</p>
            </CardContent>
          </Card>

          <Card className="bg-warm-sand border-soft-rose/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium flex items-center gap-2">
                <Clock className="w-5 h-5 text-soft-rose" />
                Total de Claves
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-marcellus text-charcoal">
                {patientKeys.filter((key) => !key.isVirtual).length}
              </div>
              <p className="text-sm text-charcoal/70">Generadas hasta ahora</p>
            </CardContent>
          </Card>
        </div>

        {/* Available Keys */}
        {unusedKeys.length > 0 && (
          <Card className="bg-warm-sand border-soft-rose/20">
            <CardHeader>
              <CardTitle className="text-lg font-medium text-charcoal">
                Claves Disponibles
              </CardTitle>
              <p className="text-sm text-charcoal/70">
                Comparte estas claves con tus nuevos pacientes para que puedan
                registrarse
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {unusedKeys.map((keyRecord) => (
                  <div
                    key={keyRecord.id}
                    className="flex items-center justify-between p-4 bg-mist-white rounded-lg border border-soft-rose/20"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-coral/20 flex items-center justify-center">
                        <Key className="w-5 h-5 text-coral" />
                      </div>
                      <div>
                        <div className="font-mono text-lg font-semibold text-charcoal">
                          {keyRecord.key}
                        </div>
                        <div className="text-sm text-charcoal/70">
                          Generada el {formatDate(keyRecord.created_at)}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="secondary"
                        className="bg-sage-green/20 text-sage-green"
                      >
                        Disponible
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(keyRecord.key)}
                        className="border-coral text-coral hover:bg-coral/10"
                      >
                        {copiedKey === keyRecord.key ? (
                          <Check size={16} />
                        ) : (
                          <Copy size={16} />
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Active Patients */}
        {usedKeys.length > 0 && (
          <Card className="bg-warm-sand border-soft-rose/20">
            <CardHeader>
              <CardTitle className="text-lg font-medium text-charcoal">
                Pacientes Activos
              </CardTitle>
              <p className="text-sm text-charcoal/70">
                Todos los pacientes conectados a tu práctica
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {usedKeys.map((keyRecord) => (
                  <div
                    key={keyRecord.id}
                    className="flex items-center justify-between p-4 bg-mist-white rounded-lg border border-soft-rose/20"
                  >
                    <div className="flex items-center gap-4">
                      <UserAvatar
                        src={keyRecord.users?.image}
                        name={keyRecord.users?.name}
                        size="md"
                      />

                      <div>
                        <div className="font-semibold text-charcoal">
                          {keyRecord.users?.name || "Usuario sin nombre"}
                        </div>
                        <div className="text-sm text-charcoal/70">
                          {keyRecord.users?.email || "Sin email"}
                        </div>
                        <div className="text-xs text-charcoal/60">
                          {keyRecord.isVirtual
                            ? "Conectado a tu práctica"
                            : `Clave: ${keyRecord.key} • Registrado el ${formatDate(keyRecord.used_at)}`}
                        </div>
                      </div>
                    </div>
                    <Badge
                      variant="secondary"
                      className="bg-soft-rose/20 text-soft-rose"
                    >
                      Activo
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {isLoading && (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-coral"></div>
          </div>
        )}

        {!isLoading && patientKeys.length === 0 && (
          <Card className="bg-warm-sand border-soft-rose/20">
            <CardContent className="text-center py-12">
              <Key className="w-12 h-12 text-charcoal/40 mx-auto mb-4" />

              <h3 className="text-lg font-medium text-charcoal mb-2">
                No tienes claves generadas
              </h3>
              <p className="text-charcoal/70 mb-6">
                Genera tu primera clave para comenzar a añadir pacientes
              </p>
              <Button
                onClick={generateNewKey}
                disabled={isGenerating}
                className="bg-coral hover:bg-coral/90 text-mist-white gap-2"
              >
                <Plus size={16} />
                {isGenerating ? "Generando..." : "Generar Primera Clave"}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
