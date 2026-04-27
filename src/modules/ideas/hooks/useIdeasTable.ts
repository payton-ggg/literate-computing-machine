"use client";

import { useState, useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  type ColumnDef,
  type SortingState,
  type ColumnFiltersState,
  type VisibilityState,
  type RowSelectionState,
  type Row,
  type FilterFn,
} from "@tanstack/react-table";
import type { Idea, IdeaFilters } from "../types/ideas.types";

interface UseIdeasTableOptions {
  data: Idea[];
  activeFilters: IdeaFilters;
  activeVisibleColumns: string[];
  isEmbedded: boolean;
  t: (key: string, values?: Record<string, any>) => string;
}

const multiSelectFilter: FilterFn<Idea> = (
  row: Row<Idea>,
  columnId: string,
  filterValue: string[],
) => {
  if (!filterValue || filterValue.length === 0) return true;
  return filterValue.includes(row.getValue(columnId) as string);
};

export function useIdeasTable({
  data,
  activeFilters,
  activeVisibleColumns,
  isEmbedded,
  t,
}: UseIdeasTableOptions) {
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);

  const columns = useMemo<ColumnDef<Idea>[]>(
    () => [
      {
        id: "selection",
        header: "",
        enableSorting: false,
      },
      {
        accessorKey: "name",
        id: "name",
        header: t("ideasPage.columns.idea"),
        enableSorting: false,
      },
      {
        accessorKey: "type",
        id: "type",
        header: t("ideasPage.columns.type"),
        enableSorting: false,
        filterFn: multiSelectFilter,
      },
      {
        accessorKey: "status",
        id: "status",
        header: t("ideasPage.columns.status"),
        enableSorting: false,
        filterFn: multiSelectFilter,
      },
      {
        accessorKey: "pain",
        id: "pain",
        header: t("ideasPage.columns.pain"),
        enableSorting: true,
      },
      {
        accessorKey: "priority",
        id: "priority",
        header: t("ideasPage.columns.priority"),
        enableSorting: true,
      },
      {
        accessorKey: "folder",
        id: "folder",
        header: t("ideasPage.columns.folder"),
        enableSorting: false,
      },
      {
        accessorKey: "confidence",
        id: "confidence",
        header: t("ideasPage.columns.confidence"),
        enableSorting: true,
      },
      {
        id: "evidence",
        header: t("ideasPage.columns.evidence"),
        enableSorting: false,
      },
    ],
    [t],
  );

  const columnFilters = useMemo<ColumnFiltersState>(() => {
    const filters: ColumnFiltersState = [];
    if (activeFilters.type.length > 0)
      filters.push({ id: "type", value: activeFilters.type });
    if (activeFilters.status.length > 0)
      filters.push({ id: "status", value: activeFilters.status });
    if (activeFilters.folder)
      filters.push({ id: "folder", value: activeFilters.folder });
    return filters;
  }, [activeFilters]);

  const columnVisibility = useMemo<VisibilityState>(() => {
    const allColIds = [
      "type",
      "status",
      "pain",
      "folder",
      "priority",
      "confidence",
      "evidence",
    ];
    const visibility: VisibilityState = { selection: true, name: true };

    if (activeVisibleColumns.length === 0) {
      allColIds.forEach((c) => (visibility[c] = true));
    } else {
      allColIds.forEach(
        (c) => (visibility[c] = activeVisibleColumns.includes(c)),
      );
    }

    if (isEmbedded) {
      visibility.folder = false;
    }

    return visibility;
  }, [activeVisibleColumns, isEmbedded]);

  const table = useReactTable({
    data,
    columns,
    state: {
      rowSelection,
      globalFilter,
      sorting,
      columnFilters,
      columnVisibility,
    },
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    enableRowSelection: true,
    getRowId: (row) => row.id,
  });

  const isEmptyState = useMemo(() => {
    return false; // Computed externally by page based on loading/error/data
  }, []);

  const selectedCount = table.getSelectedRowModel().rows.length;

  const resultsCountText = `${table.getFilteredRowModel().rows.length} ${t("interviews.results")}`;

  return {
    table,
    rowSelection,
    globalFilter,
    setGlobalFilter,
    sorting,
    selectedCount,
    resultsCountText,
    isEmptyState,
  };
}
