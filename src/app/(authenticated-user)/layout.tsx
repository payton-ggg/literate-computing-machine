import type { ReactNode } from "react";
import styles from "./layout.module.css";

export default function AuthenticatedLayout({ children }: { children: ReactNode }) {
  return (
    <main className={styles.appMain}>{children}</main>
  );
}
