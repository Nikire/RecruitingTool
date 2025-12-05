import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from '../../api/axios';
import { showSuccessToast, showErrorToast } from '../../utils/toast';

export interface HROnboardingStatus {
	isOnboardingComplete: boolean;
	isProfileComplete: boolean;
	hasCompany: boolean;
	nextStep: 'complete_profile' | 'dashboard';
}

export interface CompleteHROnboardingData {
	position?: string;
	department?: string;
	phoneNumber?: string;
	timezone?: string;
	bio?: string;
}

export interface HROnboardingCompleteResponse {
	message: string;
	isOnboardingComplete: boolean;
	redirectTo: string;
}

/**
 * Get HR onboarding status for current user
 */
export function useHROnboardingStatus() {
	return useQuery<HROnboardingStatus>({
		queryKey: ['onboarding', 'hr', 'status'],
		queryFn: async () => {
			const response = await axios.get('/users/onboarding/hr/status');
			return response.data;
		},
		retry: 1,
	});
}

/**
 * Complete HR onboarding
 */
export function useCompleteHROnboarding() {
	const queryClient = useQueryClient();

	return useMutation<HROnboardingCompleteResponse, Error, CompleteHROnboardingData>({
		mutationFn: async (data) => {
			const response = await axios.post('/users/onboarding/hr/complete', data);
			return response.data;
		},
		onSuccess: (data) => {
			// Invalidate onboarding status
			queryClient.invalidateQueries({ queryKey: ['onboarding', 'hr', 'status'] });
			// Invalidate user data
			queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });

			showSuccessToast(data.message);
		},
		onError: (error: any) => {
			const message = error.response?.data?.message || 'Failed to complete onboarding';
			showErrorToast(message);
		},
	});
}
