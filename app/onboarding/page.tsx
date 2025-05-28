'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { PageTransition, FadeIn } from '../components/ui/page-transition';
import { PatientForm } from '../components/auth/patient-form';
import { NutritionistForm } from '../components/auth/nutritionist-form';

export default function OnboardingPage() {
  const { authUser, user, loading } = useAuth();
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<'patient' | 'nutritionist' | null>(null);

  useEffect(() => {
    // If not authenticated, redirect to login
    if (!loading && !authUser) {
      router.push('/login');
      return;
    }

    // If user already exists (completed onboarding), redirect to dashboard
    if (!loading && user) {
      router.push('/dashboard');
      return;
    }
  }, [authUser, user, loading, router]);

  // Show loading while checking auth state
  if (loading) {
    return (
      <PageTransition className="min-h-screen bg-gradient-to-br from-warm-sand via-warm-sand/90 to-sage/20">
        <div className="container flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-coral mx-auto mb-4"></div>
            <p className="text-charcoal font-marcellus">Cargando...</p>
          </div>
        </div>
      </PageTransition>
    );
  }

  // Don't render anything if not authenticated or already has user data
  if (!authUser || user) {
    return null;
  }

  const handleRoleSelection = (role: 'patient' | 'nutritionist') => {
    setSelectedRole(role);
  };

  const handleBack = () => {
    setSelectedRole(null);
  };

  return (
    <PageTransition className="min-h-screen bg-gradient-to-br from-warm-sand via-warm-sand/90 to-sage/20">
      <FadeIn className="container flex items-center justify-center min-h-screen py-12">
        {!selectedRole ? (
          // Role selection screen
          <Card className="w-full max-w-2xl mx-auto shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
            <CardHeader className="pb-8 text-center">
              <CardTitle className="text-3xl font-marcellus tracking-wide text-charcoal">
                ¡Bienvenido a NutriGuide!
              </CardTitle>
              <CardDescription className="text-lg font-marcellus text-charcoal/70">
                Hola {authUser.user_metadata?.full_name || authUser.user_metadata?.name || authUser.email?.split('@')[0]}, 
                para completar tu registro, selecciona tu rol:
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Patient Option */}
                <Card 
                  className="cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105 border-2 border-transparent hover:border-coral/30"
                  onClick={() => handleRoleSelection('patient')}
                >
                  <CardContent className="p-6 text-center">
                    <div className="w-16 h-16 bg-coral/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-coral" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-marcellus text-charcoal mb-2">Soy Paciente</h3>
                    <p className="text-charcoal/70 font-marcellus text-sm">
                      Quiero mejorar mi alimentación y recibir orientación nutricional personalizada
                    </p>
                  </CardContent>
                </Card>

                {/* Nutritionist Option */}
                <Card 
                  className="cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105 border-2 border-transparent hover:border-sage/30"
                  onClick={() => handleRoleSelection('nutritionist')}
                >
                  <CardContent className="p-6 text-center">
                    <div className="w-16 h-16 bg-sage/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-sage" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-marcellus text-charcoal mb-2">Soy Nutricionista</h3>
                    <p className="text-charcoal/70 font-marcellus text-sm">
                      Soy profesional de la nutrición y quiero ayudar a mis pacientes
                    </p>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        ) : (
          // Form screen based on selected role
          <div className="w-full max-w-4xl mx-auto">
            <div className="mb-6">
              <Button
                variant="ghost"
                onClick={handleBack}
                className="font-marcellus text-charcoal hover:text-coral"
              >
                ← Volver a selección de rol
              </Button>
            </div>
            
            {selectedRole === 'patient' ? (
              <PatientForm 
                mode="oauth-onboarding"
                authUser={authUser}
              />
            ) : (
              <NutritionistForm 
                mode="oauth-onboarding"
                authUser={authUser}
              />
            )}
          </div>
        )}
      </FadeIn>
    </PageTransition>
  );
} 