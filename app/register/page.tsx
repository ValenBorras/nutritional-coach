'use client';

import { useState } from 'react';
import { RoleSelector } from '../components/auth/role-selector';
import { PatientForm } from '../components/auth/patient-form';
import { NutritionistForm } from '../components/auth/nutritionist-form';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { PageTransition, FadeIn } from '../components/ui/page-transition';
import { motion, AnimatePresence } from 'framer-motion';

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
        toast.success('Registro exitoso - Revisa tu email para verificar tu cuenta');
      }

      // After successful registration, redirect to check email page
      router.push(`/check-email?email=${encodeURIComponent(data.email)}`);
    } catch (error) {
      console.error('Error durante el registro:', error);
      const message = error instanceof Error ? error.message : 'Ocurrió un error durante el registro';
      toast.error(message);
      return Promise.reject(error);
    } finally {
      setIsLoading(false);
    }
  };

  const slideVariants = {
    enter: { x: 50, opacity: 0 },
    center: { x: 0, opacity: 1 },
    exit: { x: -50, opacity: 0 }
  };

  return (
    <PageTransition className="min-h-screen bg-gradient-to-br from-warm-sand via-warm-sand/90 to-sage/20">
      <FadeIn className="container flex items-center justify-center min-h-screen py-12">
        <AnimatePresence mode="wait">
          {!selectedRole ? (
            <motion.div
              key="role-selector"
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.4, ease: "easeInOut" }}
            >
              <RoleSelector onSelect={setSelectedRole} />
            </motion.div>
          ) : selectedRole === 'patient' ? (
            <motion.div
              key="patient-form"
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.4, ease: "easeInOut" }}
            >
              <PatientForm onSubmit={handleSubmit} isLoading={isLoading} />
            </motion.div>
          ) : (
            <motion.div
              key="nutritionist-form"
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.4, ease: "easeInOut" }}
            >
              <NutritionistForm onSubmit={handleSubmit} isLoading={isLoading} />
            </motion.div>
          )}
        </AnimatePresence>
      </FadeIn>
    </PageTransition>
  );
} 