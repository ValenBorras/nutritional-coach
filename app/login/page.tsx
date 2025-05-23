import { AuthForm } from '../components/auth/auth-form';

export default function LoginPage() {
  return (
    <div className="container flex items-center justify-center min-h-screen py-12">
      <AuthForm mode="login" />
    </div>
  );
} 