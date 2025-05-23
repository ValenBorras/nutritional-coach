'use client';

// This page is commented out for MVP focus
// TODO: Re-enable after core AI chat functionality is complete

import DashboardLayout from "@/app/components/dashboard-layout";
import ConnectNutritionist from "@/app/components/connect-nutritionist";
import { useAuth } from "@/app/components/auth/auth-provider";

// MVP PLACEHOLDER
export default function SettingsPage() {
  const { user } = useAuth();
  
  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-charcoal mb-2">Configuración</h1>
          <p className="text-charcoal/70">
            Gestiona tu cuenta y conecta con una nutricionista
          </p>
        </div>
        
        <div className="space-y-6">
          {user?.role === 'patient' && <ConnectNutritionist />}
          
          {/* Placeholder for other settings */}
          <div className="p-8 text-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
            <h2 className="text-xl font-semibold text-gray-600 mb-2">⚙️ Más Configuraciones</h2>
            <p className="text-gray-500">Próximamente: Notificaciones, Privacidad, Datos personales</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
} 