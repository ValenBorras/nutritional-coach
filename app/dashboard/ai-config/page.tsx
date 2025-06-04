import DashboardLayout from "@/app/components/dashboard-layout";
import AIRulesConfig from "@/app/components/ai-rules-config";

export default function AIConfigPage() {
  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-charcoal mb-2">
            Configuración del Asistente IA
          </h1>
          <p className="text-charcoal/70">
            Personaliza la personalidad y las reglas de tu asistente de
            inteligencia artificial
          </p>
        </div>

        <AIRulesConfig />
      </div>
    </DashboardLayout>
  );
}
