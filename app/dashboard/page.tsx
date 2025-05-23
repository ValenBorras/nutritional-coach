'use client';

import { Button } from "@/app/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card"
import DashboardLayout from "@/app/components/dashboard-layout"
import NutritionChatbot from "@/app/components/nutrition-chatbot"
import MealPlanCard from "@/app/components/meal-plan-card"
import ProgressTracker from "@/app/components/progress-tracker"
import { Calendar, MessageSquare, Activity } from "lucide-react"
import { PageTransition, StaggerContainer, StaggerItem, FadeIn } from "@/app/components/ui/page-transition"
import { motion } from 'framer-motion'

export default function Dashboard() {
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
              Bienvenido a tu Dashboard
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
              className="text-charcoal/70"
            >
              Aquí tienes un resumen de tu progreso y actividades del día
            </motion.p>
          </div>
        </FadeIn>

        <StaggerContainer staggerChildren={0.2} className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StaggerItem>
            <motion.div
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              className="h-full"
            >
              <Card className="bg-gradient-to-br from-warm-sand to-warm-sand/80 border-soft-rose/20 shadow-lg hover:shadow-xl transition-shadow duration-300 h-full">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-medium flex items-center gap-2">
                    <motion.div
                      animate={{ rotate: [0, 5, -5, 0] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    >
                      <Calendar className="w-5 h-5 text-coral" />
                    </motion.div>
                    Today's Focus
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <h3 className="text-xl font-marcellus text-charcoal mb-2">Mindful Eating</h3>
                  <p className="text-charcoal/70 text-sm">Focus on eating slowly and recognizing hunger cues today.</p>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button variant="link" className="text-coral p-0 h-auto mt-2">
                      View Details
                    </Button>
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>
          </StaggerItem>

          <StaggerItem>
            <motion.div
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              className="h-full"
            >
              <Card className="bg-gradient-to-br from-warm-sand to-warm-sand/80 border-soft-rose/20 shadow-lg hover:shadow-xl transition-shadow duration-300 h-full">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-medium flex items-center gap-2">
                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    >
                      <Activity className="w-5 h-5 text-sage-green" />
                    </motion.div>
                    Progress
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-charcoal/70 text-sm">Weekly Goal</span>
                    <span className="text-charcoal font-medium">65%</span>
                  </div>
                  <div className="w-full h-2 bg-soft-rose/20 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: "65%" }}
                      transition={{ duration: 1.5, delay: 0.5, ease: "easeOut" }}
                      className="h-full bg-gradient-to-r from-sage-green to-sage-green/80 rounded-full"
                    />
                  </div>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button variant="link" className="text-sage-green p-0 h-auto mt-2">
                      View All Goals
                    </Button>
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>
          </StaggerItem>

          <StaggerItem>
            <motion.div
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              className="h-full"
            >
              <Card className="bg-gradient-to-br from-warm-sand to-warm-sand/80 border-soft-rose/20 shadow-lg hover:shadow-xl transition-shadow duration-300 h-full">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-medium flex items-center gap-2">
                    <motion.div
                      animate={{ rotate: [0, 10, -10, 0] }}
                      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    >
                      <MessageSquare className="w-5 h-5 text-soft-rose" />
                    </motion.div>
                    Nutritionist Note
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-charcoal/70 text-sm italic">
                    "Great progress on your water intake! Let's focus on adding more leafy greens this week."
                  </p>
                  <div className="flex items-center gap-2 mt-3">
                    <motion.div 
                      whileHover={{ scale: 1.1 }}
                      className="w-8 h-8 rounded-full bg-gradient-to-br from-soft-rose to-soft-rose/80 flex items-center justify-center shadow-md"
                    >
                      <span className="text-xs font-semibold text-white">DR</span>
                    </motion.div>
                    <span className="text-charcoal text-sm">Dr. Rebecca, RD</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </StaggerItem>
        </StaggerContainer>

        <StaggerContainer staggerChildren={0.3} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <StaggerItem className="lg:col-span-2 space-y-6">
            <motion.div
              whileHover={{ scale: 1.01 }}
              transition={{ duration: 0.2 }}
            >
              <MealPlanCard />
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.01 }}
              transition={{ duration: 0.2 }}
            >
              <ProgressTracker />
            </motion.div>
          </StaggerItem>

          <StaggerItem className="lg:col-span-1">
            <motion.div
              whileHover={{ scale: 1.01 }}
              transition={{ duration: 0.2 }}
            >
              <NutritionChatbot />
            </motion.div>
          </StaggerItem>
        </StaggerContainer>
      </PageTransition>
    </DashboardLayout>
  )
}
