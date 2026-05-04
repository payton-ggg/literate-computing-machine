import { create } from "zustand";

export interface GlobalUploadTask {
  id: string;
  files: File[];
  language: string;
  progress: number;
  step: string;
  fileName: string;
  error?: string;
}

interface UploadState {
  tasks: Record<string, GlobalUploadTask>;
  addTask: (id: string, files: File[], language: string) => void;
  updateTask: (id: string, updates: Partial<GlobalUploadTask>) => void;
  removeTask: (id: string) => void;
}

export const useUploadStore = create<UploadState>((set) => ({
  tasks: {},
  addTask: (id, files, language) =>
    set((state) => ({
      tasks: {
        ...state.tasks,
        [id]: {
          id,
          files,
          language,
          progress: 0,
          step: "uploading",
          fileName: files[0]?.name || "Unknown file",
        },
      },
    })),
  updateTask: (id, updates) =>
    set((state) => ({
      tasks: {
        ...state.tasks,
        ...(state.tasks[id] ? { [id]: { ...state.tasks[id], ...updates } } : {}),
      },
    })),
  removeTask: (id) =>
    set((state) => {
      const newTasks = { ...state.tasks };
      delete newTasks[id];
      return { tasks: newTasks };
    }),
}));
