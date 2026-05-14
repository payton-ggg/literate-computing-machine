"use client";

import { useRef, useState, useCallback, useMemo } from "react";
import type { FlatNode } from "../types/jobTree.types";

export function useJobTreeCanvas() {
  const canvasWrapperRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  const [panX, setPanX] = useState(150);
  const [panY, setPanY] = useState(100);
  const [isDragging, setIsDragging] = useState(false);
  const [isSmoothPanning, setIsSmoothPanning] = useState(false);
  const animationFrameRef = useRef<number | null>(null);

  const canvasTransform = useMemo(
    () => ({
      transform: `translate(${panX}px, ${panY}px) scale(${zoom})`,
      transformOrigin: "0 0" as const,
      transition: isDragging
        ? "none"
        : isSmoothPanning
          ? "transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)"
          : "transform 0.2s cubic-bezier(0.2, 0, 0, 1)",
    }),
    [panX, panY, zoom, isDragging, isSmoothPanning],
  );

  const scrollToNode = useCallback(
    (node: FlatNode) => {
      if (!node || !canvasWrapperRef.current) return;

      setIsSmoothPanning(true);

      const wrapperRect = canvasWrapperRef.current.getBoundingClientRect();
      const ww = wrapperRect.width;
      const wh = wrapperRect.height;

      const targetPanX = ww / 2 - (node.x + node.w / 2) * zoom;
      const targetPanY = wh / 2 - (node.y + (node.h || 90) / 2) * zoom;

      setPanX(targetPanX);
      setPanY(targetPanY);

      setTimeout(() => {
        setIsSmoothPanning(false);
      }, 700);
    },
    [zoom],
  );

  const onWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.05 : 0.05;
      const newZoom = Math.min(2, Math.max(0.2, zoom + delta));
      if (newZoom !== zoom) {
        setZoom(newZoom);
      }
    },
    [zoom],
  );

  const onCanvasMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if ((e.target as HTMLElement).closest(".node-card")) return;

      setIsDragging(true);
      const startX = e.clientX - panX;
      const startY = e.clientY - panY;

      const moveHandler = (me: MouseEvent) => {
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
        animationFrameRef.current = requestAnimationFrame(() => {
          setPanX(me.clientX - startX);
          setPanY(me.clientY - startY);
        });
      };

      const upHandler = () => {
        setIsDragging(false);
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
        window.removeEventListener("mousemove", moveHandler);
        window.removeEventListener("mouseup", upHandler);
      };

      window.addEventListener("mousemove", moveHandler);
      window.addEventListener("mouseup", upHandler);
    },
    [panX, panY],
  );

  const onCanvasTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if ((e.target as HTMLElement).closest(".node-card")) return;

      setIsDragging(true);

      if (e.touches.length === 1) {
        const touch = e.touches[0];
        const startX = touch.clientX - panX;
        const startY = touch.clientY - panY;

        const moveHandler = (te: TouchEvent) => {
          if (te.touches.length !== 1) return;
          if (te.cancelable) te.preventDefault();
          const t = te.touches[0];

          if (animationFrameRef.current)
            cancelAnimationFrame(animationFrameRef.current);
          animationFrameRef.current = requestAnimationFrame(() => {
            setPanX(t.clientX - startX);
            setPanY(t.clientY - startY);
          });
        };

        const endHandler = () => {
          setIsDragging(false);
          window.removeEventListener("touchmove", moveHandler);
          window.removeEventListener("touchend", endHandler);
        };

        window.addEventListener("touchmove", moveHandler, { passive: false });
        window.addEventListener("touchend", endHandler);
      } else if (e.touches.length === 2) {
        const initialDist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY,
        );
        const initialZoom = zoom;

        const moveHandler = (te: TouchEvent) => {
          if (te.touches.length !== 2) return;
          if (te.cancelable) te.preventDefault();

          const currentDist = Math.hypot(
            te.touches[0].clientX - te.touches[1].clientX,
            te.touches[0].clientY - te.touches[1].clientY,
          );

          const zoomFactor = currentDist / initialDist;
          setZoom(Math.min(2, Math.max(0.2, initialZoom * zoomFactor)));
        };

        const endHandler = () => {
          setIsDragging(false);
          window.removeEventListener("touchmove", moveHandler);
          window.removeEventListener("touchend", endHandler);
        };

        window.addEventListener("touchmove", moveHandler, { passive: false });
        window.addEventListener("touchend", endHandler);
      }
    },
    [panX, panY, zoom],
  );

  return {
    canvasWrapperRef,
    canvasTransform,
    scrollToNode,
    onWheel,
    onCanvasMouseDown,
    onCanvasTouchStart,
  };
}
