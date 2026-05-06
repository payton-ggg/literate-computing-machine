"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/modules/auth/store/auth.store";
import AppHeader from "@/components/layout/AppHeader";
import PublicHeader from "@/components/layout/PublicHeader";
import ToastContainer from "@/components/feedback/ToastContainer";

export default function HeaderSwitch() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // During SSR and before hydration, we don't know the auth state yet.
  // Rendering PublicHeader immediately causes a flash on reload.
  // Returning a placeholder prevents the flash.
  if (!mounted) {
    return <div style={{ height: "64px" }} />;
  }


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
