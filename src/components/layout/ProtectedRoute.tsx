"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import LoadingSpinner from "@/components/common/LoadingSpinner";

export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading, needsOnboarding } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      // Covers both dashboard routes AND a direct visit to /onboarding
      router.push("/login");
      return;
    }

    if (needsOnboarding && pathname !== "/onboarding") {
      router.push("/onboarding");
    }
  }, [isAuthenticated, isLoading, needsOnboarding, pathname, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Block render until auth state is resolved
  if (!isAuthenticated) {
    return null;
  }

  // Authenticated but still needs onboarding — block render of other pages
  if (needsOnboarding && pathname !== "/onboarding") {
    return null;
  }

  return <>{children}</>;
}
