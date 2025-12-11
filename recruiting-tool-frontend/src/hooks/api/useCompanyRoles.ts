import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { companyRolesApi } from "../../api/companyRoles";
import { AssignRoleDto, UpdateRoleDto } from "../../types/user.types";
import { showSuccessToast, showErrorToast } from "../../utils/toast";
import { useTranslation } from "react-i18next";

const COMPANY_ROLES_KEY = "company-roles";

/**
 * Hook to fetch all company members
 */
export const useCompanyMembers = (companyUid: string) => {
  return useQuery({
    queryKey: [COMPANY_ROLES_KEY, companyUid, "members"],
    queryFn: () => companyRolesApi.getCompanyMembers(companyUid),
    enabled: !!companyUid,
  });
};

/**
 * Hook to fetch roles that can be delegated by the current user
 */
export const useDelegatableRoles = (companyUid: string) => {
  return useQuery({
    queryKey: [COMPANY_ROLES_KEY, companyUid, "delegatable"],
    queryFn: () => companyRolesApi.getDelegatableRoles(companyUid),
    enabled: !!companyUid,
  });
};

/**
 * Hook to assign role(s) to a user
 */
export const useAssignRole = (companyUid: string) => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: (data: AssignRoleDto) =>
      companyRolesApi.assignRole(companyUid, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [COMPANY_ROLES_KEY, companyUid],
      });
      showSuccessToast(t("company_roles.role_assigned_success"));
    },
    onError: (error) => {
      showErrorToast(error, t("company_roles.role_assigned_error"));
    },
  });
};

/**
 * Hook to update a user's role(s)
 */
export const useUpdateUserRole = (companyUid: string) => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: ({ userUid, data }: { userUid: string; data: UpdateRoleDto }) =>
      companyRolesApi.updateUserRole(companyUid, userUid, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [COMPANY_ROLES_KEY, companyUid],
      });
      showSuccessToast(t("company_roles.role_updated_success"));
    },
    onError: (error) => {
      showErrorToast(error, t("company_roles.role_updated_error"));
    },
  });
};

/**
 * Hook to remove a user from the company
 */
export const useRemoveUserFromCompany = (companyUid: string) => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: (userUid: string) =>
      companyRolesApi.removeUserFromCompany(companyUid, userUid),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [COMPANY_ROLES_KEY, companyUid],
      });
      showSuccessToast(t("company_roles.user_removed_success"));
    },
    onError: (error) => {
      showErrorToast(error, t("company_roles.user_removed_error"));
    },
  });
};
