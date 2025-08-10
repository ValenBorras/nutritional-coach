"use client";

interface EmailVerificationGuardProps {
  children: React.ReactNode;
}

export function EmailVerificationGuard({ children }: EmailVerificationGuardProps) {
  // Email verification disabled: just render children
  return <>{children}</>;
}
