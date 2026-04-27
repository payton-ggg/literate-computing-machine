import axios, { type AxiosProgressEvent, type AxiosRequestConfig } from "axios";
import { apiClient } from "@/lib/axios";
import { DEFAULT_PAGE_SIZE } from "@/common/constants";

// ---------------------------------------------------------------------------
// Interviews
// ---------------------------------------------------------------------------

export const interviewApi = {
  list: (
    {
      folderId = null,
      uncategorized = false,
      limit = DEFAULT_PAGE_SIZE,
      offset = 0,
    }: {
      folderId?: string | null;
      uncategorized?: boolean;
      limit?: number;
      offset?: number;
    } = {},
    config: AxiosRequestConfig = {},
  ) => {
    const params: Record<string, unknown> = { limit, offset };
    if (folderId) {
      params.folder_id = folderId;
    } else if (uncategorized) {
      params.uncategorized = true;
    }
    return apiClient.get("/interviews", { params, ...config });
  },

  get: (id: string, config: AxiosRequestConfig = {}) =>
    apiClient.get(`/interviews/${id}`, config),

  create: (
    formData: FormData,
    onUploadProgress?: (e: AxiosProgressEvent) => void,
  ) =>
    apiClient.post("/interviews", formData, {
      headers: { "Content-Type": "multipart/form-data" },
      onUploadProgress,
    }),

  // Alias kept for backward compatibility with old store code
  upload: (
    formData: FormData,
    onUploadProgress?: (e: AxiosProgressEvent) => void,
  ) =>
    apiClient.post("/interviews", formData, {
      headers: { "Content-Type": "multipart/form-data" },
      onUploadProgress,
    }),

  update: (id: string, data: Record<string, unknown>) =>
    apiClient.put(`/interviews/${id}`, data),

  retry: (id: string) => apiClient.put(`/interviews/${id}/retry`),

  delete: (id: string) => apiClient.delete(`/interviews/${id}`),

  downloadAudio: (id: string, config: AxiosRequestConfig = {}) =>
    apiClient.get(`/interviews/${id}/download/audio`, {
      responseType: "blob",
      withCredentials: true,
      ...config,
    }),

  getAudioUrl: (id: string) => apiClient.get(`/interviews/${id}/audio-url`),

  downloadTranscript: (id: string) =>
    apiClient.get(`/interviews/${id}/download/transcript`, {
      responseType: "blob",
    }),

  createEmpty: (data: Record<string, unknown>) =>
    apiClient.post("/interviews", data),

  // Legacy transcription flow — keep on old upload+seconds-billing path until
  // the backend adds a transcription executor for the token-operation system.
  attachAudio: (
    id: string,
    formData: FormData,
    config: { onUploadProgress?: (e: AxiosProgressEvent) => void } = {},
  ) =>
    apiClient.post(`/interviews/${id}/attach-audio`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
      onUploadProgress: config.onUploadProgress,
    }),

  requestUploadUrl: (id: string, data: Record<string, unknown>) =>
    apiClient.post(`/interviews/${id}/upload-url`, data),

  confirmUpload: (id: string, data: Record<string, unknown>) =>
    apiClient.post(`/interviews/${id}/confirm-upload`, data),

  // Uploads directly to a signed GCS URL — uses plain axios, no baseURL
  uploadToSignedUrl: (
    url: string,
    file: File | Blob,
    headers: Record<string, string> = {},
    onUploadProgress?: (e: AxiosProgressEvent) => void,
  ) => axios.put(url, file, { headers, onUploadProgress }),
};

// ---------------------------------------------------------------------------
// Speaker mappings (sub-resource of interviews)
// ---------------------------------------------------------------------------

export const speakerApi = {
  getMappings: (interviewId: string) =>
    apiClient.get(`/interviews/${interviewId}/speakers`),

  assignNames: (interviewId: string, data: Record<string, unknown>) =>
    apiClient.put(`/interviews/${interviewId}/speakers`, data),
};

// ---------------------------------------------------------------------------
// Folders (namespace/filter for interviews)
// ---------------------------------------------------------------------------

export const folderApi = {
  list: () => apiClient.get("/folders"),
  create: (data: Record<string, unknown>) => apiClient.post("/folders", data),
  update: (id: string, data: Record<string, unknown>) =>
    apiClient.put(`/folders/${id}`, data),
  delete: (id: string) => apiClient.delete(`/folders/${id}`),
};

// ---------------------------------------------------------------------------
// Async operations (used by transcription flow)
// ---------------------------------------------------------------------------

export const operationApi = {
  start: (payload: Record<string, unknown>) =>
    apiClient.post("/v1/operations/start", payload),

  getStatus: (operationId: string) =>
    apiClient.get(`/v1/operations/${operationId}/status`),
};

// ---------------------------------------------------------------------------
// Translations (sub-resource of interviews)
// ---------------------------------------------------------------------------

export const translationApi = {
  list: (interviewId: string) =>
    apiClient.get(`/interviews/${interviewId}/translations`),

  translate: (interviewId: string, targetLanguage: string) =>
    apiClient.post(`/interviews/${interviewId}/translate`, {
      target_language: targetLanguage,
    }),

  get: (interviewId: string, langCode: string) =>
    apiClient.get(`/interviews/${interviewId}/translations/${langCode}`),
};
