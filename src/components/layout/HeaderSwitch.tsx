"use client";

import { useAuthStore } from "@/modules/auth/store/auth.store";
import AppHeader from "@/components/layout/AppHeader";
import PublicHeader from "@/components/layout/PublicHeader";
import ToastContainer from "@/components/feedback/ToastContainer";

/**
 * Renders AppHeader (+ ToastContainer) for authenticated users,
 * and PublicHeader for guests. Reads from Zustand which is
 * hydrated on the client by AuthLoader.
 */
export default function HeaderSwitch() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  if (isAuthenticated) {
    return (
      <>
        <AppHeader />
        <ToastContainer />
      </>
    );
  }

  return <PublicHeader />;
}
