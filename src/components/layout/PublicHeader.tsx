"use client";

import { useTranslations } from "next-intl";
import LocaleToggle from "./LocaleToggle";
import styles from "./PublicHeader.module.css";
import Image from "next/image";
import Link from "next/link";

function LogoLarge() {
  return (
    <Image
      src="/Dark_logo.svg"
      alt="CastDev Logo"
      width={107}
      height={26}
      priority
    />
  );
}

export default function PublicHeader() {
  const t = useTranslations("header");

  return (
    <header className={styles.appHeader}>
      <Link href="/" className={styles.logo}>
        <LogoLarge />
      </Link>
      <div className={styles.headerRight}>
        <LocaleToggle />
        <a
          href="https://sarm.solutions/"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.navLink}
        >
          {t("aboutUs")}
        </a>
        <Link href="/login" className="btn primary">
          {t("login")}
        </Link>
      </div>
    </header>
  );
}
