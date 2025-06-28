import { create } from 'zustand';

type UploadStatus = 'pending' | 'uploading' | 'success' | 'error';

interface UploadFile {
  id: string;
  file: File;
  progress: number;
  status: UploadStatus;
  url?: string;
  error?: string;
}

type UploadState = {
  files: UploadFile[];
  sessionId: string | null;
  addFiles: (files: File[]) => void;
  setSessionId: (sessionId: string) => void;
  updateFileProgress: (id: string, progress: number) => void;
  updateFileStatus: (id: string, status: UploadStatus, url?: string, error?: string) => void;
  clearFiles: () => void;
  getFileById: (id: string) => UploadFile | undefined;
};

export const useUploadStore = create<UploadState>((set, get) => ({
  files: [],
  sessionId: null,

  addFiles: (newFiles) => set((state) => ({
    files: [
      ...state.files,
      ...newFiles.map((file) => ({
        id: crypto.randomUUID(),
        file,
        progress: 0,
        status: 'pending' as UploadStatus
      }))
    ]
  })),

  setSessionId: (sessionId) => set({ sessionId }),

  updateFileProgress: (id, progress) => set((state) => ({
    files: state.files.map((file) =>
      file.id === id ? { ...file, progress } : file
    )
  })),

  updateFileStatus: (id, status, url, error) => set((state) => ({
    files: state.files.map((file) =>
      file.id === id ? { ...file, status, url, error } : file
    )
  })),

  clearFiles: () => set({ files: [] }),

  getFileById: (id) => get().files.find((file) => file.id === id)
}));