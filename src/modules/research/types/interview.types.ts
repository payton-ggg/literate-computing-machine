export type InterviewStatus =
  | "empty"
  | "uploading"
  | "converting"
  | "analyzing"
  | "ready"
  | "failed";

export interface Interview {
  id: string;
  title: string;
  description?: string | null;
  notes?: string | null;
  status: InterviewStatus;
  folder_id?: string | null;
  folder?: Folder | null;
  source_language?: string | null;
  created_at: string;
  updated_at?: string;
  transcript?: string | null;
  has_insights?: boolean;
  processing_error?: string | null;
  audio_path?: string | null;
  source_file_path?: string | null;
  source_type?: string | null;
  diarization_enabled?: boolean;
  speaker_count?: number;
  /** Client-side optimistic flag */
  client_upload_pending?: boolean;
  client_upload_grace_until?: number | null;
}

export interface Folder {
  id: string;
  name: string;
  description?: string | null;
  interview_count?: number;
  created_at: string;
  updated_at?: string;
}

export interface InterviewListResponse {
  interviews: Interview[];
  total: number;
  has_more: boolean;
}
