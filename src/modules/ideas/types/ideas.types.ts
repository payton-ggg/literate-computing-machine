/* ─── Ideas Module — Type Definitions ─── */

export interface Idea {
  id: string;
  name: string;
  fullName: string;
  description: string;
  type: IdeaType;
  status: IdeaStatus;
  pain: number;
  priority: number;
  folder: string;
  confidence: number;
  evidenceUp: number;
  evidenceDown: number;
  /** Only used by mobile vertical cards */
  evidenceSignals?: { up: number; down: number };
  jtbdContext?: string;
}

export type IdeaType = "hypothesis" | "jtbd" | "insight" | "manual";
export type IdeaStatus = "has_signals" | "no_data" | "confirmed" | "refuted" | "not_confirmed";
export type IdeaFormType = "hypothesis" | "jtbd" | "manual";

export interface IdeaFilters {
  type: string[];
  status: string[];
  folder: string;
}

export interface NewIdeaForm {
  type: IdeaFormType;
  name: string;
  description: string;
  folder: string;
  segment: string;
  problem: string;
  solution: string;
  evidenceSignal: string;
  jtbdContext: string;
  jtbdAction: string;
  jtbdResult: string;
  notes: string;
  pain: number;
  priority: number;
}

export interface FolderButtonState {
  visible: boolean;
  mode?: "add" | "change";
  text?: string;
}

export interface ColumnOption {
  id: string;
  title: string;
}

export interface TypeOption {
  id: string;
  label: string;
}

export interface StatusOption {
  id: string;
  label: string;
}

export interface FolderOption {
  id: string;
  name: string;
}

export const EMPTY_FILTERS: IdeaFilters = {
  type: [],
  status: [],
  folder: "",
};

export const EMPTY_FORM: NewIdeaForm = {
  type: "hypothesis",
  name: "",
  description: "",
  folder: "",
  segment: "",
  problem: "",
  solution: "",
  evidenceSignal: "",
  jtbdContext: "",
  jtbdAction: "",
  jtbdResult: "",
  notes: "",
  pain: 0,
  priority: 0,
};

/* ─── IdeaDetail Page Types ─── */

export interface IdeaDetail {
  id: string | null;
  name: string;
  description: string;
  typeCode: string;
  statusCode: string;
  folderId: string;
  pain: number;
  priority: number;
  confidence: number;
  jtbd_when: string;
  jtbd_want: string;
  jtbd_so_that: string;
  jtbd_solution: string;
}

export interface EvidenceItem {
  id: string | number;
  character: "positive" | "negative";
  title: string;
  snippet: string;
  rawSpeaker: string;
  interviewId: string;
  interviewTitle: string;
  interviewUrl: string;
  isExpanded: boolean;
  weight: number;
  score: number;
}

export interface IdeaDetailFormData {
  pain: number;
  priority: number;
  confidence: number;
  folderId: string;
  evidenceSignal: string;
  segment: string;
  problem: string;
  solution: string;
  jtbd_when: string;
  jtbd_want: string;
  jtbd_so_that: string;
  jtbd_solution: string;
}

export interface EvidenceFormData {
  character: "positive" | "negative";
  title: string;
  description: string;
  weight: number;
}

export interface EditIdeaFormData {
  name: string;
  description: string;
}

export const EMPTY_IDEA_DETAIL: IdeaDetail = {
  id: null,
  name: "",
  description: "",
  typeCode: "manual",
  statusCode: "not_confirmed",
  folderId: "",
  pain: 0,
  priority: 0,
  confidence: 0,
  jtbd_when: "",
  jtbd_want: "",
  jtbd_so_that: "",
  jtbd_solution: "",
};

export const EMPTY_DETAIL_FORM: IdeaDetailFormData = {
  pain: 0,
  priority: 0,
  confidence: 0,
  folderId: "",
  evidenceSignal: "",
  segment: "",
  problem: "",
  solution: "",
  jtbd_when: "",
  jtbd_want: "",
  jtbd_so_that: "",
  jtbd_solution: "",
};

export const EMPTY_EVIDENCE_FORM: EvidenceFormData = {
  character: "positive",
  title: "",
  description: "",
  weight: 3,
};
