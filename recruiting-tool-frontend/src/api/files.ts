import axios from './axios';

export interface FileUploadResponse {
	uid: string;
	filename: string;
	originalName: string;
	mimetype: string;
	size: number;
	s3Key: string;
	uploadedByUid?: string;
	candidateUid?: string;
	createdAt: string;
	updatedAt: string;
	downloadUrl?: string;
}

export interface UploadFileParams {
	file: File;
	candidateUid?: string;
}

export interface FileListParams {
	candidateUid?: string;
}

/**
 * Upload a document file (optionally associate with a candidate)
 */
export const uploadFile = async ({ file, candidateUid }: UploadFileParams): Promise<FileUploadResponse> => {
	const formData = new FormData();
	formData.append('file', file);

	const url = candidateUid ? `/files/upload?candidateUid=${candidateUid}` : '/files/upload';

	const response = await axios.post<FileUploadResponse>(url, formData, {
		headers: {
			'Content-Type': 'multipart/form-data',
		},
	});

	return response.data;
};

/**
 * Upload an image file (for profile pictures, etc.)
 */
export const uploadImage = async (file: File): Promise<FileUploadResponse> => {
	const formData = new FormData();
	formData.append('file', file);

	const response = await axios.post<FileUploadResponse>('/files/upload-image', formData, {
		headers: {
			'Content-Type': 'multipart/form-data',
		},
	});

	return response.data;
};

/**
 * Get list of files (optionally filter by candidate)
 */
export const getFiles = async (params?: FileListParams): Promise<FileUploadResponse[]> => {
	const queryParams = params?.candidateUid ? `?candidateUid=${params.candidateUid}` : '';
	const response = await axios.get<FileUploadResponse[]>(`/files${queryParams}`);
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
export const downloadFile = async (uid: string, filename: string): Promise<void> => {
	const response = await axios.get(`/files/${uid}/download`, {
		responseType: 'blob',
	});

	// Create a blob URL and trigger download
	const blob = new Blob([response.data]);
	const url = window.URL.createObjectURL(blob);
	const link = document.createElement('a');
	link.href = url;
	link.download = filename;
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
	window.URL.revokeObjectURL(url);
};

/**
 * Delete file
 */
export const deleteFile = async (uid: string): Promise<void> => {
	await axios.delete(`/files/${uid}`);
};
