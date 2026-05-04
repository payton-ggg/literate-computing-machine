"use client";

import React, { useState, useCallback, useMemo, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useGraphData } from "../../../hooks/useGraphData";
import { useGraphSimulation } from "../../../hooks/useGraphSimulation";
import GraphCanvas from "./GraphCanvas";

import GraphControls from "./GraphControls";
import GraphSettings from "./GraphSettings";
import GraphSidePanel from "./GraphSidePanel";
import GraphTooltip from "./GraphTooltip";
import GraphFeedbackModal from "./GraphFeedbackModal";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import InterviewSidebar from "../../global/InterviewSidebar";
// import TransferToIdeaModal from "../../dialogs/TransferToIdeaModal"; // Add this if you have it ported

import type {
  GraphNode,
  Insight,
  Castdev,
  TooltipContent,
} from "../../../types/graph.types";
import "./graph.css";

interface InsightsGraphViewProps {
  folderId: string;
}

export default function InsightsGraphView({
  folderId,
}: InsightsGraphViewProps) {
  const t = useTranslations();
  const {
    loading,
    currentFolder,
    graphData,
    stats,
    nodes,
    links,
    insightsMap,
  } = useGraphData(folderId);

  const [isFullScreen, setIsFullScreen] = useState(false);

  const [showTransferModal, setShowTransferModal] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [feedbackVisible, setFeedbackVisible] = useState(false);

  const [linkDistance, setLinkDistance] = useState(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("InsightsGraph_linkDistance");
      return stored !== null ? Number(stored) : 180;
    }
    return 180;
  });

  const [chargeStrengthAbs, setChargeStrengthAbs] = useState(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("InsightsGraph_chargeStrengthAbs");
      return stored !== null ? Number(stored) : 300;
    }
    return 300;
  });

  const [autoCollapseEnabled, setAutoCollapseEnabled] = useState(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("InsightsGraph_autoCollapseEnabled");
      return stored !== null ? JSON.parse(stored) : true;
    }
    return true;
  });

  const [showGridEnabled, setShowGridEnabled] = useState(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("InsightsGraph_showGridEnabled");
      return stored !== null ? JSON.parse(stored) : true;
    }
    return true;
  });

  const [searchQuery, setSearchQuery] = useState("");

  // Side Panel State
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [panelTitle, setPanelTitle] = useState("");
  const [panelType, setPanelType] = useState<
    "group" | "ungrouped" | "insight" | "castdev"
  >("group");
  const [panelInsights, setPanelInsights] = useState<Insight[]>([]);
  const [panelCastdevs, setPanelCastdevs] = useState<Castdev[]>([]);

  // Tooltip State
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const [tooltipContent, setTooltipContent] = useState<TooltipContent>({
    name: "",
    description: "",
    quote_text: "",
    quote_speaker: "",
    quote_timestamp: null,
  });
  const [tooltipStyle, setTooltipStyle] = useState<React.CSSProperties>({
    left: 0,
    top: 0,
  });

  // Settings Effects
  useEffect(() => {
    localStorage.setItem("InsightsGraph_linkDistance", String(linkDistance));
  }, [linkDistance]);

  useEffect(() => {
    localStorage.setItem(
      "InsightsGraph_chargeStrengthAbs",
      String(chargeStrengthAbs),
    );
  }, [chargeStrengthAbs]);

  useEffect(() => {
    localStorage.setItem(
      "InsightsGraph_autoCollapseEnabled",
      JSON.stringify(autoCollapseEnabled),
    );
  }, [autoCollapseEnabled]);

  useEffect(() => {
    localStorage.setItem(
      "InsightsGraph_showGridEnabled",
      JSON.stringify(showGridEnabled),
    );
  }, [showGridEnabled]);

  const handleNodeHover = useCallback(
    (
      event: MouseEvent,
      node: GraphNode,
      show: boolean,
      x: number,
      y: number,
    ) => {
      if (show) {
        setTooltipContent({
          name: node.name || "",
          description: node.description || "",
          quote_text: node.quote_text || "",
          quote_speaker: node.quote_speaker || "",
          quote_timestamp: node.quote_timestamp ?? null,
        });
        setTooltipStyle({ left: x + 10, top: y - 10 });
        setTooltipVisible(true);
      } else {
        setTooltipVisible(false);
      }
    },
    [],
  );

  const handleShowInsightPanel = useCallback(
    (node: GraphNode) => {
      const ins = insightsMap[node.id];
      if (!ins) return;

      setPanelTitle(
        node.type === "ungrouped"
          ? t("insights.graph.legend.ungrouped")
          : t("insights.graph.panel.insightTitle"),
      );
      setPanelType(node.type === "ungrouped" ? "ungrouped" : "insight");
      setPanelInsights([ins]);

      const cd = graphData?.castdevs.find((c) => c.id === ins.castdev_id);
      setPanelCastdevs(cd ? [cd] : []);
      setIsPanelOpen(true);
    },
    [insightsMap, t, graphData],
  );

  const handleOpenGroupPanel = useCallback(
    (groupNode: GraphNode) => {
      setPanelTitle(groupNode.name);
      setPanelType("group");

      const relatedCastdevs = new Set<string>();
      const insights: Insight[] = [];
      groupNode.insightIds?.forEach((insId) => {
        const ins = insightsMap[insId];
        if (ins) {
          relatedCastdevs.add(ins.castdev_id);
          insights.push(ins);
        }
      });

      setPanelInsights(insights);
      setPanelCastdevs(
        graphData?.castdevs.filter((cd) => relatedCastdevs.has(cd.id)) || [],
      );
      setIsPanelOpen(true);
    },
    [insightsMap, graphData],
  );

  const handleOpenCastdevPanel = useCallback(
    (castdevNode: GraphNode) => {
      setPanelTitle(castdevNode.name);
      setPanelType("castdev");

      const relatedInsights =
        graphData?.insights.filter(
          (ins) => ins.castdev_id === castdevNode.id,
        ) || [];
      setPanelInsights(relatedInsights);
      const cd = graphData?.castdevs.find((c) => c.id === castdevNode.id);
      setPanelCastdevs(cd ? [cd] : []);
      setIsPanelOpen(true);
    },
    [graphData],
  );

  const handleCloseSidePanel = useCallback(() => {
    setIsPanelOpen(false);
  }, []);

  const {
    svgRef,
    containerRef,
    toggleAllGroups,
    toggleAllUngrouped,
    collapseAllNodes,
    untangleNodes,
    pullFloatingNodes,
  } = useGraphSimulation({
    nodes,
    links,
    linkDistance,
    chargeStrengthAbs,
    searchQuery,
    autoCollapseEnabled,
    onNodeHover: handleNodeHover,
    onShowInsightPanel: handleShowInsightPanel,
    onOpenGroupPanel: handleOpenGroupPanel,
    onOpenCastdevPanel: handleOpenCastdevPanel,
    onCloseSidePanel: handleCloseSidePanel,
  });

  const exportToCSV = useCallback(() => {
    if (!graphData || !graphData.insights || graphData.insights.length === 0)
      return;

    const insightToGroup: Record<string, string> = {};
    graphData.groups.forEach((g) => {
      (g.insight_ids || []).forEach((insId) => {
        insightToGroup[insId] = g.group_name;
      });
    });

    const castdevMap: Record<string, string> = {};
    graphData.castdevs.forEach((cd) => {
      castdevMap[cd.id] = cd.name;
    });

    const rows = [
      [
        t("insights.graph.csv.name"),
        t("insights.graph.csv.description"),
        t("insights.graph.csv.quote") || "Цитата",
        t("insights.graph.csv.speaker") || "Спикер",
        t("insights.graph.csv.timestamp") || "Таймкод (сек)",
        t("insights.graph.csv.group"),
        t("insights.graph.csv.interview"),
      ],
    ];

    graphData.insights.forEach((ins) => {
      const name = (ins.name || "").replace(/"/g, '""');
      const desc = (ins.description || "").replace(/"/g, '""');
      const quote = (ins.quote_text || "").replace(/"/g, '""');
      const speaker = (ins.quote_speaker || "").replace(/"/g, '""');
      const ts = (ins.quote_timestamp ?? "").toString().replace(/"/g, '""');
      const group = (
        insightToGroup[ins.id] || t("insights.graph.ungrouped")
      ).replace(/"/g, '""');
      const castdev = (castdevMap[ins.castdev_id] || "").replace(/"/g, '""');
      rows.push([
        `"${name}"`,
        `"${desc}"`,
        `"${quote}"`,
        `"${speaker}"`,
        `"${ts}"`,
        `"${group}"`,
        `"${castdev}"`,
      ]);
    });

    const csvContent = "\uFEFF" + rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${currentFolder?.name || "insights"}_insights.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }, [graphData, currentFolder, t]);

  const openCastdevInNewTab = (cd: Castdev) => {
    window.open(`/research/interview/${cd.id}`, "_blank");
  };

  const breadcrumbs = useMemo(() => {
    const items = [{ label: t("header.nav.interviews"), href: "/" }];
    if (currentFolder) {
      items.push({
        label: currentFolder.name,
        href: `/research/${currentFolder.id}`,
      });
    }
    items.push({ label: t("insights.graph.title"), href: "" });
    return items;
  }, [currentFolder, t]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isFullScreen) setIsFullScreen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFullScreen]);

  // Track panel scroll for feedback popup logic
  const [panelScrollPercentage, setPanelScrollPercentage] = useState(0);
  const handlePanelScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement;
    const maxScroll = target.scrollHeight - target.clientHeight;
    if (maxScroll > 0) {
      setPanelScrollPercentage(
        Math.max(panelScrollPercentage, target.scrollTop / maxScroll),
      );
    } else {
      setPanelScrollPercentage(1);
    }
  };

  return (
    <div className="insights-graph-page">
      <div className="px-4 md:px-8 py-2 md:py-3 rounded-2xl">
        {!isFullScreen && <Breadcrumbs items={breadcrumbs} background />}
      </div>

      <div className={`main-layout ${isFullScreen ? "is-full-screen" : ""}`}>
        {!isFullScreen && <InterviewSidebar folder={currentFolder} />}

        <main className="content-panel">
          {!isFullScreen && (
            <header className="content-header">
              <div className="content-title-group">
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 32 32"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M22 3.19995C23.5463 3.19995 24.8 4.45354 24.8 5.99995C24.8 7.54634 23.5463 8.79995 22 8.79995C20.4536 8.79995 19.2 7.54634 19.2 5.99995C19.2 4.45354 20.4536 3.19995 22 3.19995ZM23.2 5.99995C23.2 5.33721 22.6627 4.79995 22 4.79995C21.3372 4.79995 20.8 5.33721 20.8 5.99995C20.8 6.66269 21.3372 7.19995 22 7.19995C22.6627 7.19995 23.2 6.66269 23.2 5.99995Z"
                    fill="currentColor"
                  />
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M3.19995 12.7999C3.19995 8.38169 6.78161 4.79995 11.2 4.79995C15.6183 4.79995 19.2 8.38169 19.2 12.7999C19.2 17.2183 15.6183 20.8 11.2 20.8C6.78161 20.8 3.19995 17.2183 3.19995 12.7999ZM11.2 6.39995C7.66527 6.39995 4.79995 9.26534 4.79995 12.7999C4.79995 16.3346 7.66527 19.2 11.2 19.2C14.7346 19.2 17.6 16.3346 17.6 12.7999C17.6 9.26534 14.7346 6.39995 11.2 6.39995Z"
                    fill="currentColor"
                  />
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M11.2 24.8C11.2 22.5908 12.9909 20.8 15.2 20.8C17.409 20.8 19.2 22.5908 19.2 24.8C19.2 27.0091 17.409 28.8 15.2 28.8C12.9909 28.8 11.2 27.0091 11.2 24.8ZM15.2 22.4C13.8745 22.4 12.8 23.4745 12.8 24.8C12.8 26.1254 13.8745 27.2 15.2 27.2C16.5254 27.2 17.6 26.1254 17.6 24.8C17.6 23.4745 16.5254 22.4 15.2 22.4Z"
                    fill="currentColor"
                  />
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M24 14.4C21.349 14.4 19.2 16.549 19.2 19.2C19.2 21.8509 21.349 24 24 24C26.6509 24 28.8 21.8509 28.8 19.2C28.8 16.549 26.6509 14.4 24 14.4ZM20.8 19.2C20.8 17.4326 22.2326 16 24 16C25.7673 16 27.2 17.4326 27.2 19.2C27.2 20.9673 25.7673 22.4 24 22.4C22.2326 22.4 20.8 20.9673 20.8 19.2Z"
                    fill="currentColor"
                  />
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M8.79995 25.2C8.79995 23.6535 7.54634 22.4 5.99995 22.4C4.45356 22.4 3.19995 23.6535 3.19995 25.2C3.19995 26.7463 4.45356 28 5.99995 28C7.54634 28 8.79995 26.7463 8.79995 25.2ZM5.99995 24C6.66269 24 7.19995 24.5372 7.19995 25.2C7.19995 25.8627 6.66269 26.4 5.99995 26.4C5.33721 26.4 4.79995 25.8627 4.79995 25.2C4.79995 24.5372 5.33721 24 5.99995 24Z"
                    fill="currentColor"
                  />
                </svg>

                <h1 className="content-title">{t("insights.graph.title")}</h1>
              </div>

              <div className="header-search-container">
                <div className="search-container">
                  <svg
                    className="search-icon"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                  </svg>
                  <input
                    type="text"
                    className="search-input"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t("common.search") || "Поиск..."}
                  />
                  {/* searchResultsCount can be derived, but we rely on the D3 hook visually updating nodes */}
                </div>
              </div>
            </header>
          )}

          <div className="main-chart-container">
            <GraphSettings
              settingsOpen={settingsOpen}
              setSettingsOpen={setSettingsOpen}
              linkDistance={linkDistance}
              setLinkDistance={setLinkDistance}
              chargeStrengthAbs={chargeStrengthAbs}
              setChargeStrengthAbs={setChargeStrengthAbs}
              showGridEnabled={showGridEnabled}
              setShowGridEnabled={setShowGridEnabled}
              autoCollapseEnabled={autoCollapseEnabled}
              setAutoCollapseEnabled={setAutoCollapseEnabled}
              toggleAllGroups={toggleAllGroups}
              toggleAllUngrouped={toggleAllUngrouped}
              collapseAllNodes={collapseAllNodes}
              untangleNodes={untangleNodes}
              pullFloatingNodes={pullFloatingNodes}
              t={t}
            />

            <GraphCanvas
              containerRef={containerRef}
              svgRef={svgRef}
              showGridEnabled={showGridEnabled}
              loading={loading}
              t={t}
            />

            <GraphControls
              isFullScreen={isFullScreen}
              toggleFullScreen={() => setIsFullScreen(!isFullScreen)}
              setFeedbackVisible={setFeedbackVisible}
              exportToCSV={exportToCSV}
              handleOpenTransfer={() => setShowTransferModal(true)}
              settingsOpen={settingsOpen}
              setSettingsOpen={setSettingsOpen}
              t={t}
            />

            <GraphSidePanel
              isPanelOpen={isPanelOpen}
              panelTitle={panelTitle}
              panelType={panelType}
              panelInsights={panelInsights}
              panelCastdevs={panelCastdevs}
              closeSidePanel={handleCloseSidePanel}
              openCastdevInNewTab={openCastdevInNewTab}
              onScroll={handlePanelScroll}
              t={t}
            />
          </div>
        </main>

        {isFullScreen && (
          <button
            className="btn-exit-fullscreen"
            onClick={() => setIsFullScreen(false)}
            title={t("common.close")}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                d="M18 6L6 18M6 6l12 12"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        )}
      </div>

      <GraphTooltip
        visible={tooltipVisible}
        content={tooltipContent}
        style={tooltipStyle}
      />

      <GraphFeedbackModal
        visible={feedbackVisible}
        setVisible={setFeedbackVisible}
        folderName={currentFolder?.name || ""}
        folderId={folderId}
        t={t}
      />

      {/* <TransferToIdeaModal isOpen={showTransferModal} folderId={folderId} onClose={() => setShowTransferModal(false)} /> */}
    </div>
  );
}
