import { useState, useEffect, useMemo, useCallback } from "react";
import { insightsApi } from "../api/graph.api";
import { folderApi } from "../api/interviews.api";
import type { Folder } from "../types/interview.types";
import type {
  GraphData,
  GraphStats,
  GraphNode,
  GraphLink,
  Insight,
} from "../types/graph.types";

export function useGraphData(folderId: string) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [currentFolder, setCurrentFolder] = useState<Folder | null>(null);
  const [graphData, setGraphData] = useState<GraphData | null>(null);

  const [nodes, setNodes] = useState<GraphNode[]>([]);
  const [links, setLinks] = useState<GraphLink[]>([]);
  
  const [stats, setStats] = useState<GraphStats>({
    castdevs: 0,
    groups: 0,
    insights: 0,
    ungrouped: 0,
  });

  const insightsMap = useMemo(() => {
    const map: Record<string, Insight> = {};
    if (graphData?.insights) {
      graphData.insights.forEach((ins) => {
        map[ins.id] = ins;
      });
    }
    return map;
  }, [graphData]);

  const fetchData = useCallback(async () => {
    if (!folderId) return;
    try {
      setLoading(true);
      setError(null);

      // Fetch folder info
      try {
        const foldersResp = await folderApi.list();
        const folders = foldersResp.data.folders || foldersResp.data || [];
        const folder = folders.find((f: Folder) => String(f.id) === String(folderId));
        if (folder) {
          setCurrentFolder(folder);
        }
      } catch (e) {
        console.warn("Could not fetch folder name:", e);
      }

      // Fetch graph data
      const response = await insightsApi.getGraphData(folderId);
      const data = response.data;

      const newGraphData: GraphData = {
        insights: data.insights || [],
        castdevs: data.castdevs || [],
        groups: data.groups || [],
        ungrouped_insight_ids: data.ungrouped_insight_ids || [],
      };

      setGraphData(newGraphData);
      
      setStats({
        castdevs: newGraphData.castdevs.length,
        groups: newGraphData.groups.length,
        insights: newGraphData.insights.length,
        ungrouped: newGraphData.ungrouped_insight_ids.length,
      });

    } catch (err: unknown) {
      console.error("Failed to fetch graph data:", err);
      if (err instanceof Error) {
        setError(err.message || "Failed to load graph data");
      } else {
        setError("Failed to load graph data");
      }
    } finally {
      setLoading(false);
    }
  }, [folderId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (!graphData) return;

    const newNodes: GraphNode[] = [];
    const newLinks: GraphLink[] = [];

    // Add castdev nodes
    graphData.castdevs.forEach((cd) => {
      newNodes.push({
        id: cd.id,
        type: "castdev",
        name: cd.name,
        radius: 25,
      });
    });

    // Add group nodes
    graphData.groups.forEach((g, idx) => {
      const connectedCastdevs = new Set<string>();
      g.insight_ids.forEach((insId) => {
        const ins = insightsMap[insId];
        if (ins) connectedCastdevs.add(ins.castdev_id);
      });
      const extraRadius = Math.max(0, connectedCastdevs.size - 1) * 8;

      newNodes.push({
        id: `group-${idx}`,
        type: "group",
        name: g.group_name,
        insightIds: g.insight_ids,
        radius: 20 + extraRadius,
        connectedCastdevsCount: connectedCastdevs.size,
      });
    });

    // Add grouped insight nodes (hidden initially)
    const groupedInsightIds = new Set<string>();
    graphData.groups.forEach((g) =>
      g.insight_ids.forEach((id) => groupedInsightIds.add(id)),
    );

    groupedInsightIds.forEach((insId) => {
      const ins = insightsMap[insId];
      if (ins) {
        newNodes.push({
          id: insId,
          type: "insight",
          name: ins.name,
          description: ins.description,
          castdevId: ins.castdev_id,
          castdevName: ins.castdev_name,
          quote_text: ins.quote_text,
          quote_speaker: ins.quote_speaker,
          quote_timestamp: ins.quote_timestamp,
          radius: 12,
          hidden: true,
        });
      }
    });

    // Add UNGROUPED insight nodes (hidden initially)
    graphData.ungrouped_insight_ids.forEach((insId) => {
      const ins = insightsMap[insId];
      if (ins) {
        newNodes.push({
          id: `ungrouped-${insId}`,
          type: "ungrouped",
          name: ins.name,
          description: ins.description,
          castdevId: ins.castdev_id,
          castdevName: ins.castdev_name,
          quote_text: ins.quote_text,
          quote_speaker: ins.quote_speaker,
          quote_timestamp: ins.quote_timestamp,
          radius: 10,
          hidden: true,
        });
      }
    });

    // Create links: castdev -> group
    graphData.groups.forEach((g, idx) => {
      const castdevIds = new Set<string>();
      g.insight_ids.forEach((insId) => {
        const ins = insightsMap[insId];
        if (ins) castdevIds.add(ins.castdev_id);
      });
      castdevIds.forEach((cdId) => {
        newLinks.push({
          source: cdId,
          target: `group-${idx}`,
          type: "castdev-group",
        });
      });
    });

    // Create links: group -> insight (hidden initially)
    graphData.groups.forEach((g, idx) => {
      g.insight_ids.forEach((insId) => {
        newLinks.push({
          source: `group-${idx}`,
          target: insId,
          type: "group-insight",
          hidden: true,
        });
      });
    });

    // Create links: castdev -> ungrouped insight (hidden initially)
    graphData.ungrouped_insight_ids.forEach((insId) => {
      const ins = insightsMap[insId];
      if (ins) {
        newLinks.push({
          source: ins.castdev_id,
          target: `ungrouped-${insId}`,
          type: "castdev-ungrouped",
          hidden: true,
        });
      }
    });

    setNodes(newNodes);
    setLinks(newLinks);
  }, [graphData, insightsMap]);

  return {
    loading,
    error,
    currentFolder,
    graphData,
    stats,
    nodes,
    links,
    insightsMap,
  };
}
