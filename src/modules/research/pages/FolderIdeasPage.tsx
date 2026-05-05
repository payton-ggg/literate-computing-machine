"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import InterviewSidebar from "../components/global/InterviewSidebar";
import { folderApi } from "../api/interviews.api";
import type { Folder } from "../types/interview.types";
import { IdeasPage } from "@/modules/ideas";
import styles from "./FolderIdeasPage.module.css";

interface FolderIdeasPageProps {
  folderId: string;
}

export function FolderIdeasPage({ folderId }: FolderIdeasPageProps) {
  const t = useTranslations();

  const [folders, setFolders] = useState<Folder[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const currentFolder = folders.find((f) => f.id === folderId) ?? null;

  useEffect(() => {
    setIsLoading(true);
    folderApi
      .list()
      .then((res) => {
        setFolders(res.data?.folders ?? res.data ?? []);
      })
      .catch((err) => {
        console.error("Failed to load folders for FolderIdeas:", err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const breadcrumbItems = [
    { label: t("header.nav.interviews"), href: "/" },
    ...(currentFolder
      ? [{ label: currentFolder.name, href: `/research/${folderId}` }]
      : []),
    { label: t("header.nav.ideas") },
  ];

  return (
    <div className={`${styles.folderIdeasPage} ${styles.withProjectLayout} rounded-xl`}>
      <div className={`${styles.projectLayout} rounded-xl`}>
        <Breadcrumbs items={breadcrumbItems} />

        <div className={`${styles.projectLayoutInner} rounded-xl`}>
          <InterviewSidebar folder={currentFolder} />

          <main className={`${styles.projectContent} rounded-xl`}>
            {isLoading && !currentFolder ? (
              <div className={styles.loadingSkeletonWrapper}>
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className={styles.skeletonCard}>
                    <div className={styles.skeletonTitle} />
                    <div className={styles.skeletonDesc} />
                  </div>
                ))}
              </div>
            ) : (
              <IdeasPage folderId={folderId} />
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
