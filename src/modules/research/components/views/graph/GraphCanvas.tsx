import React, { RefObject } from "react";

interface GraphCanvasProps {
  containerRef: RefObject<HTMLDivElement | null>;
  svgRef: RefObject<SVGSVGElement | null>;
  showGridEnabled: boolean;
  loading: boolean;
  t: (key: string) => string;
}

export default function GraphCanvas({
  containerRef,
  svgRef,
  showGridEnabled,
  loading,
  t,
}: GraphCanvasProps) {
  return (
    <div
      ref={containerRef}
      className={`graph-canvas ${!showGridEnabled ? "no-grid" : ""}`}
    >
      <svg ref={svgRef} className="graph-svg">
        <defs>
          <filter id="glow-insight" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="glow-ungrouped" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="glow-group" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="5" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="glow-castdev" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="glow-hover" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="10" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <pattern
            id="grid-dots"
            width="40"
            height="40"
            patternUnits="userSpaceOnUse"
          >
            <circle cx="1" cy="1" r="1" fill="currentColor" fillOpacity="0.2" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="transparent" />
      </svg>

      {loading && (
        <div className="state-center">
          <div className="spinner"></div>
          <p>{t("insights.graph.loading")}</p>
        </div>
      )}
    </div>
  );
}
