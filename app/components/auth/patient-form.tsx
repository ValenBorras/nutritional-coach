"use client";

import { useState } from "react";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import { Textarea } from "@/app/components/ui/textarea";
import { DateSlider } from "@/app/components/ui/date-slider";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";

interface PatientFormProps {
  onSubmit?: (data: any) => Promise<void>;
  isLoading?: boolean;
  mode?: "register" | "oauth-onboarding";
  authUser?: any;
}

export function PatientForm({
  onSubmit,
  isLoading = false,
  mode = "register",
  authUser,
}: PatientFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [nutritionistKey, setNutritionistKey] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { refreshUser } = useAuth();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      console.log("Iniciando envío del formulario...");
      const formData = new FormData(e.currentTarget);

      // Fix birth date handling
      const birthDateValue = formData.get("birthDate") as string;
      let birthdate = null;

      if (birthDateValue) {
        // The input type="date" returns YYYY-MM-DD format
        // We just need to ensure it's a valid date and format it properly
        const dateObj = new Date(birthDateValue + "T00:00:00Z");
        if (!isNaN(dateObj.getTime())) {
          birthdate = dateObj.toISOString().split("T")[0]; // YYYY-MM-DD format
        } else {
          throw new Error("Fecha de nacimiento inválida");
        }
      }

      let data;

      if (mode === "oauth-onboarding") {
        // OAuth onboarding mode - use auth user data
        data = {
          id: authUser?.id,
          email: authUser?.email,
          name:
            (formData.get("name") as string) ||
            authUser?.user_metadata?.full_name ||
            authUser?.user_metadata?.name,
          height: parseFloat(formData.get("height") as string),
          weight: parseFloat(formData.get("weight") as string),
          birthDate: birthdate,
          gender: formData.get("gender") as string,
          activityLevel: formData.get("activityLevel") as string,
          goals: formData.get("goals") as string,
          allergies:
            (formData.get("allergies") as string)
              ?.split(",")
              .map((a) => a.trim())
              .filter(Boolean) || [],
          dietaryRestrictions:
            (formData.get("dietaryRestrictions") as string)
              ?.split(",")
              .map((r) => r.trim())
              .filter(Boolean) || [],
          medicalConditions:
            (formData.get("medicalConditions") as string)
              ?.split(",")
              .map((c) => c.trim())
              .filter(Boolean) || [],
          nutritionistKey: nutritionistKey || null,
          role: "patient",
        };

        // Call OAuth user creation API
        const response = await fetch("/api/user/create-oauth", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Error al crear usuario");
        }

        // Refresh user data and redirect to dashboard
        await refreshUser();
        router.push("/dashboard");
      } else {
        // Regular registration mode
        data = {
          email: formData.get("email") as string,
          password: formData.get("password") as string,
          name: formData.get("name") as string,
          height: parseFloat(formData.get("height") as string),
          weight: parseFloat(formData.get("weight") as string),
          birthDate: birthdate,
          gender: formData.get("gender") as string,
          activityLevel: formData.get("activityLevel") as string,
          goals: formData.get("goals") as string,
          allergies:
            (formData.get("allergies") as string)
              ?.split(",")
              .map((a) => a.trim())
              .filter(Boolean) || [],
          dietaryRestrictions:
            (formData.get("dietaryRestrictions") as string)
              ?.split(",")
              .map((r) => r.trim())
              .filter(Boolean) || [],
          medicalConditions:
            (formData.get("medicalConditions") as string)
              ?.split(",")
              .map((c) => c.trim())
              .filter(Boolean) || [],
          nutritionistKey: nutritionistKey || null,
          role: "patient",
        };

        if (onSubmit) {
          await onSubmit(data);
        }
      }

      console.log("Registro completado con éxito");
    } catch (err) {
      console.error("Error en el formulario:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Ocurrió un error durante el registro",
      );
    } finally {
      setLoading(false);
    }
  };

  const showLoading = loading || isLoading;

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-marcellus">
          Registro de Paciente
        </CardTitle>
        <CardDescription>
          Completa tu perfil para recibir recomendaciones personalizadas
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre Completo</Label>
              <Input
                id="name"
                name="name"
                defaultValue={
                  mode === "oauth-onboarding"
                    ? authUser?.user_metadata?.full_name ||
                      authUser?.user_metadata?.name ||
                      ""
                    : ""
                }
                required
              />
            </div>
            {mode !== "oauth-onboarding" && (
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" required />
              </div>
            )}
          </div>

          {mode !== "oauth-onboarding" && (
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <Input id="password" name="password" type="password" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="birthDate">Fecha de Nacimiento</Label>
                <DateSlider name="birthDate" required />
              </div>
            </div>
          )}

          {mode === "oauth-onboarding" && (
            <div className="space-y-2">
              <Label htmlFor="birthDate">Fecha de Nacimiento</Label>
              <DateSlider name="birthDate" required />
            </div>
          )}

          <div className="grid md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="height">Altura (cm)</Label>
              <Input
                id="height"
                name="height"
                type="number"
                step="0.01"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="weight">Peso (kg)</Label>
              <Input
                id="weight"
                name="weight"
                type="number"
                step="0.01"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gender">Género</Label>
              <Select name="gender" required>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Masculino</SelectItem>
                  <SelectItem value="female">Femenino</SelectItem>
                  <SelectItem value="other">Otro</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="activityLevel">Nivel de Actividad</Label>
            <Select name="activityLevel" required>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar nivel de actividad" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sedentary">Sedentario</SelectItem>
                <SelectItem value="light">Actividad Ligera</SelectItem>
                <SelectItem value="moderate">Actividad Moderada</SelectItem>
                <SelectItem value="active">Muy Activo</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="goals">Objetivos</Label>
            <Textarea
              id="goals"
              name="goals"
              placeholder="Describe tus objetivos de salud y nutrición"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="allergies">Alergias</Label>
            <Input
              id="allergies"
              name="allergies"
              placeholder="Separa las alergias con comas"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="dietaryRestrictions">
              Restricciones Dietéticas
            </Label>
            <Input
              id="dietaryRestrictions"
              name="dietaryRestrictions"
              placeholder="Separa las restricciones con comas"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="medicalConditions">Condiciones Médicas</Label>
            <Input
              id="medicalConditions"
              name="medicalConditions"
              placeholder="Separa las condiciones con comas"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="nutritionistKey">
              Clave de Nutricionista (opcional)
            </Label>
            <Input
              id="nutritionistKey"
              value={nutritionistKey}
              onChange={(e) => setNutritionistKey(e.target.value)}
              placeholder="Si tienes un nutricionista, ingresa su clave aquí"
            />
          </div>

          {error && <div className="text-sm text-red-500 mt-2">{error}</div>}
        </CardContent>
        <CardFooter>
          <Button
            type="submit"
            className="w-full bg-coral hover:bg-coral/90"
            disabled={showLoading}
          >
            {showLoading ? "Registrando..." : "Registrarse"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
