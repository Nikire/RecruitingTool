import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import {
  createConnectionRequest,
  getMyConnectionRequests,
  getCompanyConnectionRequests,
  approveConnectionRequest,
  denyConnectionRequest,
  cancelConnectionRequest,
} from "../../services/api/connection-requests";
import {
  ApproveConnectionRequestDto,
  DenyConnectionRequestDto,
  GetConnectionRequestsQuery,
} from "../../types/connection-requests";

/**
 * Hook to create a connection request
 */
export const useCreateConnectionRequest = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: createConnectionRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["connection-requests", "my"],
      });
      toast.success(t("connection_requests.request_sent"));
    },
    onError: (error: unknown) => {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message || t("connection_requests.errors.create_failed");
      toast.error(message);
    },
  });
};

/**
 * Hook to get my connection requests
 */
export const useMyConnectionRequests = (query?: GetConnectionRequestsQuery) => {
  return useQuery({
    queryKey: ["connection-requests", "my", query],
    queryFn: () => getMyConnectionRequests(query),
  });
};

/**
 * Hook to get company connection requests (admin/owner only)
 */
export const useCompanyConnectionRequests = (
  companyUid: string,
  query?: GetConnectionRequestsQuery,
) => {
  return useQuery({
    queryKey: ["connection-requests", "company", companyUid, query],
    queryFn: () => getCompanyConnectionRequests(companyUid, query),
    enabled: !!companyUid,
  });
};

/**
 * Hook to approve a connection request
 */
export const useApproveConnectionRequest = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: ({
      requestUid,
      dto,
    }: {
      requestUid: string;
      dto: ApproveConnectionRequestDto;
    }) => approveConnectionRequest(requestUid, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["connection-requests"] });
      toast.success(t("connection_requests.request_approved"));
    },
    onError: (error: unknown) => {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message || t("connection_requests.errors.approve_failed");
      toast.error(message);
    },
  });
};

/**
 * Hook to deny a connection request
 */
export const useDenyConnectionRequest = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: ({
      requestUid,
      dto,
    }: {
      requestUid: string;
      dto: DenyConnectionRequestDto;
    }) => denyConnectionRequest(requestUid, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["connection-requests"] });
      toast.success(t("connection_requests.request_denied"));
    },
    onError: (error: unknown) => {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message || t("connection_requests.errors.deny_failed");
      toast.error(message);
    },
  });
};

/**
 * Hook to cancel a connection request
 */
export const useCancelConnectionRequest = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: cancelConnectionRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["connection-requests", "my"],
      });
      toast.success(t("connection_requests.request_cancelled"));
    },
    onError: (error: unknown) => {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message || t("connection_requests.errors.cancel_failed");
      toast.error(message);
    },
  });
};
