export type NodeLevel = "sector" | "high_level" | "core" | "micro";

export interface JobNodeData {
  when_trigger?: string;
  i_want_to?: string;
  so_that?: string;
  current_solution?: string;
  importance?: number;
  satisfaction?: number;
  evidence?: string;
  context?: string;
}

export interface FlatNode {
  id: string;
  name: string;
  description?: string;
  level: NodeLevel;
  x: number;
  y: number;
  w: number;
  h: number;
  parentId?: string;
  sectorIndex?: number;
  data?: JobNodeData;
  interview_id?: string;
}

export interface Connection {
  id: string | number;
  path: string;
}

export interface MicroJob extends JobNodeData {
  id: string;
  name: string;
  description?: string;
  interview_id?: string;
}

export interface CoreJobEntry {
  core_job: MicroJob;
  micro_jobs?: MicroJob[];
}

export interface HighLevelJobEntry {
  high_level_job: MicroJob;
  core_jobs?: CoreJobEntry[];
}

export interface SectorEntry {
  sector: {
    id: string;
    name: string;
    level?: string;
  };
  high_level_jobs?: HighLevelJobEntry[];
}

export interface JobTree {
  segment?: {
    id: string;
    name: string;
    level?: string;
  };
  high_level_jobs?: HighLevelJobEntry[];
  sectors?: SectorEntry[];
}

export interface EditNodeForm {
  id: string;
  name: string;
  level: NodeLevel;
  when_trigger: string;
  i_want_to: string;
  so_that: string;
  current_solution: string;
  context: string;
}

export interface Toast {
  id: number;
  message: string;
  type: "success" | "error";
}
