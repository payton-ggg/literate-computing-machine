import { apiClient } from "@/lib/axios";

export const supportApi = {
  submitFeedback: (message: string) =>
    apiClient.post("/support/feedback", { message }),
};

export const healthApi = {
  check: () => apiClient.get("/health"),
};
