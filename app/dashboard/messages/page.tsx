import DashboardLayout from "@/app/components/dashboard-layout";

export default function MessagesPage() {
  return (
    <DashboardLayout>
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold mb-4">💬 En Desarrollo</h1>
        <p className="text-gray-600">El sistema de mensajería estará disponible después del MVP.</p>
        <p className="text-sm text-gray-500 mt-2">Enfocándonos en el chat con IA primero.</p>
      </div>
    </DashboardLayout>
  );
} 