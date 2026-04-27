"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import Breadcrumbs, { BreadcrumbItem } from "@/components/ui/Breadcrumbs";

import { useInterviewDetail } from "../hooks/useInterviewDetail";
import styles from "./InterviewDetailPage.module.css";
import InterviewSidebar from "../components/global/InterviewSidebar";
import InterviewDetailView from "../components/views/detail/InterviewDetailView";

interface InterviewDetailPageProps {
  id: string;
}

export function InterviewDetailPage({ id }: InterviewDetailPageProps) {
  const t = useTranslations();
  const {
    interview,
    isLoading,
    error,
    refresh,
    updateInterview,
    deleteInterview,
    retryInterview,
  } = useInterviewDetail({ id });

  const breadcrumbItems = useMemo<BreadcrumbItem[]>(() => {
    const items: BreadcrumbItem[] = [
      { label: t("header.nav.interviews"), href: "/" },
    ];
    if (interview?.folder) {
      items.push({
        label: interview.folder.name,
        href: `/research/${interview.folder.id}`,
      });
    }
    items.push({
      label: interview?.title || t("interviews.loading"),
      href: undefined,
    });
    return items;
  }, [interview, t]);

  return (
    <div className={styles.detailInterviewPage}>
      <div className={styles.projectLayout}>
        <Breadcrumbs items={breadcrumbItems} />

        <div className={styles.projectLayoutInner}>
          <InterviewSidebar
            folder={interview?.folder || null}
            interviewId={id}
          />

          <main className={styles.projectContent}>
            {isLoading && !interview ? (
              <div className={styles.loadingSkeletonWrapper}>
                <div className={styles.skeletonCard}>
                  <div
                    className={`${styles.skeletonText} ${styles.titleSkeleton}`}
                  ></div>
                  <div
                    className={`${styles.skeletonText} ${styles.descSkeleton}`}
                  ></div>
                </div>
              </div>
            ) : interview ? (
              <div className={styles.detailContainer}>
                <InterviewDetailView
                  interview={interview}
                  onUpdate={refresh}
                  onUpdateFields={updateInterview}
                  onDelete={deleteInterview}
                  onRetry={retryInterview}
                />
              </div>
            ) : !isLoading ? (
              <div className={styles.notFound}>
                <p>{t("interviews.notFound")}</p>
                <Link href="/">{t("interviews.returnToList")}</Link>
              </div>
            ) : null}

            {error && <div className={styles.errorMessage}>{error}</div>}
          </main>
        </div>
      </div>
    </div>
  );
}
