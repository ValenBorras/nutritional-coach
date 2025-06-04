import { AuthForm } from "../components/auth/auth-form";
import { PageTransition, FadeIn } from "../components/ui/page-transition";

export default function LoginPage() {
  return (
    <PageTransition className="min-h-screen bg-gradient-to-br from-warm-sand via-warm-sand/90 to-sage/20">
      <FadeIn className="container flex items-center justify-center min-h-screen py-12">
        <AuthForm mode="login" />
      </FadeIn>
    </PageTransition>
  );
}
