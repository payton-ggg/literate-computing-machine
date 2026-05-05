import Link from "next/link";
import styles from "./Breadcrumbs.module.css";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  background?: boolean;
}

export default function Breadcrumbs({
  items,
  background = false,
}: BreadcrumbsProps) {
  return (
    <div
      className={`${styles.container} ${background ? styles.withBackground : ""}`}
    >
      <nav className={styles.bar} aria-label="Breadcrumb">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <span key={index} style={{ display: "contents" }}>
              {!isLast && item.href ? (
                <Link href={item.href} className={styles.link}>
                  {item.label}
                </Link>
              ) : !isLast ? (
                <span className={`${styles.link}`}>{item.label}</span>
              ) : (
                <span className={styles.current}>{item.label}</span>
              )}
              {!isLast && <span className={styles.separator}>/</span>}
            </span>
          );
        })}
      </nav>
    </div>
  );
}
