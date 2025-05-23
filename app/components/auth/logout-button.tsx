'use client';

import { useAuth } from '@/hooks/use-auth';
import { Button } from '../ui/button';
import { useRouter } from 'next/navigation';

export function LogoutButton() {
  const router = useRouter();
  const { signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
    router.push('/');
    router.refresh();
  };

  return (
    <Button
      variant="ghost"
      onClick={handleLogout}
      className="text-mist-white hover:text-white hover:bg-charcoal/80 font-marcellus"
    >
      Cerrar Sesión
    </Button>
  );
} 