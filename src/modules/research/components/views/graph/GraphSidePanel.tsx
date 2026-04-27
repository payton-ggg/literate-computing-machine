import { Castdev, Insight } from "@/modules/research/types/graph.types";
import React, { UIEvent } from "react";

interface GraphSidePanelProps {
  isPanelOpen: boolean;
  panelTitle: string;
  panelType: "group" | "ungrouped" | "insight" | "castdev";
  panelInsights: Insight[];
  panelCastdevs: Castdev[];
  closeSidePanel: () => void;
  openCastdevInNewTab: (castdev: Castdev) => void;
  onScroll: (e: UIEvent<HTMLDivElement>) => void;
  t: (key: string) => string;
}

export default function GraphSidePanel({
  isPanelOpen,
  panelTitle,
  panelType,
  panelInsights,
  panelCastdevs,
  closeSidePanel,
  openCastdevInNewTab,
  onScroll,
  t,
}: GraphSidePanelProps) {
  const formatTimestamp = (seconds: number | null | undefined) => {
    if (
      seconds === null ||
      seconds === undefined ||
      Number.isNaN(Number(seconds))
    )
      return "";
    const total = Math.max(0, Math.floor(Number(seconds)));
    const m = Math.floor(total / 60);
    const s = total % 60;
    return `${m}:${String(s).padStart(2, "0")}`;
  };

  if (!isPanelOpen) return null;

  return (
    <div className="side-panel-v2">
      <div className="panel-header">
        <div className="panel-title">{panelTitle}</div>
        <button className="btn-close" onClick={closeSidePanel}>
          &times;
        </button>
      </div>
      <div className="panel-content" onScroll={onScroll}>
        {panelInsights.length > 0 && (
          <div className="section-title">
            {t("insights.graph.panel.insights")}
          </div>
        )}
        <div className="insights-list">
          {panelInsights.map((insight) => (
            <div
              key={insight.id}
              className={`insight-card-v2 ${
                panelType === "ungrouped" ? "ungrouped" : ""
              }`}
            >
              <div className="quote-card">
                <div className="quote-text">
                  {insight.quote_text || insight.description || insight.name}
                </div>
                <div className="quote-footer">
                  <span className="quote-source">{insight.name}</span>
                  {(insight.quote_speaker ||
                    insight.quote_timestamp != null) && (
                    <span className="quote-meta">
                      {insight.quote_speaker && (
                        <span>{insight.quote_speaker}</span>
                      )}
                      {insight.quote_speaker &&
                        insight.quote_timestamp != null && <span> · </span>}
                      {insight.quote_timestamp != null && (
                        <span>{formatTimestamp(insight.quote_timestamp)}</span>
                      )}
                    </span>
                  )}
                </div>
              </div>
              <div className="insight-source-meta">
                <span className="meta-label">
                  {t("insights.graph.panel.interview")}:
                </span>
                <span className="meta-value">{insight.castdev_name}</span>
              </div>
            </div>
          ))}
        </div>

        {panelCastdevs.length > 0 && (
          <div className="section-title">
            {t("insights.graph.panel.relatedInterviews")}
          </div>
        )}
        <div className="castdevs-list">
          {panelCastdevs.map((castdev) => (
            <div
              key={castdev.id}
              className="castdev-tag-v2"
              onClick={() => openCastdevInNewTab(castdev)}
            >
              {castdev.name}
              <svg
                className="external-icon"
                width="12"
                height="12"
                viewBox="0 0 12 12"
                fill="none"
                stroke="currentColor"
              >
                <path
                  d="M3.5 1H11V8.5M11 1L1 11"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
