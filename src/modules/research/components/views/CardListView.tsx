"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import ConfirmDialog from "@/components/feedback/ConfirmDialog";

import styles from "./CardListView.module.css";
import { useInterviewFiltering } from "../../hooks/useInterviewFiltering";
import { Folder } from "../../types/interview.types";
import { folderApi } from "../../api/interviews.api";
import CreateFolderDialog from "../dialogs/CreateFolderDialog";
import CreateCardDialog from "../dialogs/CreateCardDialog";

function formatDateShort(dateStr: string) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  return `${day}.${month}.${d.getFullYear()}`;
}

function formatCount(count: number, t: (key: string) => string): string {
  if (count >= 1_000_000)
    return `${(count / 1_000_000).toFixed(count % 1_000_000 === 0 ? 0 : 1)}M`;
  if (count >= 1_000)
    return `${(count / 1_000).toFixed(count % 1_000 === 0 ? 0 : 1)}K`;
  return String(count);
}

export default function CardListView() {
  const t = useTranslations();
  const router = useRouter();

  const [folders, setFolders] = useState<Folder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [showCreateCard, setShowCreateCard] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);

  // Rename
  const [showRename, setShowRename] = useState(false);
  const [renameValue, setRenameValue] = useState("");
  const [renameFolderId, setRenameFolderId] = useState<string | null>(null);
  const renameInputRef = useRef<HTMLInputElement>(null);

  // Delete
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [folderToDelete, setFolderToDelete] = useState<Folder | null>(null);

  const filtering = useInterviewFiltering<Folder>(folders, (f, q) =>
    (f.name ?? "").toLowerCase().includes(q),
  );

  const loadFolders = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await folderApi.list();
      setFolders(res.data?.folders ?? res.data ?? []);
    } catch (err) {
      console.error("Failed to load folders:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFolders();
  }, [loadFolders]);

  // Close menu on outside click
  useEffect(() => {
    if (!openMenuId) return;
    const handler = () => setOpenMenuId(null);
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, [openMenuId]);

  const selectFolder = (id: string) => router.push(`/research/${id}`);

  const openRenameDialog = (folder: Folder) => {
    setOpenMenuId(null);
    setRenameFolderId(folder.id);
    setRenameValue(folder.name);
    setShowRename(true);
    setTimeout(() => {
      renameInputRef.current?.focus();
      renameInputRef.current?.select();
    }, 50);
  };

  const submitRename = async () => {
    if (renameValue.trim() && renameFolderId) {
      await folderApi.update(renameFolderId, { name: renameValue.trim() });
      setShowRename(false);
      await loadFolders();
    }
  };

  const confirmDeleteFolder = (folder: Folder) => {
    setOpenMenuId(null);
    setFolderToDelete(folder);
    setShowDeleteConfirm(true);
  };

  const executeDelete = async () => {
    if (folderToDelete) {
      await folderApi.delete(folderToDelete.id);
      setShowDeleteConfirm(false);
      setFolderToDelete(null);
      await loadFolders();
    }
  };

  const handleFolderCreated = async () => {
    setShowCreateFolder(false);
    await loadFolders();
  };

  const handleCardCreated = (interview: { id: string }) => {
    router.push(`/research/interview/${interview.id}`);
  };

  return (
    <div className={styles.cardList}>
      <div className={styles.header}>
        <h2 className={styles.pageTitle}>
          <svg
            data-v-e92f3363=""
            width="26"
            height="26"
            viewBox="0 0 26 26"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              data-v-e92f3363=""
              d="M8.84533 17.3067C8.656 17.3067 8.49778 17.2436 8.37067 17.1173C8.24355 16.9911 8.18 16.8324 8.18 16.6413C8.18 16.4502 8.24355 16.2916 8.37067 16.1653C8.49778 16.0391 8.65644 15.9756 8.84667 15.9747H11.7693C11.9596 15.9747 12.1182 16.0382 12.2453 16.1653C12.3724 16.2924 12.436 16.4511 12.436 16.6413C12.436 16.8316 12.3724 16.9902 12.2453 17.1173C12.1182 17.2444 11.9596 17.308 11.7693 17.308L8.84533 17.3067ZM8.00133 24C6.39689 24 5.02978 23.4484 3.9 22.3453C2.77022 21.2422 2.20533 19.896 2.20533 18.3067V6.20533C1.592 6.20533 1.07111 5.99556 0.642667 5.576C0.214222 5.15556 0 4.63867 0 4.02533V2.20533C0 1.592 0.214222 1.07111 0.642667 0.642667C1.07111 0.214222 1.592 0 2.20533 0H13.7693C14.3827 0 14.908 0.214222 15.3453 0.642667C15.7818 1.07022 16 1.59111 16 2.20533V4.02533C16 4.63867 15.7818 5.15556 15.3453 5.576C14.908 5.99556 14.3827 6.20533 13.7693 6.20533V10.0253C13.7693 10.6227 13.5596 11.1311 13.14 11.5507C12.7204 11.9702 12.2124 12.18 11.616 12.18H8.84533C8.65511 12.18 8.49644 12.116 8.36933 11.988C8.24222 11.86 8.17867 11.7018 8.17867 11.5133C8.17867 11.3249 8.24222 11.1662 8.36933 11.0373C8.49644 10.9084 8.65511 10.8444 8.84533 10.8453H12.4347V6.20533H3.53867V18.308C3.53867 19.5382 3.97422 20.5724 4.84533 21.4107C5.71644 22.2489 6.76844 22.6676 8.00133 22.6667C8.45289 22.6667 8.88356 22.6071 9.29333 22.488C9.70222 22.368 10.088 22.1907 10.4507 21.956C10.6018 21.8644 10.7631 21.8373 10.9347 21.8747C11.1062 21.912 11.2378 22.0093 11.3293 22.1667C11.4271 22.324 11.4529 22.4964 11.4067 22.684C11.3604 22.8716 11.2587 23.0138 11.1013 23.1107C10.6418 23.3871 10.1542 23.6044 9.63867 23.7627C9.12311 23.9209 8.57689 24 8 24M2.20533 4.872H13.7693C14.0093 4.872 14.2187 4.79067 14.3973 4.628C14.5769 4.46533 14.6667 4.26444 14.6667 4.02533V2.20533C14.6667 1.96533 14.5769 1.76 14.3973 1.58933C14.2178 1.41867 14.0084 1.33333 13.7693 1.33333H2.20533C1.96533 1.33333 1.76044 1.41867 1.59067 1.58933C1.42089 1.76 1.33511 1.96533 1.33333 2.20533V4.02533C1.33333 4.26533 1.41867 4.46622 1.58933 4.628C1.76089 4.79067 1.96622 4.872 2.20533 4.872ZM21.0853 20.6493C21.8142 19.9196 22.1787 19.0364 22.1787 18C22.1787 16.9636 21.8142 16.0809 21.0853 15.352C20.3556 14.6213 19.4724 14.256 18.436 14.256C17.4004 14.256 16.5178 14.6213 15.788 15.352C15.0582 16.0809 14.6933 16.9636 14.6933 18C14.6933 19.0364 15.0578 19.9196 15.7867 20.6493C16.5156 21.3791 17.3987 21.7436 18.436 21.7427C19.4724 21.7427 20.3556 21.3782 21.0853 20.6493ZM18.436 23.076C17.0262 23.076 15.8276 22.5827 14.84 21.596C13.8524 20.6093 13.3591 19.4107 13.36 18C13.3609 16.5893 13.8542 15.3907 14.84 14.404C15.8258 13.4173 17.0244 12.924 18.436 12.924C19.8476 12.924 21.0462 13.4173 22.032 14.404C23.0178 15.3907 23.5111 16.5893 23.512 18C23.512 18.56 23.4218 19.1027 23.2413 19.628C23.06 20.1524 22.7969 20.6422 22.452 21.0973L25.708 24.3547C25.8324 24.4791 25.8947 24.6276 25.8947 24.8C25.8947 24.9724 25.8324 25.1209 25.708 25.2453C25.5836 25.3698 25.4307 25.4324 25.2493 25.4333C25.068 25.4342 24.9147 25.372 24.7893 25.2467L21.5333 22.0147C21.0791 22.3604 20.5893 22.624 20.064 22.8053C19.5396 22.9867 18.9969 23.0773 18.436 23.0773"
              fill="currentColor"
            ></path>
          </svg>{" "}
          {t("interviews.title")}
        </h2>

        <div className={styles.mobileHeaderActions}>
          <button
            className={styles.mobileActionBtn}
            onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 18 18"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M8.25 14.25C11.5637 14.25 14.25 11.5637 14.25 8.25C14.25 4.93629 11.5637 2.25 8.25 2.25C4.93629 2.25 2.25 4.93629 2.25 8.25C2.25 11.5637 4.93629 14.25 8.25 14.25Z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M15.75 15.75L12.4875 12.4875"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <button
            className={styles.mobileActionBtn}
            onClick={filtering.toggleSort}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect width="24" height="24" fill="white" fillOpacity="0.01" />
              <path
                d="M4.90536 8.56244C4.74479 8.82023 4.76773 9.17665 4.97418 9.40626L5.05654 9.48279C5.28832 9.66138 5.60879 9.63586 5.81523 9.40626L7.79999 7.0969V13.8C7.79999 14.1314 8.06862 14.4 8.39999 14.4C8.73136 14.4 8.99999 14.1314 8.99999 13.8V7.09539L10.9847 9.40626L11.0671 9.48279C11.2989 9.66138 11.6194 9.63586 11.8258 9.40626C12.0581 9.14795 12.0581 8.72914 11.8258 8.47083L8.82052 4.99372L8.73815 4.91718C8.50637 4.7386 8.1859 4.76411 7.97946 4.99372L4.97418 8.47083L4.90536 8.56244Z"
                fill="currentColor"
              />
              <path
                d="M19.0946 15.4375C19.2552 15.1797 19.2322 14.8233 19.0258 14.5937L18.9434 14.5172C18.7117 14.3386 18.3912 14.3641 18.1847 14.5937L16.2 16.9031V10.2C16.2 9.86862 15.9314 9.59999 15.6 9.59999C15.2686 9.59999 15 9.86862 15 10.2V16.9046L13.0152 14.5937L12.9329 14.5172C12.7011 14.3386 12.3806 14.3641 12.1742 14.5937C11.9419 14.852 11.9419 15.2708 12.1742 15.5291L15.1795 19.0063L15.2618 19.0828C15.4936 19.2614 15.8141 19.2359 16.0205 19.0063L19.0258 15.5291L19.0946 15.4375Z"
                fill="currentColor"
              />
            </svg>
          </button>
        </div>

        <div className={styles.controlsRow}>
          <div className={styles.actionButtons}>
            <button
              className={styles.btnSecondary}
              onClick={() => setShowCreateFolder(true)}
            >
              {t("interviews.createFolder")}
            </button>
            <button
              className={styles.btnPrimary}
              onClick={() => setShowCreateCard(true)}
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path
                  d="M10.625 3.5C10.625 3.155 10.345 2.875 10 2.875S9.375 3.155 9.375 3.5v8.491l-2.033-2.033a.625.625 0 10-.884.884l3.125 3.125a.625.625 0 00.884 0l3.125-3.125a.625.625 0 10-.884-.884L10.625 12.04V3.5z"
                  fill="white"
                />
                <path
                  d="M2.875 16.5c0-.345.28-.625.625-.625h13c.345 0 .625.28.625.625s-.28.625-.625.625H3.5a.625.625 0 01-.625-.625z"
                  fill="white"
                />
              </svg>
              {t("interviews.uploadInterview")}
            </button>
          </div>
        </div>
      </div>
      <div
        className={`${styles.searchRow} ${isMobileSearchOpen ? styles.mobileSearchOpen : ""}`}
      >
        <div className={styles.searchInputWrapper}>
          <svg
            className={styles.searchIcon}
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
          >
            <path
              d="M7.333 12.667A5.333 5.333 0 107.333 2a5.333 5.333 0 000 10.667zM14 14l-2.9-2.9"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <input
            type="text"
            className={styles.searchInput}
            placeholder={t("interviews.searchFoldersPlaceholder")}
            value={filtering.searchQuery}
            onChange={(e) => filtering.setSearchQuery(e.target.value)}
          />
        </div>
        <div className={styles.searchMeta}>
          <span className={styles.resultsCount}>
            {filtering.resultsCount} {t("interviews.results")}
          </span>
          <button className={styles.sortBtn} onClick={filtering.toggleSort}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path
                d="M3.5 8.167V2.333M3.5 2.333L1.167 4.667M3.5 2.333l2.333 2.334M10.5 5.833v5.834M10.5 11.667l2.333-2.334M10.5 11.667L8.167 9.333"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            {filtering.sortOrder === "recent"
              ? t("interviews.sortRecent")
              : t("interviews.sortOldest")}
          </button>
        </div>
      </div>

      {isLoading && folders.length === 0 ? (
        <div className={styles.loading}>
          {t("interviews.loadingInterviews")}
        </div>
      ) : (
        <div className={styles.foldersList}>
          {(filtering.filtered as Folder[]).map((folder) => (
            <div
              key={folder.id}
              className={styles.folderRow}
              onClick={() => selectFolder(folder.id)}
            >
              <div className={styles.folderRowIcon}>
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M6.634 12.98C6.492 12.98 6.37333 12.9327 6.278 12.838C6.18267 12.7433 6.135 12.6243 6.135 12.481C6.135 12.3377 6.18267 12.2187 6.278 12.124C6.37333 12.0293 6.49233 11.9817 6.635 11.981H8.827C8.96967 11.981 9.08867 12.0287 9.184 12.124C9.27933 12.2193 9.327 12.3383 9.327 12.481C9.327 12.6237 9.27933 12.7427 9.184 12.838C9.08867 12.9333 8.96967 12.981 8.827 12.981L6.634 12.98ZM6.001 18C4.79767 18 3.77233 17.5863 2.925 16.759C2.07767 15.9317 1.654 14.922 1.654 13.73V4.654C1.194 4.654 0.803333 4.49667 0.482 4.182C0.160667 3.86667 0 3.479 0 3.019V1.654C0 1.194 0.160667 0.803333 0.482 0.482C0.803333 0.160667 1.194 0 1.654 0H10.327C10.787 0 11.181 0.160667 11.509 0.482C11.8363 0.802667 12 1.19333 12 1.654V3.019C12 3.479 11.8363 3.86667 11.509 4.182C11.181 4.49667 10.787 4.654 10.327 4.654V7.519C10.327 7.967 10.1697 8.34833 9.855 8.663C9.54033 8.97767 9.15933 9.135 8.712 9.135H6.634C6.49133 9.135 6.37233 9.087 6.277 8.991C6.18167 8.895 6.134 8.77633 6.134 8.635C6.134 8.49367 6.18167 8.37467 6.277 8.278C6.37233 8.18133 6.49133 8.13333 6.634 8.134H9.326V4.654H2.654V13.731C2.654 14.6537 2.98067 15.4293 3.634 16.058C4.28733 16.6867 5.07633 17.0007 6.001 17C6.33967 17 6.66267 16.9553 6.97 16.866C7.27667 16.776 7.566 16.643 7.838 16.467C7.95133 16.3983 8.07233 16.378 8.201 16.406C8.32967 16.434 8.42833 16.507 8.497 16.625C8.57033 16.743 8.58967 16.8723 8.555 17.013C8.52033 17.1537 8.444 17.2603 8.326 17.333C7.98133 17.5403 7.61567 17.7033 7.229 17.822C6.84233 17.9407 6.43267 18 6 18M1.654 3.654H10.327C10.507 3.654 10.664 3.593 10.798 3.471C10.9327 3.349 11 3.19833 11 3.019V1.654C11 1.474 10.9327 1.32 10.798 1.192C10.6633 1.064 10.5063 1 10.327 1H1.654C1.474 1 1.32033 1.064 1.193 1.192C1.06567 1.32 1.00133 1.474 1 1.654V3.019C1 3.199 1.064 3.34967 1.192 3.471C1.32067 3.593 1.47467 3.654 1.654 3.654ZM15.814 15.487C16.3607 14.9397 16.634 14.2773 16.634 13.5C16.634 12.7227 16.3607 12.0607 15.814 11.514C15.2667 10.966 14.6043 10.692 13.827 10.692C13.0503 10.692 12.3883 10.966 11.841 11.514C11.2937 12.0607 11.02 12.7227 11.02 13.5C11.02 14.2773 11.2933 14.9397 11.84 15.487C12.3867 16.0343 13.049 16.3077 13.827 16.307C14.6043 16.307 15.2667 16.0337 15.814 15.487ZM13.827 17.307C12.7697 17.307 11.8707 16.937 11.13 16.197C10.3893 15.457 10.0193 14.558 10.02 13.5C10.0207 12.442 10.3907 11.543 11.13 10.803C11.8693 10.063 12.7683 9.693 13.827 9.693C14.8857 9.693 15.7847 10.063 16.524 10.803C17.2633 11.543 17.6333 12.442 17.634 13.5C17.634 13.92 17.5663 14.327 17.431 14.721C17.295 15.1143 17.0977 15.4817 16.839 15.823L19.281 18.266C19.3743 18.3593 19.421 18.4707 19.421 18.6C19.421 18.7293 19.3743 18.8407 19.281 18.934C19.1877 19.0273 19.073 19.0743 18.937 19.075C18.801 19.0757 18.686 19.029 18.592 18.935L16.15 16.511C15.8093 16.7703 15.442 16.968 15.048 17.104C14.6547 17.24 14.2477 17.308 13.827 17.308"
                    fill="#0263E0"
                  />
                </svg>
              </div>

              <div className={styles.folderRowNameWrapper}>
                <span className={styles.folderRowName}>{folder.name}</span>
              </div>

              <div className={styles.folderRowDescWrapper}>
                {folder.description && (
                  <span className={styles.folderRowDesc}>
                    {folder.description}
                  </span>
                )}
              </div>

              <div style={{ justifyContent: "center" }}>
                <span className={styles.folderRowCount}>
                  {formatCount(folder.interview_count || 0, t)}{" "}
                  {t("interviews.results")}
                </span>
              </div>

              <span className={styles.folderRowDate}>
                {formatDateShort(folder.created_at)}
              </span>

              <div
                className={styles.folderMenuWrapper}
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  className={styles.folderRowMenu}
                  onClick={() =>
                    setOpenMenuId(openMenuId === folder.id ? null : folder.id)
                  }
                >
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path
                      d="M10 14.5C10.827 14.5 11.5 15.173 11.5 16C11.5 16.827 10.827 17.5 10 17.5C9.173 17.5 8.5 16.827 8.5 16C8.5 15.173 9.173 14.5 10 14.5ZM10 8.5C10.827 8.5 11.5 9.173 11.5 10C11.5 10.827 10.827 11.5 10 11.5C9.173 11.5 8.5 10.827 8.5 10C8.5 9.173 9.173 8.5 10 8.5ZM10 2.5C10.827 2.5 11.5 3.173 11.5 4C11.5 4.827 10.827 5.5 10 5.5C9.173 5.5 8.5 4.827 8.5 4C8.5 3.173 9.173 2.5 10 2.5Z"
                      fill="#606B85"
                    />
                  </svg>
                </button>
                {openMenuId === folder.id && (
                  <div className={styles.dropdown}>
                    <button
                      className={styles.dropdownItem}
                      onClick={() => openRenameDialog(folder)}
                    >
                      <span>{t("common.edit")}</span>
                    </button>
                    <button
                      className={styles.dropdownItemDanger}
                      onClick={() => confirmDeleteFolder(folder)}
                    >
                      <span>{t("common.delete")}</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}

          <button
            className={styles.createFolderInline}
            onClick={() => setShowCreateFolder(true)}
          >
            {t("interviews.createFolder")}
          </button>
        </div>
      )}

      <button
        className={styles.mobileFab}
        onClick={() => setShowCreateFolder(true)}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          style={{ marginRight: 8 }}
        >
          <path
            d="M8 3.333v9.334M3.333 8h9.334"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
        {t("interviews.startResearch")}
      </button>

      {showRename && (
        <div
          className={styles.renameOverlay}
          onClick={() => setShowRename(false)}
        >
          <div
            className={styles.renameDialog}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.renameHeader}>
              {t("interviews.renameFolder.title")}
            </div>
            <input
              ref={renameInputRef}
              className={styles.renameInput}
              placeholder={t("interviews.renameFolder.placeholder")}
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submitRename()}
            />
            <div className={styles.renameActions}>
              <button
                className={styles.renameBtnCancel}
                onClick={() => setShowRename(false)}
              >
                {t("common.cancel")}
              </button>
              <button
                className={styles.renameBtnConfirm}
                onClick={submitRename}
              >
                {t("common.save")}
              </button>
            </div>
          </div>
        </div>
      )}

      <CreateFolderDialog
        isOpen={showCreateFolder}
        onClose={() => setShowCreateFolder(false)}
        onCreated={handleFolderCreated}
      />

      <CreateCardDialog
        isOpen={showCreateCard}
        folders={folders}
        onClose={() => setShowCreateCard(false)}
        onCreated={handleCardCreated}
      />

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title={t("common.delete")}
        message={
          folderToDelete
            ? t("interviews.deleteFolderConfirm", { name: folderToDelete.name })
            : ""
        }
        type="danger"
        onConfirm={executeDelete}
        onClose={() => setShowDeleteConfirm(false)}
      />

      <button
        className={styles.mobileFab}
        onClick={() => setShowCreateCard(true)}
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ marginRight: 8 }}
        >
          <path
            d="M10 4.16667V15.8333"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M4.16699 10H15.8337"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        {t("interviews.uploadInterview")}
      </button>
    </div>
  );
}
