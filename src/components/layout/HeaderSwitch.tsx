"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/modules/auth/store/auth.store";
import AppHeader from "@/components/layout/AppHeader";
import PublicHeader from "@/components/layout/PublicHeader";
import ToastContainer from "@/components/feedback/ToastContainer";

export default function HeaderSwitch() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const pathname = usePathname() || "";
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isLandingPage = pathname === "/" || pathname === "/en" || pathname === "/ru";

  if (!mounted) {
    if (isLandingPage) return null;
    return <div style={{ height: "64px" }} />;
  }


  if (isAuthenticated) {
    // If the user is authenticated but on the landing page, we might still want to show AppHeader
    // or maybe they get redirected anyway. Let's show AppHeader.
    return (
      <>
        <AppHeader />
        <ToastContainer />
      </>
    );
  }

  // Hide PublicHeader on the landing page because it has its own LandingNav
  if (isLandingPage) {
    return null;
  }

  return <PublicHeader />;
}
