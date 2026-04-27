"use client";

import React, { useState, useCallback, useMemo, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useGraphData } from "../../../hooks/useGraphData";
import { useGraphSimulation } from "../../../hooks/useGraphSimulation";
import GraphCanvas from "./GraphCanvas";
import GraphLegend from "./GraphLegend";
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
  const [legendMinimized, setLegendMinimized] = useState(false);
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
    const items = [{ label: t("header.nav.interviews"), href: "/research" }];
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
      <div className="ml-5">
        {!isFullScreen && <Breadcrumbs items={breadcrumbs} background />}
      </div>

      <div className={`main-layout ${isFullScreen ? "is-full-screen" : ""}`}>
        {!isFullScreen && <InterviewSidebar folder={currentFolder} />}

        <main className="content-panel">
          {!isFullScreen && (
            <header className="content-header">
              <div className="content-title-group">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="18" cy="5" r="3" />
                  <circle cx="6" cy="12" r="3" />
                  <circle cx="18" cy="19" r="3" />
                  <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                  <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
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
              t={t}
            />

            <GraphCanvas
              containerRef={containerRef}
              svgRef={svgRef}
              showGridEnabled={showGridEnabled}
              loading={loading}
              t={t}
            />

            <GraphLegend
              isFullScreen={isFullScreen}
              legendMinimized={legendMinimized}
              setLegendMinimized={setLegendMinimized}
              autoCollapseEnabled={autoCollapseEnabled}
              setAutoCollapseEnabled={setAutoCollapseEnabled}
              toggleAllGroups={toggleAllGroups}
              toggleAllUngrouped={toggleAllUngrouped}
              collapseAllNodes={collapseAllNodes}
              untangleNodes={untangleNodes}
              pullFloatingNodes={pullFloatingNodes}
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
