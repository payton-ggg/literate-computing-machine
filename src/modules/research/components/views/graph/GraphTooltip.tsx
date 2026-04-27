import { TooltipContent } from "@/modules/research/types/graph.types";
import React from "react";

interface GraphTooltipProps {
  visible: boolean;
  content: TooltipContent;
  style: React.CSSProperties;
}

export default function GraphTooltip({
  visible,
  content,
  style,
}: GraphTooltipProps) {
  const formatTimestamp = (seconds: number | null) => {
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

  if (!visible) return null;

  return (
    <div className="tooltip" style={style}>
      <strong>{content.name}</strong>
      {(content.description || content.quote_text) && (
        <>
          <br />
          <span className="tooltip-desc">
            {content.quote_text || content.description}
          </span>
        </>
      )}
      {(content.quote_speaker || content.quote_timestamp != null) && (
        <>
          <br />
          <span className="tooltip-meta">
            {content.quote_speaker && <>{content.quote_speaker}</>}
            {content.quote_speaker && content.quote_timestamp != null && " · "}
            {content.quote_timestamp != null && (
              <>{formatTimestamp(content.quote_timestamp)}</>
            )}
          </span>
        </>
      )}
    </div>
  );
}
