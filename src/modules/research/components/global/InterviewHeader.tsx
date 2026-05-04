import { useState } from "react";
import { useTranslations } from "next-intl";
import styles from "./InterviewHeader.module.css";

interface InterviewHeaderProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  resultsCount: number;
  sortOrder: "recent" | "oldest";
  selectionMode: boolean;
  selectedCount: number;
  onToggleSort: () => void;
  onToggleSelectionMode: () => void;
  onUpload: () => void;
}

export default function InterviewHeader({
  searchQuery,
  onSearchChange,
  resultsCount,
  sortOrder,
  selectionMode,
  selectedCount,
  onToggleSort,
  onToggleSelectionMode,
  onUpload,
}: InterviewHeaderProps) {
  const t = useTranslations();
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);

  return (
    <div className={styles.header}>
      {/* Mobile-only compact header row */}
      <div className={styles.mobileHeader}>
        <div className={styles.titleBlock}>
          <div className={styles.iconWrapper}>
            <svg
              width="24"
              height="24"
              viewBox="0 0 26 26"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M8.84533 17.3067C8.656 17.3067 8.49778 17.2436 8.37067 17.1173C8.24355 16.9911 8.18 16.8324 8.18 16.6413C8.18 16.4502 8.24355 16.2916 8.37067 16.1653C8.49778 16.0391 8.65644 15.9756 8.84667 15.9747H11.7693C11.9596 15.9747 12.1182 16.0382 12.2453 16.1653C12.3724 16.2924 12.436 16.4511 12.436 16.6413C12.436 16.8316 12.3724 16.9902 12.2453 17.1173C12.1182 17.2444 11.9596 17.308 11.7693 17.308L8.84533 17.3067ZM8.00133 24C6.39689 24 5.02978 23.4484 3.9 22.3453C2.77022 21.2422 2.20533 19.896 2.20533 18.3067V6.20533C1.592 6.20533 1.07111 5.99556 0.642667 5.576C0.214222 5.15556 0 4.63867 0 4.02533V2.20533C0 1.592 0.214222 1.07111 0.642667 0.642667C1.07111 0.214222 1.592 0 2.20533 0H13.7693C14.3827 0 14.908 0.214222 15.3453 0.642667C15.7818 1.07022 16 1.59111 16 2.20533V4.02533C16 4.63867 15.7818 5.15556 15.3453 5.576C14.908 5.99556 14.3827 6.20533 13.7693 6.20533V10.0253C13.7693 10.6227 13.5596 11.1311 13.14 11.5507C12.7204 11.9702 12.2124 12.18 11.616 12.18H8.84533C8.65511 12.18 8.49644 12.116 8.36933 11.988C8.24222 11.86 8.17867 11.7018 8.17867 11.5133C8.17867 11.3249 8.24222 11.1662 8.36933 11.0373C8.49644 10.9084 8.65511 10.8444 8.84533 10.8453H12.4347V6.20533H3.53867V18.308C3.53867 19.5382 3.97422 20.5724 4.84533 21.4107C5.71644 22.2489 6.76844 22.6676 8.00133 22.6667C8.45289 22.6667 8.88356 22.6071 9.29333 22.488C9.70222 22.368 10.088 22.1907 10.4507 21.956C10.6018 21.8644 10.7631 21.8373 10.9347 21.8747C11.1062 21.912 11.2378 22.0093 11.3293 22.1667C11.4271 22.324 11.4529 22.4964 11.4067 22.684C11.3604 22.8716 11.2587 23.0138 11.1013 23.1107C10.6418 23.3871 10.1542 23.6044 9.63867 23.7627C9.12311 23.9209 8.57689 24 8 24M2.20533 4.872H13.7693C14.0093 4.872 14.2187 4.79067 14.3973 4.628C14.5769 4.46533 14.6667 4.26444 14.6667 4.02533V2.20533C14.6667 1.96533 14.5769 1.76 14.3973 1.58933C14.2178 1.41867 14.0084 1.33333 13.7693 1.33333H2.20533C1.96533 1.33333 1.76044 1.41867 1.59067 1.58933C1.42089 1.76 1.33511 1.96533 1.33333 2.20533V4.02533C1.33333 4.26533 1.41867 4.46622 1.58933 4.628C1.76089 4.79067 1.96622 4.872 2.20533 4.872ZM21.0853 20.6493C21.8142 19.9196 22.1787 19.0364 22.1787 18C22.1787 16.9636 21.8142 16.0809 21.0853 15.352C20.3556 14.6213 19.4724 14.256 18.436 14.256C17.4004 14.256 16.5178 14.6213 15.788 15.352C15.0582 16.0809 14.6933 16.9636 14.6933 18C14.6933 19.0364 15.0578 19.9196 15.7867 20.6493C16.5156 21.3791 17.3987 21.7436 18.436 21.7427C19.4724 21.7427 20.3556 21.3782 21.0853 20.6493ZM18.436 23.076C17.0262 23.076 15.8276 22.5827 14.84 21.596C13.8524 20.6093 13.3591 19.4107 13.36 18C13.3609 16.5893 13.8542 15.3907 14.84 14.404C15.8258 13.4173 17.0244 12.924 18.436 12.924C19.8476 12.924 21.0462 13.4173 22.032 14.404C23.0178 15.3907 23.5111 16.5893 23.512 18C23.512 18.56 23.4218 19.1027 23.2413 19.628C23.06 20.1524 22.7969 20.6422 22.452 21.0973L25.708 24.3547C25.8324 24.4791 25.8947 24.6276 25.8947 24.8C25.8947 24.9724 25.8324 25.1209 25.708 25.2453C25.5836 25.3698 25.4307 25.4324 25.2493 25.4333C25.068 25.4342 24.9147 25.372 24.7893 25.2467L21.5333 22.0147C21.0791 22.3604 20.5893 22.624 20.064 22.8053C19.5396 22.9867 18.9969 23.0773 18.436 23.0773"
                fill="currentColor"
              />
            </svg>
          </div>
          <h1 className={styles.pageTitle}>{t("interviews.title")}</h1>
        </div>

        <div className={styles.mobileHeaderActions}>
          <button
            className={styles.mobileActionBtn}
            onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </button>
          <button className={styles.mobileActionBtn} onClick={onToggleSort}>
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M7 10l5-5 5 5M7 14l5 5 5-5" />
            </svg>
          </button>
        </div>
      </div>

      <div className={styles.topRow}>
        <div className={styles.titleBlock}>
          <div className={styles.iconWrapper}>
            <svg
              width="24"
              height="24"
              viewBox="0 0 26 26"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M8.84533 17.3067C8.656 17.3067 8.49778 17.2436 8.37067 17.1173C8.24355 16.9911 8.18 16.8324 8.18 16.6413C8.18 16.4502 8.24355 16.2916 8.37067 16.1653C8.49778 16.0391 8.65644 15.9756 8.84667 15.9747H11.7693C11.9596 15.9747 12.1182 16.0382 12.2453 16.1653C12.3724 16.2924 12.436 16.4511 12.436 16.6413C12.436 16.8316 12.3724 16.9902 12.2453 17.1173C12.1182 17.2444 11.9596 17.308 11.7693 17.308L8.84533 17.3067ZM8.00133 24C6.39689 24 5.02978 23.4484 3.9 22.3453C2.77022 21.2422 2.20533 19.896 2.20533 18.3067V6.20533C1.592 6.20533 1.07111 5.99556 0.642667 5.576C0.214222 5.15556 0 4.63867 0 4.02533V2.20533C0 1.592 0.214222 1.07111 0.642667 0.642667C1.07111 0.214222 1.592 0 2.20533 0H13.7693C14.3827 0 14.908 0.214222 15.3453 0.642667C15.7818 1.07022 16 1.59111 16 2.20533V4.02533C16 4.63867 15.7818 5.15556 15.3453 5.576C14.908 5.99556 14.3827 6.20533 13.7693 6.20533V10.0253C13.7693 10.6227 13.5596 11.1311 13.14 11.5507C12.7204 11.9702 12.2124 12.18 11.616 12.18H8.84533C8.65511 12.18 8.49644 12.116 8.36933 11.988C8.24222 11.86 8.17867 11.7018 8.17867 11.5133C8.17867 11.3249 8.24222 11.1662 8.36933 11.0373C8.49644 10.9084 8.65511 10.8444 8.84533 10.8453H12.4347V6.20533H3.53867V18.308C3.53867 19.5382 3.97422 20.5724 4.84533 21.4107C5.71644 22.2489 6.76844 22.6676 8.00133 22.6667C8.45289 22.6667 8.88356 22.6071 9.29333 22.488C9.70222 22.368 10.088 22.1907 10.4507 21.956C10.6018 21.8644 10.7631 21.8373 10.9347 21.8747C11.1062 21.912 11.2378 22.0093 11.3293 22.1667C11.4271 22.324 11.4529 22.4964 11.4067 22.684C11.3604 22.8716 11.2587 23.0138 11.1013 23.1107C10.6418 23.3871 10.1542 23.6044 9.63867 23.7627C9.12311 23.9209 8.57689 24 8 24M2.20533 4.872H13.7693C14.0093 4.872 14.2187 4.79067 14.3973 4.628C14.5769 4.46533 14.6667 4.26444 14.6667 4.02533V2.20533C14.6667 1.96533 14.5769 1.76 14.3973 1.58933C14.2178 1.41867 14.0084 1.33333 13.7693 1.33333H2.20533C1.96533 1.33333 1.76044 1.41867 1.59067 1.58933C1.42089 1.76 1.33511 1.96533 1.33333 2.20533V4.02533C1.33333 4.26533 1.41867 4.46622 1.58933 4.628C1.76089 4.79067 1.96622 4.872 2.20533 4.872ZM21.0853 20.6493C21.8142 19.9196 22.1787 19.0364 22.1787 18C22.1787 16.9636 21.8142 16.0809 21.0853 15.352C20.3556 14.6213 19.4724 14.256 18.436 14.256C17.4004 14.256 16.5178 14.6213 15.788 15.352C15.0582 16.0809 14.6933 16.9636 14.6933 18C14.6933 19.0364 15.0578 19.9196 15.7867 20.6493C16.5156 21.3791 17.3987 21.7436 18.436 21.7427C19.4724 21.7427 20.3556 21.3782 21.0853 20.6493ZM18.436 23.076C17.0262 23.076 15.8276 22.5827 14.84 21.596C13.8524 20.6093 13.3591 19.4107 13.36 18C13.3609 16.5893 13.8542 15.3907 14.84 14.404C15.8258 13.4173 17.0244 12.924 18.436 12.924C19.8476 12.924 21.0462 13.4173 22.032 14.404C23.0178 15.3907 23.5111 16.5893 23.512 18C23.512 18.56 23.4218 19.1027 23.2413 19.628C23.06 20.1524 22.7969 20.6422 22.452 21.0973L25.708 24.3547C25.8324 24.4791 25.8947 24.6276 25.8947 24.8C25.8947 24.9724 25.8324 25.1209 25.708 25.2453C25.5836 25.3698 25.4307 25.4324 25.2493 25.4333C25.068 25.4342 24.9147 25.372 24.7893 25.2467L21.5333 22.0147C21.0791 22.3604 20.5893 22.624 20.064 22.8053C19.5396 22.9867 18.9969 23.0773 18.436 23.0773"
                fill="currentColor"
              />
            </svg>
          </div>
          <h1 className={styles.pageTitle}>{t("interviews.title")}</h1>
        </div>

        <div className={styles.topRowActions}>
          <button
            className={
              selectionMode ? styles.btnSecondaryActive : styles.btnSecondary
            }
            onClick={onToggleSelectionMode}
          >
            {selectionMode
              ? t("interviews.selection.cancelSelect")
              : t("interviews.selection.select")}
          </button>

          <button className={styles.btnPrimary} onClick={onUpload}>
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            {t("interviews.uploadInterview")}
          </button>
        </div>
      </div>

      <div
        className={`${styles.toolbarRow} ${isMobileSearchOpen ? styles.mobileSearchActive : ""}`}
      >
        <div className={styles.searchWrapper}>
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--muted)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={styles.searchIcon}
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            className={styles.searchInput}
            placeholder={t("interviews.searchInterviewsPlaceholder")}
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>

        <div className={styles.toolbarActions}>
          <span className={styles.resultsCount}>
            {selectionMode && selectedCount > 0
              ? `${t("interviews.selection.selected")}: ${selectedCount}`
              : `${resultsCount} ${t("interviews.results")}`}
          </span>
          <button className={styles.sortButton} onClick={onToggleSort}>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <polyline points="19 12 12 19 5 12" />
            </svg>
            {sortOrder === "recent"
              ? t("interviews.sortRecent")
              : t("interviews.sortOldest")}
          </button>
        </div>
      </div>
    </div>
  );
}
