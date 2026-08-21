import { companyKeys, companyProfileKeys } from "../../api/queryKeys";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { companiesApi } from "../../api/companies";
import {
  CreateCompanyDto,
  ForceJoinDto,
  TransferOwnershipDto,
  UpdateCompanyDto,
  UpdateCompanyProfileDto,
} from "../../types/company.types";
import { PaginationParams } from "../../types/pagination.types";
import { showSuccessToast, showErrorToast } from "../../utils/toast";

export const useCompanies = (uid?: string) => {
  return useQuery({
    // Always the collection key. This hook is disabled whenever a uid is
    // supplied, and keying it by uid collided with useCompany(uid), which
    // caches a single Company in the same slot.
    queryKey: companyKeys.all,
    queryFn: () => companiesApi.getAll(),
    enabled: !uid,
  });
};

export const usePublicCompaniesWithJobs = () => {
  return useQuery({
    queryKey: companyKeys.publicWithJobs(),
    queryFn: () => companiesApi.getPublicWithJobs(),
    staleTime: 10 * 60 * 1000, // 10 minutes (matches backend cache)
  });
};

export const useListCompanies = (params: PaginationParams) => {
  return useQuery({
    queryKey: companyKeys.list(params),
    queryFn: () => companiesApi.list(params),
  });
};

export const useCompany = (uid: string) => {
  return useQuery({
    queryKey: companyKeys.detail(uid),
    queryFn: () => companiesApi.getOne(uid),
    enabled: !!uid,
  });
};

export const useCreateCompany = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCompanyDto) => companiesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: companyKeys.all });
      showSuccessToast("Company created successfully!");
    },
    onError: (error) => {
      showErrorToast(error, "Failed to create company");
    },
  });
};

export const useUpdateCompany = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ uid, data }: { uid: string; data: UpdateCompanyDto }) =>
      companiesApi.update(uid, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: companyKeys.all });
      showSuccessToast("Company updated successfully!");
    },
    onError: (error) => {
      showErrorToast(error, "Failed to update company");
    },
  });
};

export const useDeleteCompany = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (uid: string) => companiesApi.delete(uid),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: companyKeys.all });
      showSuccessToast("Company deleted successfully!");
    },
    onError: (error) => {
      showErrorToast(error, "Failed to delete company");
    },
  });
};

export const useCompanyUsers = (
  companyUid: string,
  params: PaginationParams,
) => {
  return useQuery({
    queryKey: companyKeys.usersList(companyUid, params),
    queryFn: () => companiesApi.getCompanyUsers(companyUid, params),
    enabled: !!companyUid,
  });
};

export const useTransferOwnership = (companyUid: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: TransferOwnershipDto) =>
      companiesApi.transferOwnership(companyUid, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: companyKeys.all });
      queryClient.invalidateQueries({
        queryKey: companyKeys.users(companyUid),
      });
      showSuccessToast("Ownership transferred successfully!");
    },
    onError: (error) => {
      showErrorToast(error, "Failed to transfer ownership");
    },
  });
};

export const useForceJoinUser = (companyUid: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ForceJoinDto) =>
      companiesApi.forceJoinUser(companyUid, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: companyKeys.all });
      queryClient.invalidateQueries({
        queryKey: companyKeys.users(companyUid),
      });
      showSuccessToast("User successfully joined the company!");
    },
    onError: (error) => {
      showErrorToast(error, "Failed to force join user");
    },
  });
};

export const useMyCompanyProfile = () => {
  return useQuery({
    queryKey: companyProfileKeys.mine(),
    queryFn: () => companiesApi.getMyProfile(),
    staleTime: 5 * 60 * 1000,
  });
};

export const useUpdateMyCompanyProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateCompanyProfileDto) =>
      companiesApi.updateMyProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: companyProfileKeys.all });
      queryClient.invalidateQueries({ queryKey: companyKeys.all });
    },
    onError: (error) => {
      showErrorToast(error, "Failed to update company profile");
    },
  });
};

export const useUploadCompanyLogo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => companiesApi.uploadLogo(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: companyProfileKeys.all });
      queryClient.invalidateQueries({ queryKey: companyKeys.all });
    },
    onError: (error) => {
      showErrorToast(error, "Failed to upload logo");
    },
  });
};
