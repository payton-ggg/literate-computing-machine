export interface Insight {
  id: string;
  name: string;
  description?: string;
  quote_text?: string;
  quote_speaker?: string;
  quote_timestamp?: number | null;
  castdev_id: string;
  castdev_name: string;
}

export interface Castdev {
  id: string;
  name: string;
}

export interface Group {
  group_name: string;
  insight_ids: string[];
}

export interface GraphData {
  insights: Insight[];
  castdevs: Castdev[];
  groups: Group[];
  ungrouped_insight_ids: string[];
}

export interface GraphStats {
  castdevs: number;
  groups: number;
  insights: number;
  ungrouped: number;
}

export interface TooltipContent {
  name: string;
  description: string;
  quote_text: string;
  quote_speaker: string;
  quote_timestamp: number | null;
}

// Nodes and Links for D3 Simulation
export interface GraphNode extends d3.SimulationNodeDatum {
  id: string;
  type: "castdev" | "group" | "insight" | "ungrouped";
  name: string;
  radius: number;
  hidden?: boolean;
  // Insight specific
  description?: string;
  castdevId?: string;
  castdevName?: string;
  quote_text?: string;
  quote_speaker?: string;
  quote_timestamp?: number | null;
  // Group specific
  insightIds?: string[];
  connectedCastdevsCount?: number;
}

export interface GraphLink extends d3.SimulationLinkDatum<GraphNode> {
  source: string | GraphNode;
  target: string | GraphNode;
  type: "castdev-group" | "group-insight" | "castdev-ungrouped";
  hidden?: boolean;
}
