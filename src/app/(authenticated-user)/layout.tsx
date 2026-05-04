import type { ReactNode } from "react";
import styles from "./layout.module.css";
import GlobalUploadManager from "@/modules/research/components/global/GlobalUploadManager";

export default function AuthenticatedLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <main className={styles.appMain}>{children}</main>
      <GlobalUploadManager />
    </>
  );
}
