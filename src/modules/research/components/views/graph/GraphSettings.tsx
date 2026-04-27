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
    <div className="settings-overlay">
      <div className="settings-card">
        <h3>{t("insights.graph.settings") || "Настройки графа"}</h3>
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
        <button
          className="btn-secondary"
          onClick={() => setSettingsOpen(false)}
          style={{ marginTop: "16px", width: "100%" }}
        >
          {t("common.close")}
        </button>
      </div>
    </div>
  );
}
