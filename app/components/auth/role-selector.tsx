"use client";

import { Button } from "@/app/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import { User, UserCog } from "lucide-react";
import { motion } from "framer-motion";

interface RoleSelectorProps {
  onSelect: (role: "patient" | "nutritionist") => void;
}

export function RoleSelector({ onSelect }: RoleSelectorProps) {
  return (
    <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <Card
          className="cursor-pointer hover:border-coral transition-colors h-full"
          onClick={() => onSelect("patient")}
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-marcellus">
              <User className="h-6 w-6 text-coral" />
              Paciente
            </CardTitle>
            <CardDescription>
              Recibe orientación nutricional personalizada y seguimiento de tu
              progreso
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Coaching nutricional con IA 24/7</li>
              <li>• Plan personalizado según tus objetivos</li>
              <li>• Opción de conectar con un nutricionista</li>
              <li>• Seguimiento de progreso</li>
            </ul>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <Card
          className="cursor-pointer hover:border-coral transition-colors h-full"
          onClick={() => onSelect("nutritionist")}
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-marcellus">
              <UserCog className="h-6 w-6 text-coral" />
              Nutricionista
            </CardTitle>
            <CardDescription>
              Potencia tu práctica con IA y gestiona a tus pacientes
              eficientemente
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Asistente de IA personalizado</li>
              <li>• Seguimiento de múltiples pacientes</li>
              <li>• Panel de control profesional</li>
              <li>• Herramientas de análisis y reportes</li>
            </ul>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
