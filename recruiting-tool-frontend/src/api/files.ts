import axios from "./axios";

export interface FileUploadResponse {
  uid: string;
  filename: string;
  originalName: string;
  mimetype: string;
  size: number;
  s3Key: string;
  uploadedByUid?: string;
  uploadedByName?: string;
  candidateUid?: string;
  candidateName?: string;
  createdAt: string;
  updatedAt: string;
  downloadUrl?: string;
}

export interface CompanyFile {
  uid: string;
  originalName: string;
  mimetype: string;
  size: number;
  createdAt: string;
  downloadUrl: string;
  uploadedByName?: string;
  candidateUid?: string;
  candidateName?: string;
}

export interface FileViewUrlResponse {
  uid: string;
  /** Short-lived (5 min) presigned URL served directly by object storage */
  url: string;
  expiresIn: number;
  originalName: string;
  mimetype: string;
}

export interface CompanyStorageUsage {
  usedMB: number;
  limitMB: number;
  percentage: number;
}

export interface UploadFileParams {
  file: File;
  candidateUid?: string;
}

export interface FileListParams {
  candidateUid?: string;
}

/**
 * Upload a resume file without authentication (for job applications)
 */
export const uploadResumePublic = async (
  file: File,
): Promise<FileUploadResponse> => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await axios.post<FileUploadResponse>(
    "/files/upload-resume-public",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );

  return response.data;
};

/**
 * Upload a document file (optionally associate with a candidate)
 */
export const uploadFile = async ({
  file,
  candidateUid,
}: UploadFileParams): Promise<FileUploadResponse> => {
  const formData = new FormData();
  formData.append("file", file);

  const url = candidateUid
    ? `/files/upload?candidateUid=${candidateUid}`
    : "/files/upload";

  const response = await axios.post<FileUploadResponse>(url, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};

/**
 * Upload an image file (for profile pictures, etc.)
 */
export const uploadImage = async (file: File): Promise<FileUploadResponse> => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await axios.post<FileUploadResponse>(
    "/files/upload-image",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );

  return response.data;
};

/**
 * Get list of files (optionally filter by candidate)
 */
export const getFiles = async (
  params?: FileListParams,
): Promise<FileUploadResponse[]> => {
  const queryParams = params?.candidateUid
    ? `?candidateUid=${params.candidateUid}`
    : "";
  const response = await axios.get<FileUploadResponse[]>(
    `/files${queryParams}`,
  );
  return response.data;
};

/**
 * Get single file metadata
 */
export const getFile = async (uid: string): Promise<FileUploadResponse> => {
  const response = await axios.get<FileUploadResponse>(`/files/${uid}`);
  return response.data;
};

/**
 * Download file (triggers browser download)
 */
export const downloadFile = async (
  uid: string,
  filename: string,
): Promise<void> => {
  const response = await axios.get(`/files/${uid}/download`, {
    responseType: "blob",
  });

  // Create a blob URL and trigger download
  const blob = new Blob([response.data]);
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

/**
 * Build the URL of a PUBLIC asset served without authentication.
 *
 * ONLY valid for genuinely public assets - avatars / profile pictures and other
 * images that are not attached to a candidate, application or submission. The
 * backend serves 404 on this route for every private document, so never use it
 * for resumes, cover letters or candidate attachments; use `getFileViewUrl()`
 * (or `openFileInNewTab()`) for those.
 *
 * @param uid - File UID (already a full URL values are returned untouched)
 */
export const buildPublicAssetUrl = (uid?: string): string | undefined => {
  if (!uid) return undefined;
  if (uid.startsWith("http")) return uid;
  return `${import.meta.env.VITE_API_URL}/files/${uid}/view`;
};

/**
 * Request a short-lived presigned URL to view a PRIVATE file inline.
 *
 * The request is authenticated (axios attaches the bearer token) and the backend
 * asserts the file belongs to the caller's company before signing.
 */
export const getFileViewUrl = async (
  uid: string,
): Promise<FileViewUrlResponse> => {
  const response = await axios.get<FileViewUrlResponse>(
    `/files/${uid}/view-url`,
  );
  return response.data;
};

/**
 * Open a private file in a new tab.
 *
 * The tab is opened synchronously (before the await) so that popup blockers do
 * not swallow it, then pointed at the presigned URL once it comes back.
 */
export const openFileInNewTab = async (uid: string): Promise<void> => {
  const tab = window.open("", "_blank", "noopener,noreferrer");

  try {
    const { url } = await getFileViewUrl(uid);

    if (tab) {
      tab.location.href = url;
    } else {
      // Popup blocked - fall back to navigating the current tab.
      window.location.href = url;
    }
  } catch (error) {
    tab?.close();
    throw error;
  }
};

/**
 * Delete file
 */
export const deleteFile = async (uid: string): Promise<void> => {
  await axios.delete(`/files/${uid}`);
};

/**
 * Get all files belonging to the current user's company
 */
export const getCompanyFiles = async (): Promise<CompanyFile[]> => {
  const response = await axios.get<CompanyFile[]>("/files/company");
  return response.data;
};

/**
 * Get company storage usage
 */
export const getCompanyStorageUsage =
  async (): Promise<CompanyStorageUsage> => {
    const response = await axios.get<CompanyStorageUsage>(
      "/files/company/storage",
    );
    return response.data;
  };

/**
 * Download selected files as a ZIP archive
 */
export const downloadZip = async (uids: string[]): Promise<void> => {
  const response = await axios.post(
    "/files/download-zip",
    { uids },
    { responseType: "blob" },
  );
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement("a");
  link.href = url;
  link.download = "files.zip";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

/**
 * Delete multiple files
 */
export const deleteManyFiles = async (
  uids: string[],
): Promise<{ deleted: number }> => {
  const response = await axios.delete<{ deleted: number }>("/files/bulk", {
    data: { uids },
  });
  return response.data;
};
