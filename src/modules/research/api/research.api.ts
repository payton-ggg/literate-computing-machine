import { apiClient } from "@/lib/axios";

export const insightsApi = {
  extractInsights: (interviewId: string, language = "ru") =>
    apiClient.post(`/interviews/${interviewId}/extract-insights`, { language }),

  hasInsights: (interviewId: string) =>
    apiClient.get(`/interviews/${interviewId}/has-insights`),

  getGraphData: (folderId: string) =>
    apiClient.get(`/folders/${folderId}/graph-data`),
};

export const jtbdApi = {
  extractJobs: (interviewId: string, language = "ru") =>
    apiClient.post(`/interviews/${interviewId}/extract-jobs`, { language }),

  getJobTree: (interviewId: string) =>
    apiClient.get(`/interviews/${interviewId}/job-tree`),

  hasJobs: (interviewId: string) =>
    apiClient.get(`/interviews/${interviewId}/has-jobs`),

  updateJob: (
    interviewId: string,
    jobId: string,
    data: Record<string, unknown>,
  ) => apiClient.put(`/interviews/${interviewId}/jobs/${jobId}`, data),

  deleteJob: (interviewId: string, jobId: string) =>
    apiClient.delete(`/interviews/${interviewId}/jobs/${jobId}`),
};

export const folderJtbdApi = {
  generateFolderJobTree: (folderId: string, language = "ru") =>
    apiClient.post(
      `/folders/${folderId}/generate-job-tree`,
      { language },
      { timeout: 300_000 }, // 5 min — long-running LLM operation
    ),

  getFolderJobTree: (folderId: string) =>
    apiClient.get(`/folders/${folderId}/folder-job-tree`),

  hasFolderJobTree: (folderId: string) =>
    apiClient.get(`/folders/${folderId}/has-folder-job-tree`),
};
