"use client";

import { useState, useEffect, useCallback } from "react";

export function useDropdownMenu() {
  const [activeMenuId, setActiveMenuId] = useState<string | number | null>(
    null,
  );
  const [headerMenuOpen, setHeaderMenuOpen] = useState(false);

  const toggleMenu = useCallback((id: string | number) => {
    setActiveMenuId((prev) => (prev === id ? null : id));
  }, []);

  const toggleHeaderMenu = useCallback(() => {
    setHeaderMenuOpen((prev) => !prev);
  }, []);

  const closeAll = useCallback(() => {
    setActiveMenuId(null);
    setHeaderMenuOpen(false);
  }, []);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest("[data-menu-wrapper]")) {
        closeAll();
      }
    };
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [closeAll]);

  return {
    activeMenuId,
    headerMenuOpen,
    toggleMenu,
    toggleHeaderMenu,
    closeAll,
  };
}
