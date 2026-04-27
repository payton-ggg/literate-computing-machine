"use client";

import styles from "./IdeasPageTitle.module.css";

interface IdeasPageTitleProps {
  title: string;
  onToggleSearch: () => void;
  onToggleFilter: () => void;
  onToggleViewSettings: () => void;
  isMobileSearchOpen: boolean;
  totalActiveFilters: number;
  activeVisibleColumnsCount: number;
}

export default function IdeasPageTitle({
  title,
  onToggleSearch,
  onToggleFilter,
  onToggleViewSettings,
  isMobileSearchOpen,
  totalActiveFilters,
  activeVisibleColumnsCount,
}: IdeasPageTitleProps) {
  return (
    <div className={styles.titleSection}>
      <div className={styles.titleContent}>
        <div className={styles.titleWithIcon}>
          <svg
            className={styles.desktopOnlyIcon}
            width="32"
            height="32"
            viewBox="0 0 32 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M15.9834 5.84961C20.6701 5.9034 24.4612 9.66584 24.5322 14.334C24.5626 17.3818 22.9286 20.2057 20.2656 21.707V23.6992C20.2641 25.1069 19.1192 26.2484 17.7061 26.25H16.8525V27.9492C16.8525 28.4187 16.4703 28.7998 15.999 28.7998C15.5278 28.7997 15.1455 28.4186 15.1455 27.9492V26.25H14.293C12.8798 26.2485 11.734 25.1069 11.7324 23.6992V21.707C9.07233 20.2075 7.43862 17.3882 7.46582 14.3438C7.52797 9.68228 11.3038 5.91687 15.9834 5.84961ZM13.4395 22V23.6992C13.4399 24.1685 13.8219 24.5494 14.293 24.5498H17.7061C18.1771 24.5493 18.5591 24.1684 18.5596 23.6992V22H13.4395ZM15.9834 7.5498C12.2363 7.61644 9.22047 10.6363 9.17285 14.3691C9.15065 16.8443 10.5074 19.128 12.6963 20.2998H15.1455V17.252L12.8359 14.9502C12.6198 14.7356 12.5355 14.4225 12.6143 14.1289C12.6931 13.8353 12.923 13.6058 13.2178 13.5273C13.5126 13.4488 13.8276 13.5336 14.043 13.749L15.999 15.6973L17.9561 13.749C18.2894 13.4182 18.8284 13.4186 19.1611 13.75C19.4939 14.0815 19.4943 14.6181 19.1621 14.9502L16.8525 17.252V20.2998H19.3027C21.4939 19.1265 22.851 16.8392 22.8262 14.3613C22.7708 10.6211 19.7383 7.60276 15.9834 7.5498ZM5.75879 13.5C6.23007 13.5 6.6123 13.8802 6.6123 14.3496C6.6123 14.8191 6.23007 15.1992 5.75879 15.1992H4.05273C3.58145 15.1992 3.19922 14.8191 3.19922 14.3496C3.19922 13.8802 3.58145 13.5 4.05273 13.5H5.75879ZM27.9463 13.5C28.4174 13.5002 28.7988 13.8803 28.7988 14.3496C28.7988 14.8189 28.4174 15.199 27.9463 15.1992H26.2393C25.768 15.1992 25.3857 14.8191 25.3857 14.3496C25.3857 13.8802 25.768 13.5 26.2393 13.5H27.9463ZM5.99902 5.2627C6.32494 4.92487 6.86402 4.91268 7.2041 5.23633L8.45508 6.43457C8.79487 6.7599 8.80603 7.29819 8.47949 7.63672C8.15286 7.97504 7.61231 7.98533 7.27246 7.66016L6.02148 6.46289C5.6833 6.13734 5.67328 5.60055 5.99902 5.2627ZM25.4033 4.99902C25.6295 5.00362 25.8444 5.09812 26.001 5.26074C26.3275 5.59927 26.3173 6.13756 25.9775 6.46289L24.7256 7.66016C24.3855 7.98387 23.8464 7.97261 23.5205 7.63477C23.1947 7.29692 23.2048 6.76014 23.543 6.43457L24.7949 5.23633C24.958 5.08013 25.1771 4.99454 25.4033 4.99902ZM15.999 1.59961C16.4702 1.59961 16.8523 1.97996 16.8525 2.44922V4.14941C16.8526 4.37485 16.7626 4.59157 16.6025 4.75098C16.4425 4.91026 16.2253 5.00002 15.999 5C15.7728 4.99996 15.5555 4.91034 15.3955 4.75098C15.2355 4.59157 15.1455 4.37485 15.1455 4.14941V2.44922C15.1457 1.98002 15.528 1.59971 15.999 1.59961Z"
              fill="currentColor"
            />
          </svg>
          <h1 className={styles.pageMainTitle}>{title}</h1>
        </div>

        <div className={styles.mobileTopActions}>
          {/* Search toggle */}
          <button
            className={`${styles.filterIconBtn} ${isMobileSearchOpen ? styles.active : ""}`}
            onClick={(e) => {
              e.stopPropagation();
              if (e.nativeEvent.stopImmediatePropagation) e.nativeEvent.stopImmediatePropagation();
              onToggleSearch();
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
              <path d="M20 20L17 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>

          {/* Filter toggle */}
          <button
            className={`${styles.filterIconBtn} ${totalActiveFilters > 0 ? styles.active : ""}`}
            onClick={(e) => {
              e.stopPropagation();
              if (e.nativeEvent.stopImmediatePropagation) e.nativeEvent.stopImmediatePropagation();
              onToggleFilter();
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M4 6H20M7 12H17M10 18H14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {totalActiveFilters > 0 && (
              <span className={styles.badge}>{totalActiveFilters}</span>
            )}
          </button>

          {/* View settings toggle */}
          <button
            className={`${styles.filterIconBtn} ${activeVisibleColumnsCount > 0 ? styles.active : ""}`}
            onClick={(e) => {
              e.stopPropagation();
              if (e.nativeEvent.stopImmediatePropagation) e.nativeEvent.stopImmediatePropagation();
              onToggleViewSettings();
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="6" width="18" height="2" rx="1" fill="currentColor" />
              <rect x="3" y="15" width="18" height="2" rx="1" fill="currentColor" />
              <circle cx="7" cy="7" r="3" fill="var(--bg)" stroke="currentColor" strokeWidth="2" />
              <circle cx="17" cy="16" r="3" fill="var(--bg)" stroke="currentColor" strokeWidth="2" />
            </svg>
            {activeVisibleColumnsCount > 0 && (
              <span className={styles.badge}>{activeVisibleColumnsCount}</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

