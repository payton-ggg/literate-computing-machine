"use client";

import {
  FlatNode,
  Connection,
  NodeLevel,
} from "@/modules/research/types/jobTree.types";
import styles from "./JobTreeCanvas.module.css";

interface JobTreeCanvasProps {
  canvasWrapperRef: React.RefObject<HTMLDivElement | null>;
  canvasTransform: React.CSSProperties;
  canvasDims: { w: number; h: number };
  flatNodes: FlatNode[];
  connections: Connection[];
  selectedNodeId: string | null;
  collapsedNodes: Set<string>;
  onWheel: (e: React.WheelEvent) => void;
  onMouseDown: (e: React.MouseEvent) => void;
  onTouchStart: (e: React.TouchEvent) => void;
  onSelectNode: (node: FlatNode) => void;
  onToggleCollapse: (node: FlatNode) => void;
  getBadgeLabel: (level: NodeLevel) => string;
}

export default function JobTreeCanvas({
  canvasWrapperRef,
  canvasTransform,
  canvasDims,
  flatNodes,
  connections,
  selectedNodeId,
  collapsedNodes,
  onWheel,
  onMouseDown,
  onTouchStart,
  onSelectNode,
  onToggleCollapse,
  getBadgeLabel,
}: JobTreeCanvasProps) {
  return (
    <div
      className={styles.canvasWrapper}
      ref={canvasWrapperRef}
      onWheel={onWheel}
      onMouseDown={onMouseDown}
      onTouchStart={onTouchStart}
    >
      <div className={styles.canvasInner} style={canvasTransform}>
        <svg
          className={styles.connectionsSvg}
          width={canvasDims.w}
          height={canvasDims.h}
        >
          {connections.map((conn) => (
            <path
              key={conn.id}
              d={conn.path}
              fill="none"
              stroke="var(--border-light)"
              strokeWidth="2"
            />
          ))}
        </svg>

        {flatNodes.map((node) => (
          <div
            key={node.id}
            className={`${styles.nodeCard} ${styles[`nodeCard_${node.level}`] || ""} ${
              node.level !== "sector" ? styles.selectable : ""
            } ${selectedNodeId === node.id ? styles.selected : ""} node-card`}
            style={{
              left: node.x + "px",
              top: node.y + "px",
              width: node.w + "px",
            }}
            onClick={() => onSelectNode(node)}
          >
            <div
              className={`${styles.nodeAccent} ${styles[`accent_${node.level}`] || ""}`}
            />
            <div className={styles.nodeBody}>
              <div className={styles.nodeType}>{getBadgeLabel(node.level)}</div>
              <div className={styles.nodeName}>{node.name}</div>
            </div>
            {node.level !== "micro" && (
              <div
                className={`${styles.nodeExpand} ${collapsedNodes.has(node.id) ? styles.isCollapsed : ""}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleCollapse(node);
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M7 10l5 5 5-5"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            )}
          </div>
        ))}
      </div>
      <div className={styles.dotGrid} />
    </div>
  );
}
