import React from "react";

interface GraphSettingsProps {
  settingsOpen: boolean;
  setSettingsOpen: (val: boolean) => void;
  linkDistance: number;
  setLinkDistance: (val: number) => void;
  chargeStrengthAbs: number;
  setChargeStrengthAbs: (val: number) => void;
  showGridEnabled: boolean;
  setShowGridEnabled: (val: boolean) => void;
  autoCollapseEnabled: boolean;
  setAutoCollapseEnabled: (val: boolean) => void;
  toggleAllGroups: () => void;
  toggleAllUngrouped: () => void;
  collapseAllNodes: () => void;
  untangleNodes: () => void;
  pullFloatingNodes: () => void;
  t: (key: string) => string;
}

export default function GraphSettings({
  settingsOpen,
  setSettingsOpen,
  linkDistance,
  setLinkDistance,
  chargeStrengthAbs,
  setChargeStrengthAbs,
  showGridEnabled,
  setShowGridEnabled,
  autoCollapseEnabled,
  setAutoCollapseEnabled,
  toggleAllGroups,
  toggleAllUngrouped,
  collapseAllNodes,
  untangleNodes,
  pullFloatingNodes,
  t,
}: GraphSettingsProps) {
  if (!settingsOpen) return null;

  const sliderTrackStyle = (val: number, min: number, max: number) => {
    const pct = ((val - min) / (max - min)) * 100;
    return {
      background: `linear-gradient(to right, var(--accent-solid) ${pct}%, var(--border) ${pct}%)`,
    };
  };

  return (
    <div className="settings-overlay" onClick={() => setSettingsOpen(false)}>
      <div
        className="settings-card expanded-settings"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="settings-header">
          <h3>{t("insights.graph.settings") || "Настройки графа"}</h3>
          <button className="close-btn-minimal" onClick={() => setSettingsOpen(false)}>
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
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div className="settings-scroll-area">
          {/* Section 1: Display Settings */}
          <div className="settings-section">
            <div className="settings-section-title">
              {t("insights.graph.controlsPanel.displaySettings") || "Отображение"}
            </div>
            
            <div className="control-group-v2">
              <span className="control-label">
                {t("insights.graph.nodeDistance") || "Расстояние между узлами"}
              </span>
              <input
                type="range"
                value={linkDistance}
                onChange={(e) => setLinkDistance(Number(e.target.value))}
                min="50"
                max="300"
                style={sliderTrackStyle(linkDistance, 50, 300)}
              />
            </div>

            <div className="control-group-v2">
              <span className="control-label">
                {t("insights.graph.repulsionForce") || "Сила отталкивания"}
              </span>
              <input
                type="range"
                value={chargeStrengthAbs}
                onChange={(e) => setChargeStrengthAbs(Number(e.target.value))}
                min="100"
                max="800"
                style={sliderTrackStyle(chargeStrengthAbs, 100, 800)}
              />
            </div>

            <div className="control-group-v2">
              <label className="toggle-switch-wrapper">
                <div className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={showGridEnabled}
                    onChange={(e) => setShowGridEnabled(e.target.checked)}
                  />
                  <span className="slider round"></span>
                </div>
                <span className="toggle-label">
                  {t("insights.graph.controlsPanel.showGrid") || "Показать сетку"}
                </span>
              </label>
            </div>
          </div>

          <div className="legend-divider"></div>

          {/* Section 2: Legend & Visibility */}
          <div className="settings-section">
            <div className="settings-section-title">
              {t("insights.graph.controlsPanel.legendAndVisibility") || "Легенда и видимость"}
            </div>

            <div className="control-group-v2">
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

            <div className="legend-items-grid">
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
          </div>

          <div className="legend-divider"></div>

          {/* Section 3: Actions */}
          <div className="settings-section">
            <div className="settings-section-title">
              {t("insights.graph.controlsPanel.actions") || "Действия"}
            </div>
            <div className="action-buttons-grid">
              <button className="btn-action-primary" onClick={collapseAllNodes}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 14h6v6M20 10h-6V4M14 10l7-7M3 21l7-7" />
                </svg>
                {t("insights.graph.controlsPanel.collapseAll") || "Свернуть все"}
              </button>
              <button className="btn-action-secondary" onClick={untangleNodes}>
                ✨ {t("insights.graph.controlsPanel.untangle") || "Распутать"}
              </button>
              <button className="btn-action-secondary" onClick={pullFloatingNodes}>
                🧲 {t("insights.graph.controlsPanel.pullNodes") || "Стянуть"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
