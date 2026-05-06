"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/modules/auth/store/auth.store";

export default function MainContentWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex-1 overflow-hidden" style={{ backgroundColor: "var(--bg)" }}>
        {/* Invisible placeholder during SSR to prevent flash */}
      </div>
    );
  }


  if (isAuthenticated) {
    return (
      <div
        className="flex-1 overflow-hidden"
        style={{
          backgroundColor: "var(--bg)",
          borderTopLeftRadius: "28px",
          borderTopRightRadius: "28px",
          position: "relative",
          zIndex: 1,
        }}
      >
        {children}
      </div>
    );
  }

  return <div className="flex-1 flex flex-col">{children}</div>;
}
