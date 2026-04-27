/* ─── Ideas Module — Presentation Helpers ─── */

import type { Idea, IdeaStatus, IdeaDetail, EvidenceItem } from "../types/ideas.types";

type TFn = (key: string, values?: Record<string, any>) => string;

export function getIdeaTypeLabel(t: TFn, type: string): string {
  switch (type) {
    case "hypothesis":
      return t("ideasPage.types.hypothesis");
    case "jtbd":
      return "JTBD";
    case "insight":
      return t("ideasPage.types.insight");
    case "manual":
      return t("ideasPage.types.manual");
    default:
      return type || t("ideasPage.types.manual");
  }
}

export function getIdeaStatusLabel(t: TFn, status: string): string {
  switch (status) {
    case "has_signals":
      return t("ideasPage.statuses.hasSignals");
    case "confirmed":
      return t("ideasPage.statuses.confirmed");
    case "refuted":
      return t("ideasPage.statuses.refuted");
    case "not_confirmed":
    case "no_data":
    default:
      return t("ideasPage.statuses.noData");
  }
}

export function getStatusClass(status: string): string {
  switch (status) {
    case "has_signals":
      return "statusSignals";
    case "no_data":
      return "statusNoData";
    case "refuted":
      return "statusRefuted";
    case "confirmed":
      return "statusConfirmed";
    default:
      return "";
  }
}

/**
 * Maps a raw backend idea response object to the UI row shape.
 */
export function mapApiIdeaToRow(
  idea: Record<string, unknown>,
  folderNameById: Record<string, string>,
  t: TFn,
): Idea {
  const evidence = (idea.evidence as Array<{ kind: string }>) || [];
  return {
    id: idea.id as string,
    name: (idea.name as string) || "",
    fullName: (idea.name as string) || "",
    description: "",
    type:
      idea.idea_type === "jtbd"
        ? "jtbd"
        : idea.idea_type === "insight"
          ? "insight"
          : "manual",
    status: (idea.status as IdeaStatus) || "no_data",
    pain: (idea.pain_score as number) || 0,
    priority: (idea.priority as number) || 0,
    folder:
      folderNameById[String(idea.folder_id)] ||
      (idea.folder_id as string) ||
      t("ideasPage.noFolder"),
    confidence: (idea.confidence as number) || 0,
    evidenceUp:
      (idea.confirming_count as number) ??
      evidence.filter((e) => e.kind === "confirming").length,
    evidenceDown:
      (idea.refuting_count as number) ??
      evidence.filter((e) => e.kind === "refuting").length,
    evidenceSignals: {
      up:
        (idea.confirming_count as number) ??
        evidence.filter((e) => e.kind === "confirming").length,
      down:
        (idea.refuting_count as number) ??
        evidence.filter((e) => e.kind === "refuting").length,
    },
  };
}

/* ─── IdeaDetail helpers ─── */

function numOrZero(v: unknown): number {
  if (v === null || v === undefined || v === "") return 0;
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

export function mapIdeaDetailResponse(
  idea: Record<string, unknown>,
): IdeaDetail {
  const jtbd = (idea.jtbd_context || {}) as Record<string, string>;
  return {
    id: idea.id as string,
    name: (idea.name as string) || "",
    description: (idea.description as string) || "",
    typeCode: (idea.idea_type as string) || "manual",
    statusCode: (idea.status as string) || "not_confirmed",
    folderId: (idea.folder_id as string) || "",
    pain: numOrZero(idea.pain_score),
    priority: numOrZero(idea.priority),
    confidence: numOrZero(idea.confidence),
    jtbd_when: jtbd.when || "",
    jtbd_want: jtbd.want || "",
    jtbd_so_that: jtbd.so_that || "",
    jtbd_solution: jtbd.solution || "",
  };
}

export function mapIdeaEvidenceToUI(
  evidence: Record<string, unknown>,
  t: TFn,
): EvidenceItem {
  let character: "positive" | "negative" = "positive";
  if (evidence.kind === "confirming") character = "positive";
  else if (evidence.kind === "refuting") character = "negative";

  const speaker = ((evidence.speaker as string) || "").trim();
  const wRaw =
    evidence.weight != null ? Number(evidence.weight) : 3;
  const weight = Number.isFinite(wRaw) && wRaw >= 1 && wRaw <= 5 ? wRaw : 3;
  const score = weight > 0 ? weight : 0;

  return {
    id: evidence.id as string,
    character,
    title: speaker || t("ideaDetail.evidence.defaultTitle"),
    snippet: (evidence.quote_text as string) || "",
    rawSpeaker: speaker,
    interviewId: (evidence.interview_id as string) || "",
    interviewTitle: "",
    interviewUrl: evidence.interview_id
      ? `/research/interview/${evidence.interview_id}`
      : "",
    isExpanded: false,
    weight,
    score,
  };
}

export function filterIdeaEvidences(
  evidences: EvidenceItem[],
  filter: string,
): EvidenceItem[] {
  if (filter === "all") {
    return evidences.filter((e) => e.character !== ("neutral" as string));
  }
  return evidences.filter((e) => e.character === filter);
}

export function isServerEvidenceId(id: string | number): boolean {
  return (
    typeof id === "string" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      id,
    )
  );
}

export function characterToEvidenceKind(
  character: string,
): string {
  if (character === "positive") return "confirming";
  if (character === "negative") return "refuting";
  return "confirming";
}
