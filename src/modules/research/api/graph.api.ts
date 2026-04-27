import { apiClient } from "@/lib/axios";

export const insightsApi = {
  getGraphData: (folderId: string) =>
    apiClient.get(`/folders/${folderId}/graph-data`),
};

export const supportApi = {
  submitFeedback: (message: string) =>
    apiClient.post("/support/feedback", { message }),
};
