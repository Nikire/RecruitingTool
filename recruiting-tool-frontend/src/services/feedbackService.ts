import api from '../api/axios';
import { Feedback, CreateFeedbackDto } from '../types/feedback';

const BASE_URL = '/feedback';

export const feedbackService = {
  /**
   * Submit feedback
   */
  async createFeedback(dto: CreateFeedbackDto): Promise<Feedback> {
    const response = await api.post<Feedback>(BASE_URL, dto);
    return response.data;
  },

  /**
   * Get all feedback for company (admin only)
   */
  async getAllFeedback(): Promise<Feedback[]> {
    const response = await api.get<Feedback[]>(BASE_URL);
    return response.data;
  },

  /**
   * Get own feedback submissions
   */
  async getMyFeedback(): Promise<Feedback[]> {
    const response = await api.get<Feedback[]>(`${BASE_URL}/my-feedback`);
    return response.data;
  },
};
