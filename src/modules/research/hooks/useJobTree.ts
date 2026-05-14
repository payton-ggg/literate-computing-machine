"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useTranslations } from "next-intl";

import { jtbdApi, folderJtbdApi } from "../api/research.api";
import { interviewApi, folderApi } from "../api/interviews.api";
import { ideasApi } from "@/modules/ideas/api/ideas.api";
import type {
  JobTree,
  FlatNode,
  Connection,
  EditNodeForm,
  Toast,
  NodeLevel,
} from "../types/jobTree.types";
import type { Folder } from "../types/interview.types";

interface UseJobTreeOptions {
  interviewId?: string;
  folderId?: string;
}

export function useJobTree({ interviewId, folderId }: UseJobTreeOptions) {
  const t = useTranslations();

  const isFolderMode = !!folderId;
  const [localFolderId, setLocalFolderId] = useState<string | null>(null);
  const activeFolderId = folderId || localFolderId;

  const [folders, setFolders] = useState<Folder[]>([]);
  const [interviewTitle, setInterviewTitle] = useState("");
  const [fullTree, setFullTree] = useState<JobTree | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isExtracting, setIsExtracting] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);

  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [collapsedNodes, setCollapsedNodes] = useState<Set<string>>(new Set());

  const [flatNodes, setFlatNodes] = useState<FlatNode[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [canvasDims, setCanvasDims] = useState({ w: 4000, h: 3000 });

  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastIdRef = useRef(0);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [nodeToDelete, setNodeToDelete] = useState<FlatNode | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [isSavingNode, setIsSavingNode] = useState(false);
  const [editNodeForm, setEditNodeForm] = useState<EditNodeForm>({
    id: "",
    name: "",
    level: "core",
    when_trigger: "",
    i_want_to: "",
    so_that: "",
    current_solution: "",
    context: "",
  });
  const [showTransferModal, setShowTransferModal] = useState(false);

  const folderData = folders.find(
    (f) => String(f.id) === String(activeFolderId),
  ) || (activeFolderId ? { id: activeFolderId, name: "" } : null);

  const selectedNode = flatNodes.find((n) => n.id === selectedNodeId) || null;

  const currentNodeIndex = flatNodes.findIndex(
    (n) => n.id === selectedNodeId,
  );
  const canNavigatePrev = currentNodeIndex > 0;
  const canNavigateNext =
    currentNodeIndex >= 0 && currentNodeIndex < flatNodes.length - 1;

  const showToast = useCallback(
    (message: string, type: "success" | "error" = "success") => {
      const id = toastIdRef.current++;
      setToasts((prev) => [...prev, { id, message, type }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 3000);
    },
    [],
  );

  const calculateLayout = useCallback(
    (tree: JobTree | null, collapsed: Set<string>) => {
      const nodes: FlatNode[] = [];
      const conns: Connection[] = [];
      let connId = 1;

      if (!tree) {
        setFlatNodes([]);
        setConnections([]);
        return;
      }

      const CARD_W = 320;
      const GAP_X = 100;
      const GAP_Y = 160;
      const SECTOR_GAP = 400;

      let sectorsData;
      if (isFolderMode && tree.sectors) {
        sectorsData = tree.sectors;
      } else {
        sectorsData = [
          {
            sector: tree.segment || {
              id: "seg-1",
              name: interviewTitle || "Project Root",
              level: "sector" as const,
            },
            high_level_jobs: tree.high_level_jobs || [],
          },
        ];
      }

      let currentSectorX = 0;

      sectorsData.forEach((sectorEntry, si) => {
        const segment = sectorEntry.sector;
        const highLevelJobs = sectorEntry.high_level_jobs || [];

        const hlSubwidths = highLevelJobs.map((hlEntry) => {
          const hl = hlEntry.high_level_job;
          const isHlCollapsed = collapsed.has(hl.id);
          const coreJobs = isHlCollapsed ? [] : hlEntry.core_jobs || [];

          let hlWidth = 0;
          coreJobs.forEach((coreEntry) => {
            const core = coreEntry.core_job;
            const isCoreCollapsed = collapsed.has(core.id);
            const microNodes = isCoreCollapsed
              ? []
              : coreEntry.micro_jobs || [];
            const coreWidth =
              Math.max(1, microNodes.length) * (CARD_W + GAP_X);
            hlWidth += coreWidth;
          });

          return Math.max(hlWidth, CARD_W + GAP_X);
        });

        const totalSectorWidth = hlSubwidths.reduce((a, b) => a + b, 0);

        const segNode: FlatNode = {
          ...segment,
          x:
            currentSectorX +
            (totalSectorWidth > 0
              ? (totalSectorWidth - GAP_X) / 2
              : 0) -
            CARD_W / 2,
          y: 50,
          w: 320,
          h: 100,
          level: "sector",
          sectorIndex: si,
        };
        nodes.push(segNode);

        const hlY = segNode.y + segNode.h + GAP_Y;
        let hlX = currentSectorX;

        highLevelJobs.forEach((hlEntry, hli) => {
          const hl = hlEntry.high_level_job;
          const subwidth = hlSubwidths[hli];
          const isHlCollapsed = collapsed.has(hl.id);
          const coreJobs = isHlCollapsed ? [] : hlEntry.core_jobs || [];

          const hlNodeX = hlX + (subwidth - GAP_X) / 2 - CARD_W / 2;
          const hlNode: FlatNode = {
            ...hl,
            level: "high_level",
            x: hlNodeX,
            y: hlY,
            w: CARD_W,
            h: 90,
            parentId: segNode.id,
            sectorIndex: si,
          };
          nodes.push(hlNode);

          const sfx = segNode.x + segNode.w / 2;
          const sfy = segNode.y + segNode.h;
          const stx = hlNode.x + hlNode.w / 2;
          const sty = hlNode.y;
          conns.push({
            id: `seg-to-${hlNode.id}`,
            path: `M${sfx} ${sfy} C${sfx} ${sfy + GAP_Y / 2} ${stx} ${sty - GAP_Y / 2} ${stx} ${sty}`,
          });

          const coreY = hlY + hlNode.h + GAP_Y;
          let coreX = hlX;

          coreJobs.forEach((coreEntry) => {
            const core = coreEntry.core_job;
            const isCoreCollapsed = collapsed.has(core.id);
            const microJobs = isCoreCollapsed
              ? []
              : coreEntry.micro_jobs || [];

            const coreSubwidth =
              Math.max(1, microJobs.length) * (CARD_W + GAP_X);
            const coreNodeX =
              coreX + (coreSubwidth - GAP_X) / 2 - CARD_W / 2;

            const coreNode: FlatNode = {
              ...core,
              level: "core",
              x: coreNodeX,
              y: coreY,
              w: CARD_W,
              h: 90,
              parentId: hlNode.id,
              data: core,
              sectorIndex: si,
            };
            nodes.push(coreNode);

            const hfx = hlNode.x + hlNode.w / 2;
            const hfy = hlNode.y + hlNode.h;
            const htx = coreNode.x + coreNode.w / 2;
            const hty = coreNode.y;
            conns.push({
              id: connId++,
              path: `M${hfx} ${hfy} C${hfx} ${hfy + GAP_Y / 2} ${htx} ${hty - GAP_Y / 2} ${htx} ${hty}`,
            });

            const microY = coreY + coreNode.h + GAP_Y;
            let mX = coreX;

            microJobs.forEach((micro) => {
              const microNode: FlatNode = {
                ...micro,
                level: "micro",
                x: mX,
                y: microY,
                w: CARD_W,
                h: 90,
                parentId: coreNode.id,
                data: micro,
                sectorIndex: si,
              };
              nodes.push(microNode);

              const mfx = coreNode.x + coreNode.w / 2;
              const mfy = coreNode.y + coreNode.h;
              const mtx = microNode.x + microNode.w / 2;
              const mty = microNode.y;
              conns.push({
                id: connId++,
                path: `M${mfx} ${mfy} C${mfx} ${mfy + GAP_Y / 2} ${mtx} ${mty - GAP_Y / 2} ${mtx} ${mty}`,
              });

              mX += CARD_W + GAP_X;
            });

            coreX += coreSubwidth;
          });

          hlX += subwidth;
        });

        currentSectorX +=
          Math.max(totalSectorWidth, CARD_W) + SECTOR_GAP;
      });

      setFlatNodes(nodes);
      setConnections(conns);

      if (nodes.length > 0) {
        const maxX = Math.max(...nodes.map((n) => n.x + n.w));
        const maxY = Math.max(...nodes.map((n) => n.y + (n.h || 100)));
        setCanvasDims({ w: maxX + 2000, h: maxY + 2000 });
      }
    },
    [isFolderMode, interviewTitle],
  );

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      if (isFolderMode) {
        const foldersRes = await folderApi.list();
        const foldersList = foldersRes.data?.folders ?? foldersRes.data ?? [];
        setFolders(foldersList);

        const found = foldersList.find(
          (f: Folder) => String(f.id) === String(folderId),
        );
        setInterviewTitle(found?.name || "");

        try {
          const hasResp = await folderJtbdApi.hasFolderJobTree(folderId!);
          if (hasResp.data?.has_folder_job_tree) {
            const resp = await folderJtbdApi.getFolderJobTree(folderId!);
            setFullTree(resp.data);
            calculateLayout(resp.data, collapsedNodes);
          } else {
            setFullTree(null);
            calculateLayout(null, collapsedNodes);
          }
        } catch (err: unknown) {
          const error = err as { response?: { status?: number } };
          if (error.response?.status === 404) {
            setFullTree(null);
            calculateLayout(null, collapsedNodes);
          } else {
            throw err;
          }
        }
      } else {
        const intvResponse = await interviewApi.get(interviewId!);
        setInterviewTitle(intvResponse.data.title);
        setLocalFolderId(intvResponse.data.folder_id);

        const foldersRes = await folderApi.list();
        setFolders(foldersRes.data?.folders ?? foldersRes.data ?? []);

        const hasJobsResp = await jtbdApi.hasJobs(interviewId!);
        if (hasJobsResp.data.has_jobs) {
          const resp = await jtbdApi.getJobTree(interviewId!);
          setFullTree(resp.data);
          calculateLayout(resp.data, collapsedNodes);
        } else {
          setFullTree(null);
          calculateLayout(null, collapsedNodes);
        }
      }
    } catch (e) {
      console.error("Tree load error:", e);
      showToast(t("jtbd.loadError") || "Error loading tree", "error");
      setFullTree(null);
    } finally {
      setIsLoading(false);
    }
  }, [
    isFolderMode,
    folderId,
    interviewId,
    showToast,
    t,
    calculateLayout,
    collapsedNodes,
  ]);

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isFullScreen) {
        setIsFullScreen(false);
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isFullScreen]);

  const extractTree = useCallback(async () => {
    setIsExtracting(true);
    try {
      let resp;
      if (isFolderMode) {
        resp = await folderJtbdApi.generateFolderJobTree(folderId!);
        showToast(t("folderJtbd.generateSuccess") || "Tree generated");
      } else {
        resp = await jtbdApi.extractJobs(interviewId!);
        showToast(t("jtbd.extractSuccess") || "Tree extracted successfully");
      }
      setFullTree(resp.data);
      calculateLayout(resp.data, collapsedNodes);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } }; message?: string };
      showToast(
        isFolderMode
          ? t("folderJtbd.generateError")
          : t("jtbd.extractError"),
        "error",
      );
      console.error("Extract error:", err.response?.data?.error || err.message);
    } finally {
      setIsExtracting(false);
    }
  }, [
    isFolderMode,
    folderId,
    interviewId,
    showToast,
    t,
    calculateLayout,
    collapsedNodes,
  ]);

  const toggleCollapse = useCallback(
    (node: FlatNode) => {
      setCollapsedNodes((prev) => {
        const next = new Set(prev);
        if (next.has(node.id)) {
          next.delete(node.id);
        } else {
          next.add(node.id);
        }
        calculateLayout(fullTree, next);
        return next;
      });
    },
    [fullTree, calculateLayout],
  );

  const selectNode = useCallback((node: FlatNode) => {
    setSelectedNodeId(node.id);
  }, []);

  const getChildren = useCallback(
    (node: FlatNode) => {
      return flatNodes.filter((n) => n.parentId === node.id);
    },
    [flatNodes],
  );

  const getChildrenTitle = useCallback(
    (level: NodeLevel) => {
      const map: Record<string, string> = {
        sector: t("jtbd.highLevel"),
        high_level: t("jtbd.coreJob"),
        core: t("jtbd.microJob"),
      };
      return map[level] || "";
    },
    [t],
  );

  const getBadgeLabel = useCallback((level: NodeLevel) => {
    const map: Record<string, string> = {
      sector: "Segment",
      high_level: "High level",
      core: "Core",
      micro: "Micro",
    };
    return map[level] || "Job";
  }, []);

  const getImportanceColor = useCallback((v?: number) => {
    return v && v > 7 ? "var(--warning)" : "var(--muted)";
  }, []);

  const getSatisfactionColor = useCallback((v?: number) => {
    return v && v > 7 ? "var(--success)" : "var(--danger)";
  }, []);

  const navigatePrev = useCallback(() => {
    if (canNavigatePrev) {
      const node = flatNodes[currentNodeIndex - 1];
      setSelectedNodeId(node.id);
      return node;
    }
    return null;
  }, [canNavigatePrev, flatNodes, currentNodeIndex]);

  const navigateNext = useCallback(() => {
    if (canNavigateNext) {
      const node = flatNodes[currentNodeIndex + 1];
      setSelectedNodeId(node.id);
      return node;
    }
    return null;
  }, [canNavigateNext, flatNodes, currentNodeIndex]);

  const handleExport = useCallback(() => {
    try {
      const dataStr =
        "data:text/json;charset=utf-8," +
        encodeURIComponent(JSON.stringify(fullTree, null, 2));
      const downloadAnchorNode = document.createElement("a");
      downloadAnchorNode.setAttribute("href", dataStr);
      downloadAnchorNode.setAttribute(
        "download",
        `jobs_${interviewId || folderId}.json`,
      );
      document.body.appendChild(downloadAnchorNode);
      downloadAnchorNode.click();
      downloadAnchorNode.remove();
      showToast(t("jtbd.exportSuccess") || "Exported to JSON");
    } catch {
      showToast(t("jtbd.exportError") || "Export failed", "error");
    }
  }, [fullTree, interviewId, folderId, showToast, t]);

  const handleTransferSingle = useCallback(() => {
    setShowTransferModal(true);
  }, []);

  const onTransferSuccess = useCallback(
    (ideaName: string) => {
      showToast(
        t("jtbd.transferSuccessMsg", { name: ideaName }) ||
          `Idea "${ideaName}" added successfully`,
      );
    },
    [showToast, t],
  );

  const openEditModal = useCallback((node: FlatNode) => {
    setEditNodeForm({
      id: node.id,
      name: node.name,
      level: node.level,
      when_trigger: node.data?.when_trigger || "",
      i_want_to: node.data?.i_want_to || "",
      so_that: node.data?.so_that || "",
      current_solution: node.data?.current_solution || "",
      context: node.data?.context || "",
    });
    setShowEditModal(true);
  }, []);

  const closeEditModal = useCallback(() => {
    setShowEditModal(false);
  }, []);

  const saveEditNode = useCallback(async () => {
    if (!editNodeForm.name.trim()) {
      showToast(
        t("jtbd.editModal.nameRequired") || "Name is required",
        "error",
      );
      return;
    }

    setIsSavingNode(true);
    try {
      const payload: Record<string, unknown> = {
        name: editNodeForm.name.trim(),
      };

      if (editNodeForm.level === "core") {
        payload.when_trigger = editNodeForm.when_trigger;
        payload.i_want_to = editNodeForm.i_want_to;
        payload.so_that = editNodeForm.so_that;
        payload.current_solution = editNodeForm.current_solution;
      } else if (editNodeForm.level === "micro") {
        payload.context = editNodeForm.context;
      }

      await jtbdApi.updateJob(
        interviewId || nodeToDelete?.interview_id || "",
        editNodeForm.id,
        payload,
      );

      showToast(t("jtbd.editModal.success") || "Job updated successfully");
      closeEditModal();
      await loadData();
    } catch (err) {
      console.error("Failed to update job:", err);
      showToast(t("jtbd.editModal.error") || "Update failed", "error");
    } finally {
      setIsSavingNode(false);
    }
  }, [
    editNodeForm,
    interviewId,
    nodeToDelete,
    showToast,
    t,
    closeEditModal,
    loadData,
  ]);

  const handleDownloadNode = useCallback(
    (node: FlatNode) => {
      try {
        const blob = new Blob([JSON.stringify(node, null, 2)], {
          type: "application/json",
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `job_${node.id}.json`;
        a.click();
        URL.revokeObjectURL(url);
      } catch {
        showToast("Download failed", "error");
      }
    },
    [showToast],
  );

  const confirmDeleteNode = useCallback(() => {
    setNodeToDelete(selectedNode);
    setShowDeleteConfirm(true);
  }, [selectedNode]);

  const deleteNode = useCallback(async () => {
    if (!nodeToDelete) return;
    try {
      await jtbdApi.deleteJob(
        nodeToDelete.interview_id || interviewId || "",
        nodeToDelete.id,
      );
      showToast(
        `${t("jtbd.deleteSuccess") || "Deleted"}: ${nodeToDelete.name}`,
      );
      setShowDeleteConfirm(false);
      setSelectedNodeId(null);
      loadData();
    } catch (e) {
      console.error("Delete failed:", e);
      showToast(t("jtbd.deleteError") || "Error deleting job", "error");
    }
  }, [nodeToDelete, interviewId, showToast, t, loadData]);

  const copyNodeLink = useCallback(() => {
    try {
      const url = new URL(window.location.href);
      url.searchParams.set("nodeId", selectedNodeId || "");
      navigator.clipboard.writeText(url.toString());
      showToast(t("jtbd.copySuccess") || "Link copied");
    } catch {
      showToast("Copy failed", "error");
    }
  }, [selectedNodeId, showToast, t]);

  const toggleFullScreen = useCallback(() => {
    setIsFullScreen((prev) => !prev);
  }, []);

  const breadcrumbItems = (() => {
    const items: Array<{ label: string; href?: string }> = [
      { label: t("header.nav.interviews"), href: "/" },
    ];

    if (activeFolderId && folderData?.name) {
      items.push({
        label: folderData.name,
        href: `/research/${activeFolderId}`,
      });
    }

    if (isFolderMode) {
      items.push({
        label: t("folderJtbd.title") || "Project Job Tree",
      });
    } else {
      if (interviewTitle) {
        items.push({
          label: interviewTitle,
          href: interviewId
            ? `/research/interview/${interviewId}`
            : undefined,
        });
      }
      items.push({ label: t("jtbd.title") });
    }

    return items;
  })();

  return {
    isFolderMode,
    activeFolderId,
    folderData: folderData as Folder | null,
    interviewId,
    interviewTitle,
    fullTree,
    isLoading,
    isExtracting,
    isFullScreen,
    selectedNodeId,
    selectedNode,
    collapsedNodes,
    flatNodes,
    connections,
    canvasDims,
    toasts,
    showDeleteConfirm,
    nodeToDelete,
    showEditModal,
    isSavingNode,
    editNodeForm,
    showTransferModal,
    canNavigatePrev,
    canNavigateNext,
    breadcrumbItems,

    setSelectedNodeId,
    setShowDeleteConfirm,
    setShowTransferModal,
    setEditNodeForm,

    showToast,
    loadData,
    extractTree,
    toggleCollapse,
    selectNode,
    getChildren,
    getChildrenTitle,
    getBadgeLabel,
    getImportanceColor,
    getSatisfactionColor,
    navigatePrev,
    navigateNext,
    handleExport,
    handleTransferSingle,
    onTransferSuccess,
    openEditModal,
    closeEditModal,
    saveEditNode,
    handleDownloadNode,
    confirmDeleteNode,
    deleteNode,
    copyNodeLink,
    toggleFullScreen,
  };
}
