import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { invitationsService } from "../services/invitations.service";
import { CreateInvitationDto, InvitationStatus } from "../types/invitations";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { ANALYTICS_EVENTS } from "../analytics";
import { useActivationEvents } from "./api/useActivationEvents";

/**
 * Hook to fetch company invitations
 */
export const useCompanyInvitations = (
  companyUid: string,
  status?: InvitationStatus,
) => {
  return useQuery({
    queryKey: ["companyInvitations", companyUid, status],
    queryFn: () => invitationsService.getCompanyInvitations(companyUid, status),
    enabled: !!companyUid,
  });
};

/**
 * Hook to create a company invitation
 */
export const useCreateInvitation = (companyUid: string) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { trackAlways } = useActivationEvents();

  return useMutation({
    mutationFn: (data: CreateInvitationDto) =>
      invitationsService.createInvitation(companyUid, data),
    onSuccess: (created, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["companyInvitations", companyUid],
      });
      toast.success(t("team.invitation_sent"));
      // Expansion signal - every invite counts, not just the first.
      // Mirrored server-side as TEAMMATE_INVITED.
      trackAlways(ANALYTICS_EVENTS.TEAMMATE_INVITED, {
        invitationUid: created?.uid,
        role: variables?.role,
      });
    },
    onError: (error: unknown) => {
      const axiosError = error as {
        response?: { data?: { message?: string } };
      };
      const message =
        axiosError.response?.data?.message || t("errors.create_failed");
      toast.error(message);
    },
  });
};

/**
 * Hook to cancel an invitation
 */
export const useCancelInvitation = (companyUid: string) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (invitationUid: string) =>
      invitationsService.cancelInvitation(companyUid, invitationUid),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["companyInvitations", companyUid],
      });
      toast.success(t("team.invitation_cancelled"));
    },
    onError: (error: unknown) => {
      const axiosError = error as {
        response?: { data?: { message?: string } };
      };
      const message =
        axiosError.response?.data?.message || t("errors.operation_failed");
      toast.error(message);
    },
  });
};

/**
 * Hook to accept an invitation
 */
export const useAcceptInvitation = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (token: string) => invitationsService.acceptInvitation(token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
      queryClient.invalidateQueries({ queryKey: ["companyInvitations"] });
      toast.success(t("team.invitation_accepted"));
    },
    onError: (error: unknown) => {
      const axiosError = error as {
        response?: { data?: { message?: string } };
      };
      const message =
        axiosError.response?.data?.message || t("errors.operation_failed");
      toast.error(message);
    },
  });
};
