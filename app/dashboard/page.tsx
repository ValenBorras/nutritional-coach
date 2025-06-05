"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/app/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import DashboardLayout from "@/app/components/dashboard-layout";
import NutritionChatbot from "@/app/components/nutrition-chatbot-v2";
import GeneratePatientKey from "@/app/components/generate-patient-key";
import ConnectNutritionist from "@/app/components/connect-nutritionist";
import { TrialBanner } from "@/app/components/TrialBanner";
import { Calendar, MessageSquare, Activity, Users, Bot } from "lucide-react";
import {
  PageTransition,
  StaggerContainer,
  StaggerItem,
  FadeIn,
} from "@/app/components/ui/page-transition";
import { motion } from "framer-motion";
import { useAuth } from "@/app/components/auth/auth-provider";

interface NutritionistStats {
  activePatients: number;
  aiConsultations: number;
  generatedKeys: number;
}

interface PatientStats {
  activeDays: number;
  conversations: number;
  progress: number;
  messagesCount: number;
}

export default function Dashboard() {
  const { user, profile, loading } = useAuth();
  const [aiConfigured, setAiConfigured] = useState(false);
  const [checkingAi, setCheckingAi] = useState(true);
  const [nutritionistStats, setNutritionistStats] = useState<NutritionistStats>(
    {
      activePatients: 0,
      aiConsultations: 0,
      generatedKeys: 0,
    },
  );
  const [patientStats, setPatientStats] = useState<PatientStats>({
    activeDays: 0,
    conversations: 0,
    progress: 0,
    messagesCount: 0,
  });
  const [loadingStats, setLoadingStats] = useState(true);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);

  const isNutritionist = user?.role === "nutritionist";
  const isPatient = user?.role === "patient";

  const checkAIConfiguration = useCallback(async () => {
    try {
      const response = await fetch("/api/nutritionist/ai-rules");
      if (response.ok) {
        const data = await response.json();
        setAiConfigured(!!data.rules && !!data.rules.diet_philosophy);
      }
    } catch (error) {
      console.error("Error checking AI configuration:", error);
    } finally {
      setCheckingAi(false);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      setLoadingStats(true);

      if (isNutritionist) {
        const response = await fetch("/api/nutritionist/stats");
        if (response.ok) {
          const data = await response.json();
          setNutritionistStats(data);
        }
      } else if (isPatient) {
        const response = await fetch("/api/patient/stats");
        if (response.ok) {
          const data = await response.json();
          setPatientStats(data);
        }
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoadingStats(false);
    }
  }, [isNutritionist, isPatient]);

  // Check AI configuration status for nutritionists
  useEffect(() => {
    if (isNutritionist && user?.id) {
      checkAIConfiguration();
    } else {
      setCheckingAi(false);
    }
  }, [user?.id, isNutritionist, checkAIConfiguration]);

  // Fetch statistics based on user role
  useEffect(() => {
    if (user?.id) {
      fetchStats();
    }
  }, [user?.id, fetchStats]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-coral"></div>
        </div>
      </DashboardLayout>
    );
  }

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
              {isNutritionist ? "¡Bienvenido!" : "¡Hola!"} {user?.name}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
              className="text-charcoal/70"
            >
              {isNutritionist
                ? "Gestiona tu práctica y ayuda a tus pacientes con IA personalizada"
                : "Tu asistente nutricional está aquí para ayudarte a alcanzar tus objetivos"}
            </motion.p>
          </div>
        </FadeIn>

        {isPatient && <TrialBanner />}

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
                          {isNutritionist
                            ? "Pacientes Activos"
                            : "Días Activos"}
                        </p>
                        <div className="text-3xl font-bold">
                          {loadingStats ? (
                            <div className="animate-pulse bg-white/20 h-8 w-12 rounded"></div>
                          ) : isNutritionist ? (
                            nutritionistStats.activePatients
                          ) : (
                            patientStats.activeDays
                          )}
                        </div>
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
                          {isNutritionist ? "Consultas IA" : "Conversaciones"}
                        </p>
                        <div className="text-3xl font-bold">
                          {loadingStats ? (
                            <div className="animate-pulse bg-white/20 h-8 w-12 rounded"></div>
                          ) : isNutritionist ? (
                            nutritionistStats.aiConsultations
                          ) : (
                            patientStats.conversations
                          )}
                        </div>
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
                          {isNutritionist ? "Claves Generadas" : "Progreso"}
                        </p>
                        <div className="text-3xl font-bold">
                          {loadingStats ? (
                            <div className="animate-pulse bg-white/20 h-8 w-12 rounded"></div>
                          ) : isNutritionist ? (
                            nutritionistStats.generatedKeys
                          ) : (
                            `${patientStats.progress}%`
                          )}
                        </div>
                      </div>
                      <Activity className="w-8 h-8 text-white/80" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </StaggerItem>

          {/* Main AI Chat - Full Width with Sidebar */}
          <StaggerItem>
            <div className="h-[calc(100vh-380px)] min-h-[600px]">
              <motion.div
                whileHover={{ scale: 1.002 }}
                transition={{ duration: 0.2 }}
                className="h-full"
              >
                <NutritionChatbot
                  chatId={selectedChatId}
                  onChatChange={setSelectedChatId}
                  showChatList={true}
                />
              </motion.div>
            </div>
          </StaggerItem>

          {/* Bottom Section - Conditional based on user role */}
          <StaggerItem>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {isNutritionist && <GeneratePatientKey />}

              {/* Connect Nutritionist for Patients without one */}
              {isPatient && !user?.nutritionist_id && <ConnectNutritionist />}

              {/* Information Card */}
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                      <MessageSquare className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-blue-900 mb-2">
                        🚀{" "}
                        {isNutritionist
                          ? "NutriGuide IA para Profesionales"
                          : "NutriGuide IA"}
                      </h3>
                      <p className="text-blue-800 text-sm mb-3">
                        {isNutritionist
                          ? "Tu asistente de IA personalizado que extiende tu práctica profesional con orientación automatizada para tus pacientes."
                          : "Tu asistente nutricional inteligente que guarda automáticamente todas tus conversaciones."}
                      </p>
                      <div className="grid grid-cols-1 gap-2 text-sm text-blue-700">
                        {isNutritionist ? (
                          <>
                            <div>
                              • 🎯 IA configurada con tu filosofía nutricional
                            </div>
                            <div>
                              • 👥 Soporte personalizado para tus pacientes
                            </div>
                            <div>• 📊 Monitoreo de interacciones de IA</div>
                            <div>
                              • 🔧 Control total sobre las recomendaciones
                            </div>
                          </>
                        ) : (
                          <>
                            <div>
                              • 💬 Conversaciones guardadas automáticamente
                            </div>
                            <div>• 🔍 Historial completo de consultas</div>
                            <div>• 🎯 Consejos personalizados</div>
                            <div>• 🏥 Integración con nutricionistas</div>
                          </>
                        )}
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
  );
}
