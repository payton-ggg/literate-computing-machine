"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useAuthStore } from "@/modules/auth/store/auth.store";
import { authApi } from "@/modules/auth/api/auth.api";

export function AuthLoader({ children }: { children: ReactNode }) {
  const { setUser, logout } = useAuthStore();

  useEffect(() => {
    async function initAuth() {
      try {
        const res = await authApi.me();
        const user = res.data?.user ?? res.data;
        if (user && user.id) {
          setUser({
            id: user.id,
            username: user.username,
            email: user.email,
            has_google: !!user.has_google,
          });
        } else {
          logout();
        }
      } catch (err) {
        logout();
      }
    }

    initAuth();
  }, [setUser, logout]);

  return <>{children}</>;
}
