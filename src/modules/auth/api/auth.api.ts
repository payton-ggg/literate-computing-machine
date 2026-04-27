import { apiClient } from "@/lib/axios";

export const authApi = {
  register: (data: {
    username: string;
    email: string;
    password: string;
    demo_session_id?: string;
    visitor_id?: string;
  }) => apiClient.post("/register", data),

  login: (username: string, password: string) =>
    apiClient.post("/login", { username, password }),

  logout: () => apiClient.post("/logout"),

  me: () => apiClient.get("/me"),

  verifyEmail: (email: string, code: string) =>
    apiClient.post("/auth/verify", { email, code }),

  resendVerification: (email: string) =>
    apiClient.post("/auth/resend", { email }),

  requestPasswordReset: (email: string) =>
    apiClient.post("/auth/forgot-password", { email }),

  verifyResetToken: (token: string) =>
    apiClient.post("/auth/verify-reset-token", { token }),

  resetPassword: (token: string, password: string) =>
    apiClient.post("/auth/reset-password", { token, password }),
};

// ---------------------------------------------------------------------------
// Account settings (profile + password + email change)
// ---------------------------------------------------------------------------

export const meApi = {
  updateProfile: (username: string) =>
    apiClient.put("/me", { username }),

  changePassword: (currentPassword: string, newPassword: string) =>
    apiClient.post("/me/change-password", {
      current_password: currentPassword,
      new_password: newPassword,
    }),

  addEmailPassword: (email: string, password: string) =>
    apiClient.post("/me/add-email-password", { email, password }),

  // Email change wizard
  sendCurrentEmailCode: () =>
    apiClient.post("/me/change-email/send-current-code"),

  confirmCurrentEmailCode: (code: string) =>
    apiClient.post("/me/change-email/confirm-current-code", { code }),

  confirmCurrentAndSetNew: (currentCode: string, newEmail: string) =>
    apiClient.post("/me/change-email/confirm-current", {
      current_code: currentCode,
      new_email: newEmail,
    }),

  resendNewEmailCode: () =>
    apiClient.post("/me/change-email/resend-new-code"),

  confirmNewEmail: (code: string) =>
    apiClient.post("/me/change-email/confirm-new", { code }),
};
