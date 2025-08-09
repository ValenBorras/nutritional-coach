import { ProtectedRoute } from "../components/auth/protected-route";
import { SubscriptionGuard } from "../components/auth/subscription-guard";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <SubscriptionGuard>{children}</SubscriptionGuard>
    </ProtectedRoute>
  );
}
