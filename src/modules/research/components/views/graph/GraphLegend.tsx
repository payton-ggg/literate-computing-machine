import React from "react";

interface GraphLegendProps {
  isFullScreen: boolean;
  legendMinimized: boolean;
  setLegendMinimized: (val: boolean) => void;
  autoCollapseEnabled: boolean;
  setAutoCollapseEnabled: (val: boolean) => void;
  toggleAllGroups: () => void;
  toggleAllUngrouped: () => void;
  collapseAllNodes: () => void;
  untangleNodes: () => void;
  pullFloatingNodes: () => void;
  t: (key: string) => string;
}

export default function GraphLegend({
  isFullScreen,
  legendMinimized,
  setLegendMinimized,
  autoCollapseEnabled,
  setAutoCollapseEnabled,
  toggleAllGroups,
  toggleAllUngrouped,
  collapseAllNodes,
  untangleNodes,
  pullFloatingNodes,
  t,
}: GraphLegendProps) {
  if (isFullScreen) return null;

  return (
    <div className={`legend-card ${legendMinimized ? "is-minimized" : ""}`}>
      <div
        className="legend-header-toggle"
        onClick={() => setLegendMinimized(!legendMinimized)}
      >
        <div className="legend-title">
          {t("insights.graph.controlsPanel.title") || "Управление графом"}
        </div>
        <svg
          style={{ transform: legendMinimized ? "rotate(0)" : "rotate(180deg)" }}
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </div>

      {!legendMinimized && (
        <>
          <div className="legend-section">
            <label className="toggle-switch-wrapper">
              <div className="toggle-switch">
                <input
                  type="checkbox"
                  checked={autoCollapseEnabled}
                  onChange={(e) => setAutoCollapseEnabled(e.target.checked)}
                />
                <span className="slider round"></span>
              </div>
              <span className="toggle-label">
                {t("insights.graph.controlsPanel.autoCollapse") || "Авто-сворачивание"}
              </span>
            </label>
          </div>

          <div className="legend-divider"></div>

          <div className="legend-section">
            <div className="legend-subtitle" style={{ marginBottom: "8px" }}>
              {t("insights.graph.controlsPanel.legendAndVisibility") || "Легенда и видимость:"}
            </div>

            <div
              className="legend-item"
              title={t("insights.graph.controlsPanel.baseNode") || "Корневой узел (всегда виден)"}
            >
              <div className="legend-circle legend-castdev"></div>
              <span>{t("insights.graph.legend.castdev") || "Интервью"}</span>
            </div>
            <div
              className="legend-item"
              title={t("insights.graph.controlsPanel.baseNode") || "Корневой узел (всегда виден)"}
            >
              <div className="legend-circle legend-group"></div>
              <span>{t("insights.graph.legend.group") || "Группы"}</span>
            </div>

            <div className="legend-divider" style={{ margin: "8px 0", opacity: 0.5 }}></div>

            <div
              className="legend-item interactive"
              onClick={toggleAllUngrouped}
              title={t("insights.graph.controlsPanel.toggleUngrouped") || "Показать/скрыть все одиночные"}
            >
              <div className="legend-circle legend-ungrouped"></div>
              <span>{t("insights.graph.legend.ungrouped") || "Одиночные"}</span>
            </div>
            <div
              className="legend-item interactive"
              onClick={toggleAllGroups}
              title={t("insights.graph.controlsPanel.toggleExtInsight") || "Показать/скрыть внутри групп"}
            >
              <div className="legend-circle legend-insight"></div>
              <span>{t("insights.graph.legend.insightInGroup") || "Инсайты"}</span>
            </div>
          </div>

          <div className="legend-divider"></div>
          <div className="action-buttons-col" style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <button className="btn-collapse-all" style={{ margin: 0 }} onClick={collapseAllNodes}>
              {t("insights.graph.controlsPanel.collapseAll") || "Свернуть все узлы"}
            </button>
            <div className="action-buttons-group">
              <button
                className="btn-collapse-all untangle-btn"
                style={{ margin: 0, whiteSpace: "nowrap" }}
                onClick={untangleNodes}
              >
                ✨ {t("insights.graph.controlsPanel.untangle") || "Распутать"}
              </button>
              <button
                className="btn-collapse-all pull-btn"
                style={{ margin: 0, whiteSpace: "nowrap" }}
                onClick={pullFloatingNodes}
              >
                🧲 {t("insights.graph.controlsPanel.pullNodes") || "Стянуть к центру"}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
