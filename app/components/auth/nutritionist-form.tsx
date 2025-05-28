'use client';

import { useState } from 'react';
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Textarea } from "@/app/components/ui/textarea";
import { Badge } from "@/app/components/ui/badge";
import { X } from "lucide-react";
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';

interface NutritionistFormProps {
  onSubmit?: (data: any) => Promise<void>;
  isLoading?: boolean;
  mode?: 'register' | 'oauth-onboarding';
  authUser?: any;
}

export function NutritionistForm({ onSubmit, isLoading = false, mode = 'register', authUser }: NutritionistFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [specializations, setSpecializations] = useState<string[]>([]);
  const [certifications, setCertifications] = useState<string[]>([]);
  const [newSpecialization, setNewSpecialization] = useState('');
  const [newCertification, setNewCertification] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { refreshUser } = useAuth();

  const handleAddSpecialization = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && newSpecialization.trim()) {
      e.preventDefault();
      setSpecializations([...specializations, newSpecialization.trim()]);
      setNewSpecialization('');
    }
  };

  const handleAddCertification = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && newCertification.trim()) {
      e.preventDefault();
      setCertifications([...certifications, newCertification.trim()]);
      setNewCertification('');
    }
  };

  const handleRemoveSpecialization = (index: number) => {
    setSpecializations(specializations.filter((_, i) => i !== index));
  };

  const handleRemoveCertification = (index: number) => {
    setCertifications(certifications.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const formData = new FormData(e.currentTarget);
      let data;

      if (mode === 'oauth-onboarding') {
        // OAuth onboarding mode - use auth user data
        data = {
          id: authUser?.id,
          email: authUser?.email,
          name: formData.get('name') as string || authUser?.user_metadata?.full_name || authUser?.user_metadata?.name,
          experience: parseInt(formData.get('experience') as string),
          dietPhilosophy: formData.get('dietPhilosophy') as string,
          specializations,
          certifications,
          role: 'nutritionist'
        };

        // Call OAuth user creation API with nutritionist data
        const response = await fetch('/api/user/create-oauth-nutritionist', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Error al crear usuario');
        }

        // Refresh user data and redirect to dashboard
        await refreshUser();
        router.push('/dashboard');
      } else {
        // Regular registration mode
        data = {
          email: formData.get('email') as string,
          password: formData.get('password') as string,
          name: formData.get('name') as string,
          experience: parseInt(formData.get('experience') as string),
          dietPhilosophy: formData.get('dietPhilosophy') as string,
          specializations,
          certifications,
          role: 'nutritionist'
        };

        if (onSubmit) {
          await onSubmit(data);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ocurrió un error durante el registro');
    } finally {
      setLoading(false);
    }
  };

  const showLoading = loading || isLoading;

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-marcellus">Registro de Nutricionista</CardTitle>
        <CardDescription>
          Completa tu perfil profesional para comenzar a atender pacientes
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
                defaultValue={mode === 'oauth-onboarding' ? 
                  (authUser?.user_metadata?.full_name || authUser?.user_metadata?.name || '') : 
                  ''
                }
                required 
              />
            </div>
            {mode !== 'oauth-onboarding' && (
              <div className="space-y-2">
                <Label htmlFor="email">Email Profesional</Label>
                <Input id="email" name="email" type="email" required />
              </div>
            )}
          </div>

          {mode !== 'oauth-onboarding' && (
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <Input id="password" name="password" type="password" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="experience">Años de Experiencia</Label>
                <Input id="experience" name="experience" type="number" min="0" required />
              </div>
            </div>
          )}

          {mode === 'oauth-onboarding' && (
            <div className="space-y-2">
              <Label htmlFor="experience">Años de Experiencia</Label>
              <Input id="experience" name="experience" type="number" min="0" required />
            </div>
          )}

          <div className="space-y-2">
            <Label>Especializaciones</Label>
            <Input 
              value={newSpecialization}
              onChange={(e) => setNewSpecialization(e.target.value)}
              onKeyDown={handleAddSpecialization}
              placeholder="Presiona Enter para agregar una especialización"
            />
            <div className="flex flex-wrap gap-2 mt-2">
              {specializations.map((spec, index) => (
                <Badge key={index} variant="secondary" className="pl-2 pr-1 py-1">
                  {spec}
                  <button
                    type="button"
                    onClick={() => handleRemoveSpecialization(index)}
                    className="ml-1 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Certificaciones</Label>
            <Input 
              value={newCertification}
              onChange={(e) => setNewCertification(e.target.value)}
              onKeyDown={handleAddCertification}
              placeholder="Presiona Enter para agregar una certificación"
            />
            <div className="flex flex-wrap gap-2 mt-2">
              {certifications.map((cert, index) => (
                <Badge key={index} variant="secondary" className="pl-2 pr-1 py-1">
                  {cert}
                  <button
                    type="button"
                    onClick={() => handleRemoveCertification(index)}
                    className="ml-1 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="dietPhilosophy">Filosofía Dietética</Label>
            <Textarea 
              id="dietPhilosophy" 
              name="dietPhilosophy" 
              placeholder="Describe tu enfoque y filosofía en la nutrición"
              required 
            />
          </div>

          {error && (
            <div className="text-sm text-red-500 mt-2">{error}</div>
          )}
        </CardContent>
        <CardFooter>
          <Button 
            type="submit" 
            className="w-full bg-coral hover:bg-coral/90" 
            disabled={showLoading}
          >
            {showLoading ? 'Registrando...' : 'Registrarse'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
} 