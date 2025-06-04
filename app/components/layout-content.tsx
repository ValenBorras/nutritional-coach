"use client";

import { usePathname } from "next/navigation";
import { Navbar } from "@/app/components/navbar";
import Footer from "@/app/components/footer";

export default function LayoutContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isDashboardPage = pathname?.startsWith("/dashboard");

  if (isDashboardPage) {
    return <>{children}</>;
  }

  return (
    <>
      <Navbar />
      <main className="min-h-[calc(100vh-4rem)]">{children}</main>
      <Footer />
    </>
  );
}
