"use client";

import { flexRender, type Table } from "@tanstack/react-table";
import type { Idea } from "../../types/ideas.types";
import { getIdeaTypeLabel, getIdeaStatusLabel, getStatusClass } from "../../utils/ideaPresentation";
import styles from "./IdeasTable.module.css";

interface IdeasTableProps {
  table: Table<Idea>;
  onGoToIdea: (id: string) => void;
  onStartPriorityEdit: (idea: Idea) => void;
  onSavePriority: (ideaId: string, onUpdate: (id: string, value: number) => void) => void;
  onCancelPriorityEdit: () => void;
  editingPriorityId: string | null;
  editingPriorityValue: number | null;
  onSetEditingPriorityValue: (val: number) => void;
  t: (key: string, values?: Record<string, any>) => string;
  mobileLayout: "horizontal" | "vertical";
}

export default function IdeasTable({
  table,
  onGoToIdea,
  onStartPriorityEdit,
  onSavePriority,
  onCancelPriorityEdit,
  editingPriorityId,
  editingPriorityValue,
  onSetEditingPriorityValue,
  t,
  mobileLayout,
}: IdeasTableProps) {
  return (
    <div className={`${styles.tableWrapper} ${mobileLayout === "vertical" ? styles.forceVerticalMobile : ""}`}>
      <table className={styles.ideasTable}>
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                const canSort = header.column.getCanSort();
                const isSorted = header.column.getIsSorted();

                return (
                  <th
                    key={header.id}
                    className={styles[`col${header.id.charAt(0).toUpperCase() + header.id.slice(1)}`]}
                    onClick={header.column.getToggleSortingHandler()}
                    style={{ cursor: canSort ? "pointer" : "default" }}
                  >
                    {header.id === "selection" ? (
                      <label className={styles.customCheckbox} onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={table.getIsAllRowsSelected()}
                          onChange={table.getToggleAllRowsSelectedHandler()}
                          ref={(el) => {
                            if (el) {
                              el.indeterminate = table.getIsSomeRowsSelected();
                            }
                          }}
                        />
                        <span className={styles.checkmark}></span>
                      </label>
                    ) : (
                      <div className={styles.thContent}>
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {canSort && (
                          <span className={styles.sortArrows}>
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className={styles.sortIcon}>
                              <rect width="20" height="20" fill="white" fillOpacity="0.01" />
                              <path
                                d="M4.08781 7.13538C3.954 7.3502 3.97312 7.64722 4.14516 7.83856L4.2138 7.90234C4.40695 8.05116 4.674 8.0299 4.84604 7.83856L6.5 5.91409V11.5C6.5 11.7761 6.72386 12 7 12C7.27614 12 7.5 11.7761 7.5 11.5V5.91284L9.15396 7.83856L9.2226 7.90234C9.41575 8.05116 9.6828 8.0299 9.85484 7.83856C10.0484 7.6233 10.0484 7.2743 9.85484 7.05904L7.35044 4.16144L7.2818 4.09766C7.08865 3.94884 6.8216 3.9701 6.64956 4.16144L4.14516 7.05904L4.08781 7.13538Z"
                                fill={isSorted === "asc" ? "#006DFA" : "#606B85"}
                              />
                              <path
                                d="M15.9122 12.8646C16.046 12.6498 16.0269 12.3528 15.8548 12.1614L15.7862 12.0977C15.5931 11.9488 15.326 11.9701 15.154 12.1614L13.5 14.0859V8.5C13.5 8.22386 13.2761 8 13 8C12.7239 8 12.5 8.22386 12.5 8.5V14.0872L10.846 12.1614L10.7774 12.0977C10.5842 11.9488 10.3172 11.9701 10.1452 12.1614C9.95161 12.3767 9.95161 12.7257 10.1452 12.941L12.6496 15.8386L12.7182 15.9023C12.9114 16.0512 13.1784 16.0299 13.3504 15.8386L15.8548 12.941L15.9122 12.8646Z"
                                fill={isSorted === "desc" ? "#006DFA" : "#606B85"}
                              />
                            </svg>
                          </span>
                        )}
                      </div>
                    )}
                  </th>
                );
              })}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id} className={row.getIsSelected() ? styles.isSelected : ""}>
              {row.getVisibleCells().map((cell) => (
                <td
                  key={cell.id}
                  className={styles[`col${cell.column.id.charAt(0).toUpperCase() + cell.column.id.slice(1)}`]}
                >
                  {cell.column.id === "selection" ? (
                    <label className={styles.customCheckbox}>
                      <input
                        type="checkbox"
                        checked={row.getIsSelected()}
                        onChange={row.getToggleSelectedHandler()}
                      />
                      <span className={styles.checkmark}></span>
                    </label>
                  ) : cell.column.id === "name" ? (
                    <div className={styles.ideaCellContent} onClick={() => onGoToIdea(row.original.id)}>
                      <div className={styles.ideaTitle}>{row.original.name}</div>
                      {row.original.description && (
                        <div className={styles.ideaDesc}>{row.original.description}</div>
                      )}
                      <div className={styles.ideaTooltip}>
                        <div className={styles.tooltipTitle}>{row.original.fullName || row.original.name}</div>
                        {row.original.description && (
                          <div className={styles.tooltipDesc}>{row.original.description}</div>
                        )}
                      </div>
                    </div>
                  ) : cell.column.id === "type" ? (
                    <span className={styles.typeText}>{getIdeaTypeLabel(t, row.original.type)}</span>
                  ) : cell.column.id === "status" ? (
                    <span className={`${styles.statusBadge} ${styles[getStatusClass(row.original.status)]}`}>
                      {getIdeaStatusLabel(t, row.original.status)}
                    </span>
                  ) : cell.column.id === "pain" ? (
                    <>
                      <div className={styles.dotsRating}>
                        {Array.from({ length: 10 }).map((_, i) => (
                          <span
                            key={i}
                            className={`${styles.dot} ${i < row.original.pain ? styles.active : ""}`}
                          ></span>
                        ))}
                      </div>
                      <span className={styles.painNumber}>{row.original.pain}</span>
                    </>
                  ) : cell.column.id === "priority" ? (
                    editingPriorityId === row.original.id ? (
                      <div className={styles.priorityEditWrapper} onClick={(e) => e.stopPropagation()}>
                        <input
                          type="number"
                          className={styles.priorityInput}
                          value={editingPriorityValue ?? 0}
                          onChange={(e) => onSetEditingPriorityValue(Number(e.target.value))}
                          min={1}
                          max={10}
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              onSavePriority(row.original.id, (id, val) => {
                                row.original.priority = val;
                              });
                            } else if (e.key === "Escape") {
                              onCancelPriorityEdit();
                            }
                          }}
                        />
                        <button
                          className={styles.priorityConfirmBtn}
                          onClick={() =>
                            onSavePriority(row.original.id, (id, val) => {
                              row.original.priority = val;
                            })
                          }
                        >
                          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                            <path
                              d="M11.6667 3.5L5.25001 9.91667L2.33334 7"
                              stroke="#006DFA"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </button>
                      </div>
                    ) : (
                      <div className={styles.priorityDisplayWrapper} onClick={() => onStartPriorityEdit(row.original)}>
                        <span className={styles.priorityBox}>{row.original.priority}</span>
                      </div>
                    )
                  ) : cell.column.id === "folder" ? (
                    <span className={styles.folderBadge}>{row.original.folder}</span>
                  ) : cell.column.id === "confidence" ? (
                    <div className={styles.confidenceWrapper}>
                      <div className={styles.progressTrack}>
                        <div
                          className={styles.progressFill}
                          style={{ width: `${row.original.confidence}%` }}
                        ></div>
                      </div>
                      <span className={styles.confidenceText}>{row.original.confidence}%</span>
                    </div>
                  ) : cell.column.id === "evidence" ? (
                    <div className={styles.evidenceStats}>
                      {row.original.evidenceUp > 0 && (
                        <span className={styles.evUp}>
                          <svg width="8" height="10" viewBox="0 0 8 10" fill="none">
                            <path
                              d="M4 9.5V1M4 1L1 4M4 1L7 4"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                          {row.original.evidenceUp}
                        </span>
                      )}
                      {row.original.evidenceDown > 0 && (
                        <span className={styles.evDown}>
                          <svg width="8" height="10" viewBox="0 0 8 10" fill="none">
                            <path
                              d="M4 0.5V9M4 9L1 6M4 9L7 6"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                          {row.original.evidenceDown}
                        </span>
                      )}
                    </div>
                  ) : (
                    flexRender(cell.column.columnDef.cell, cell.getContext())
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

