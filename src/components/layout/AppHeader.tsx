"use client";

import {
  useState,
  useRef,
  useCallback,
  useEffect,
  type CSSProperties,
} from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { useLocale } from "@/lib/i18n";
import { useAuthStore } from "@/modules/auth/store/auth.store";
import { authApi } from "@/modules/auth/api/auth.api";
import { useTokenBalanceStore } from "@/lib/token-balance";
import TokenBalanceBadge from "@/components/ui/TokenBalanceBadge";
import AccountMenu from "@/components/layout/AccountMenu";
import LogoutModal from "@/components/layout/LogoutModal";
import styles from "./AppHeader.module.css";
import Image from "next/image";

/* ── Small logo (authenticated header) ── */
function LogoSmall() {
  return (
    <Image
      src="/Dark_logo.svg"
      alt="CastDev Logo"
      width={99}
      height={24}
      priority
    />
  );
}

export default function AppHeader() {
  const t = useTranslations("header");
  const router = useRouter();
  const pathname = usePathname();
  const { setLocale, locale } = useLocale();
  const { user } = useAuthStore();
  const { balance, refresh } = useTokenBalanceStore();

  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const [accountMenuStyle, setAccountMenuStyle] = useState<CSSProperties>({});
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isDark, setIsDark] = useState(false);

  const headerRef = useRef<HTMLElement>(null);
  const settingsBtnRef = useRef<HTMLButtonElement>(null);
  const mobileSettingsBtnRef = useRef<HTMLButtonElement>(null);

  // Theme init
  useEffect(() => {
    const saved = localStorage.getItem("theme");
    const dark = saved === "dark";
    setIsDark(dark);
    if (dark) document.documentElement.setAttribute("data-theme", "dark");
  }, []);

  // Click outside handler for menus
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      const target = e.target as Element;

      if (isMobileMenuOpen && headerRef.current && !headerRef.current.contains(target)) {
        setMobileMenuOpen(false);
      }

      if (showAccountMenu) {
        const isClickInsideMenu = target.closest("#account-menu-panel");
        const isClickOnDesktopToggle =
          settingsBtnRef.current && settingsBtnRef.current.contains(target);
        const isClickOnMobileToggle =
          mobileSettingsBtnRef.current && mobileSettingsBtnRef.current.contains(target);

        if (!isClickInsideMenu && !isClickOnDesktopToggle && !isClickOnMobileToggle) {
          setShowAccountMenu(false);
        }
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMobileMenuOpen, showAccountMenu]);

  // Refresh balance on route change
  useEffect(() => {
    refresh();
  }, [pathname, refresh]);

  const isInterviewsSection =
    pathname === "/" || pathname.startsWith("/research");

  const isIdeasSection = pathname.startsWith("/ideas");

  const toggleTheme = useCallback(() => {
    setIsDark((prev) => {
      const next = !prev;
      localStorage.setItem("theme", next ? "dark" : "light");
      if (next) document.documentElement.setAttribute("data-theme", "dark");
      else document.documentElement.removeAttribute("data-theme");
      return next;
    });
  }, []);

  const toggleLocale = useCallback(() => {
    setLocale(locale === "ru" ? "en" : "ru");
  }, [locale, setLocale]);

  const openMenuAtElement = useCallback((el: HTMLElement | null) => {
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const panelWidth = 260;
    const left = Math.min(rect.left, window.innerWidth - panelWidth - 16);
    setAccountMenuStyle({ top: `${rect.bottom + 8}px`, left: `${left}px` });
    setShowAccountMenu(true);
  }, []);

  const toggleAccountMenu = useCallback(() => {
    if (showAccountMenu) {
      setShowAccountMenu(false);
      return;
    }
    openMenuAtElement(settingsBtnRef.current);
  }, [showAccountMenu, openMenuAtElement]);

  const handleLogout = useCallback(async () => {
    setShowLogoutConfirm(false);
    setShowAccountMenu(false);
    try {
      await authApi.logout();
    } catch {
      // ignore — still log out locally even if request fails
    }
    useAuthStore.getState().logout();
    router.replace("/login");
  }, [router]);

  const handleOpenSettings = useCallback(() => {
    setShowAccountMenu(false);
    router.push("/settings");
  }, [router]);

  return (
    <>
      <header
        ref={headerRef}
        className={`${styles.appHeader} ${isMobileMenuOpen ? styles.mobileMenuOpen : ""}`}
      >
        <div className={styles.appHeaderTopRow}>
          <button
            ref={mobileSettingsBtnRef}
            className={`${styles.mobileActionBtn} ${styles.mobileOnly}`}
            onClick={toggleAccountMenu}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </button>

          <Link href="/" className={styles.logo}>
            <LogoSmall />
          </Link>

          <button
            className={`${styles.mobileActionBtn} ${styles.mobileOnly}`}
            onClick={() => setMobileMenuOpen((v) => !v)}
          >
            {isMobileMenuOpen ? (
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            ) : (
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="4" y1="12" x2="20" y2="12" />
                <line x1="4" y1="6" x2="20" y2="6" />
                <line x1="4" y1="18" x2="20" y2="18" />
              </svg>
            )}
          </button>
        </div>

        <div
          className={`${styles.mobileMenuContent} ${isMobileMenuOpen ? styles.isOpen : ""}`}
        >
          <nav className={styles.headerNav} aria-label={t("nav.aria")}>
            <Link
              href="/"
              className={`${styles.headerNavLink} ${isInterviewsSection ? styles.headerNavLinkActive : ""}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              {t("nav.interviews")}
            </Link>
            <Link
              href="/ideas"
              className={`${styles.headerNavLink} ${isIdeasSection ? styles.headerNavLinkActive : ""}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              {t("nav.ideas")}
            </Link>
          </nav>

          <div className={`${styles.headerCenter} ${styles.headerBalance}`}>
            <TokenBalanceBadge
              balance={balance}
              onOpenBilling={() => router.push("/billing")}
            />
          </div>

          <div className={`${styles.headerRight} ${styles.desktopOnly}`}>
            <button
              ref={settingsBtnRef}
              className={styles.userPill}
              onClick={toggleAccountMenu}
            >
              {user?.username ?? ""}
              <svg
                width="12"
                height="12"
                viewBox="0 0 12 12"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M2 4l4 4 4-4" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      <AccountMenu
        isOpen={showAccountMenu}
        style={accountMenuStyle}
        username={user?.username ?? ""}
        email={user?.email ?? ""}
        locale={locale}
        isDark={isDark}
        onClose={() => setShowAccountMenu(false)}
        onOpenSettings={handleOpenSettings}
        onToggleLocale={toggleLocale}
        onToggleTheme={toggleTheme}
        onLogout={() => {
          setShowAccountMenu(false);
          setShowLogoutConfirm(true);
        }}
      />

      <LogoutModal
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={handleLogout}
      />
    </>
  );
}
