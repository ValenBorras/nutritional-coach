'use client';

import { useEffect, useState } from 'react';
import { Button } from "@/app/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card"
import DashboardLayout from "@/app/components/dashboard-layout"
import NutritionChatbot from "@/app/components/nutrition-chatbot"
import GeneratePatientKey from "@/app/components/generate-patient-key"
import ConnectNutritionist from "@/app/components/connect-nutritionist"
import { Calendar, MessageSquare, Activity, Users, Bot } from "lucide-react"
import { PageTransition, StaggerContainer, StaggerItem, FadeIn } from "@/app/components/ui/page-transition"
import { motion } from 'framer-motion'
import { useAuth } from '@/app/components/auth/auth-provider'

export default function Dashboard() {
  const { user, profile, loading } = useAuth();
  const [aiConfigured, setAiConfigured] = useState(false);
  const [checkingAi, setCheckingAi] = useState(true);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-coral"></div>
        </div>
      </DashboardLayout>
    );
  }

  const isNutritionist = user?.role === 'nutritionist';
  const isPatient = user?.role === 'patient';

  // Check AI configuration status for nutritionists
  useEffect(() => {
    if (isNutritionist && user?.id) {
      checkAIConfiguration();
    } else {
      setCheckingAi(false);
    }
  }, [user?.id, isNutritionist]);

  const checkAIConfiguration = async () => {
    try {
      const response = await fetch('/api/nutritionist/ai-rules');
      if (response.ok) {
        const data = await response.json();
        setAiConfigured(!!data.rules && !!data.rules.diet_philosophy);
      }
    } catch (error) {
      console.error('Error checking AI configuration:', error);
    } finally {
      setCheckingAi(false);
    }
  };

  return (
    <DashboardLayout>
      <PageTransition>
        <FadeIn delay={0.1}>
          <div className="mb-8">
            <motion.h1 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="text-3xl font-marcellus text-charcoal mb-2"
            >
              {isNutritionist ? '¡Bienvenido!' : '¡Hola!'} {user?.name}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
              className="text-charcoal/70"
            >
              {isNutritionist 
                ? 'Gestiona tu práctica y ayuda a tus pacientes con IA personalizada'
                : 'Tu asistente nutricional está aquí para ayudarte a alcanzar tus objetivos'
              }
            </motion.p>
          </div>
        </FadeIn>

        <StaggerContainer staggerChildren={0.15} className="space-y-6">
          {/* Quick Stats Cards */}
          <StaggerItem>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <motion.div whileHover={{ y: -5, transition: { duration: 0.2 } }}>
                <Card className="bg-gradient-to-br from-coral to-coral/80 text-white shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white/80 text-sm">
                          {isNutritionist ? 'Pacientes Activos' : 'Días Activos'}
                        </p>
                        <p className="text-3xl font-bold">
                          {isNutritionist ? '0' : '7'}
                        </p>
                      </div>
                      <Users className="w-8 h-8 text-white/80" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div whileHover={{ y: -5, transition: { duration: 0.2 } }}>
                <Card className="bg-gradient-to-br from-sage-green to-sage-green/80 text-white shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white/80 text-sm">
                          {isNutritionist ? 'Consultas IA' : 'Conversaciones'}
                        </p>
                        <p className="text-3xl font-bold">
                          {isNutritionist ? '0' : '3'}
                        </p>
                      </div>
                      <MessageSquare className="w-8 h-8 text-white/80" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div whileHover={{ y: -5, transition: { duration: 0.2 } }}>
                <Card className="bg-gradient-to-br from-soft-rose to-soft-rose/80 text-white shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white/80 text-sm">
                          {isNutritionist ? 'Claves Generadas' : 'Progreso'}
                        </p>
                        <p className="text-3xl font-bold">
                          {isNutritionist ? '0' : '85%'}
                        </p>
                      </div>
                      <Activity className="w-8 h-8 text-white/80" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </StaggerItem>

          {/* AI Chat - Main Component */}
          <StaggerItem>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* AI Chat - Takes up most space */}
              <div className="lg:col-span-3">
                <motion.div
                  whileHover={{ scale: 1.005 }}
                  transition={{ duration: 0.2 }}
                  className="h-full"
                >
                  <div className="h-[600px]"> {/* Fixed height for better chat experience */}
                    <NutritionChatbot />
                  </div>
                </motion.div>
              </div>

              {/* Compact Sidebar - Role specific content */}
              <div className="lg:col-span-1 space-y-4">
                {isNutritionist && (
                  <>
                    {/* Nutritionist: Quick Key Generation */}
                    <Card className="bg-gradient-to-br from-warm-sand to-warm-sand/80 border-soft-rose/20 shadow-lg">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                          <Bot className="w-4 h-4 text-coral" />
                          Generar Clave
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <Button variant="outline" size="sm" className="w-full text-xs">
                          + Nuevo Paciente
                        </Button>
                      </CardContent>
                    </Card>
                    
                    {/* Nutritionist: AI Status */}
                    <Card className="bg-gradient-to-br from-warm-sand to-warm-sand/80 border-soft-rose/20 shadow-lg">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                          <Bot className="w-4 h-4 text-coral" />
                          Estado IA
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="text-xs text-charcoal/70 mb-2">
                          Filosofía: {checkingAi ? (
                            <span className="font-medium text-gray-500">Verificando...</span>
                          ) : aiConfigured ? (
                            <span className="font-medium text-green-600">✓ Configurada</span>
                          ) : (
                            <span className="font-medium text-red-500">No configurada</span>
                          )}
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full text-xs"
                          onClick={() => window.location.href = '/dashboard/ai-config'}
                          disabled={checkingAi}
                        >
                          {aiConfigured ? 'Editar IA' : 'Configurar IA'}
                        </Button>
                      </CardContent>
                    </Card>
                  </>
                )}

                {isPatient && (
                  <>
                    {/* Patient: Quick Status */}
                    <Card className="bg-gradient-to-br from-warm-sand to-warm-sand/80 border-soft-rose/20 shadow-lg">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                          <Activity className="w-4 h-4 text-sage-green" />
                          Hoy
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0 space-y-2">
                        <div className="flex justify-between text-xs">
                          <span>Objetivos</span>
                          <span className="font-medium">2/3</span>
                        </div>
                        {user?.nutritionist_id && (
                          <div className="text-xs text-coral">✓ Nutricionista conectado</div>
                        )}
                      </CardContent>
                    </Card>

                    {/* Patient: Quick Actions */}
                    <Card className="bg-gradient-to-br from-warm-sand to-warm-sand/80 border-soft-rose/20 shadow-lg">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-soft-rose" />
                          Acciones
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0 space-y-2">
                        <Button variant="outline" size="sm" className="w-full text-xs justify-start" disabled>
                          📊 Registrar
                        </Button>
                        <Button variant="outline" size="sm" className="w-full text-xs justify-start" disabled>
                          🎯 Objetivos
                        </Button>
                      </CardContent>
                    </Card>
                  </>
                )}

                {/* AI Chat Tip */}
                <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 shadow-lg">
                  <CardContent className="p-4">
                    <div className="text-center">
                      <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center mx-auto mb-2">
                        <MessageSquare className="w-3 h-3 text-white" />
                      </div>
                      <h3 className="font-semibold text-blue-900 mb-1 text-xs">
                        💡 Tip
                      </h3>
                      <p className="text-blue-800 text-xs">
                        Pregunta sobre recetas, nutrición o tus objetivos de salud
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </StaggerItem>

          {/* Full Width Tools - Below the main content */}
          <StaggerItem>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {isNutritionist && (
                <GeneratePatientKey />
              )}
              
              {/* Connect Nutritionist for Patients without one */}
              {isPatient && !user?.nutritionist_id && (
                <ConnectNutritionist />
              )}
              
              {/* Information Card */}
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                      <MessageSquare className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-blue-900 mb-2">
                        🚀 Estás en la versión MVP de NutriGuide
                      </h3>
                      <p className="text-blue-800 text-sm mb-3">
                        Esta es una versión básica enfocada en el chat con IA. Próximamente agregaremos:
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-blue-700">
                        <div>• 📝 Planificación de comidas</div>
                        <div>• 📊 Seguimiento nutricional</div>
                        <div>• 👥 Gestión de pacientes</div>
                        <div>• ⚙️ Configuración avanzada</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </StaggerItem>
        </StaggerContainer>
      </PageTransition>
    </DashboardLayout>
  )
}
