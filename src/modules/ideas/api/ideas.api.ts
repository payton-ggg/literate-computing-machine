import { apiClient } from "@/lib/axios";

export const ideasApi = {
  getIdeas: (folderId: string | null = null) => {
    const params: Record<string, string> = {};
    if (folderId) params.folder_id = folderId;
    return apiClient.get("/ideas", { params });
  },

  getIdea: (id: string) => apiClient.get(`/ideas/${id}`),

  createIdea: (data: Record<string, unknown>) =>
    apiClient.post("/ideas", data),

  updateIdea: (id: string, data: Record<string, unknown>) =>
    apiClient.put(`/ideas/${id}`, data),

  deleteIdea: (id: string) => apiClient.delete(`/ideas/${id}`),

  evaluateIdea: (id: string) => apiClient.post(`/ideas/${id}/evaluate`),

  getEvidence: (id: string) => apiClient.get(`/ideas/${id}/evidence`),

  updateEvidence: (
    ideaId: string,
    evidenceId: string,
    data: Record<string, unknown>,
  ) => apiClient.put(`/ideas/${ideaId}/evidence/${evidenceId}`, data),

  deleteEvidence: (ideaId: string, evidenceId: string) =>
    apiClient.delete(`/ideas/${ideaId}/evidence/${evidenceId}`),
};

/** Async operations API (used for idea auto-evaluation) */
export const operationApi = {
  start: (payload: Record<string, unknown>) =>
    apiClient.post("/v1/operations/start", payload),

  getStatus: (operationId: string) =>
    apiClient.get(`/v1/operations/${operationId}/status`),
};
