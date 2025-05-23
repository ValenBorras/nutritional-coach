'use client';

import { useState } from 'react';
import { RoleSelector } from '../components/auth/role-selector';
import { PatientForm } from '../components/auth/patient-form';
import { NutritionistForm } from '../components/auth/nutritionist-form';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface RegistrationData {
  email: string;
  password: string;
  name: string;
  role: 'patient' | 'nutritionist';
  nutritionistKey?: string;
  dietPhilosophy?: string;
  birthDate?: string;
  height?: number;
  weight?: number;
  gender?: string;
  activityLevel?: string;
  goals?: string[];
  allergies?: string[];
  dietaryRestrictions?: string[];
  medicalConditions?: string[];
  education?: string;
  experience?: number;
  [key: string]: unknown;
}

export default function RegisterPage() {
  const [selectedRole, setSelectedRole] = useState<'patient' | 'nutritionist' | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (data: RegistrationData) => {
    console.log('Iniciando proceso de registro...');
    setIsLoading(true);
    
    try {
      console.log('Enviando datos al servidor:', data);
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const responseData = await res.json();
      console.log('Respuesta del servidor:', responseData);

      if (!res.ok) {
        throw new Error(responseData.message || 'Error al registrar usuario');
      }

      // Show nutritionist key if it was generated
      if (data.role === 'nutritionist' && responseData.nutritionistKey) {
        toast.success('Tu clave de nutricionista es: ' + responseData.nutritionistKey, {
          description: 'Guarda esta clave para compartirla con tus pacientes',
          duration: 10000,
        });
      } else {
        toast.success('Registro exitoso');
      }

      // After successful registration, redirect to dashboard
      router.push('/dashboard');
    } catch (error) {
      console.error('Error durante el registro:', error);
      const message = error instanceof Error ? error.message : 'Ocurrió un error durante el registro';
      toast.error(message);
      return Promise.reject(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container flex items-center justify-center min-h-screen py-12">
      {!selectedRole ? (
        <RoleSelector onSelect={setSelectedRole} />
      ) : selectedRole === 'patient' ? (
        <PatientForm onSubmit={handleSubmit} isLoading={isLoading} />
      ) : (
        <NutritionistForm onSubmit={handleSubmit} isLoading={isLoading} />
      )}
    </div>
  );
} 