import { create } from "zustand";

interface UploadState {
  pendingUpload: { id: string; file: File; language: string } | null;
  setPendingUpload: (id: string, file: File, language: string) => void;
  clearPendingUpload: () => void;
}

export const useUploadStore = create<UploadState>((set) => ({
  pendingUpload: null,
  setPendingUpload: (id, file, language) =>
    set({ pendingUpload: { id, file, language } }),
  clearPendingUpload: () => set({ pendingUpload: null }),
}));
