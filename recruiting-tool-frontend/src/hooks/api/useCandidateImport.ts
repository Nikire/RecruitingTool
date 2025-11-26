import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from '../../api/axios';
import { CandidateImportPreview, CandidateImportResult } from '../../types/candidate-import.types';
import toast from 'react-hot-toast';

/**
 * Preview CSV import without creating candidates
 */
export const usePreviewCandidateImport = () => {
  return useMutation<CandidateImportPreview, Error, File>({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);

      const response = await axios.post<CandidateImportPreview>(
        '/candidate/import/preview',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      return response.data;
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || 'Failed to preview CSV file';
      toast.error(errorMessage);
    },
  });
};

/**
 * Import candidates from CSV
 */
export const useImportCandidates = () => {
  const queryClient = useQueryClient();

  return useMutation<CandidateImportResult, Error, File>({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);

      const response = await axios.post<CandidateImportResult>(
        '/candidate/import',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      return response.data;
    },
    onSuccess: (data) => {
      // Invalidate candidates query to refresh the list
      queryClient.invalidateQueries({ queryKey: ['candidates'] });

      if (data.successCount > 0) {
        toast.success(`Successfully imported ${data.successCount} candidate(s)`);
      }

      if (data.errorCount > 0) {
        toast.error(`${data.errorCount} row(s) failed to import`);
      }
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || 'Failed to import candidates';
      toast.error(errorMessage);
    },
  });
};

/**
 * Download CSV template
 */
export const downloadCandidateImportTemplate = async () => {
  try {
    const response = await axios.get('/candidate/import/template', {
      responseType: 'blob',
    });

    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'candidate-import-template.csv');
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);

    toast.success('Template downloaded successfully');
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || 'Failed to download template';
    toast.error(errorMessage);
  }
};
