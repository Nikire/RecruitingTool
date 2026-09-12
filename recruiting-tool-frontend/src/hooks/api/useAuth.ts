import { authKeys } from "../../api/queryKeys";
import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import i18n from "i18next";
import {
  getCurrentUser,
  login,
  register,
  updateProfile,
  forgotPassword,
  resetPassword,
  verifyEmail,
  resendVerification,
  addEmail,
  getLinkedAccounts,
  requestEmailChange,
  confirmEmailChange,
  requestPasswordChange,
  confirmPasswordChange,
  logout as revokeRefreshToken,
} from "../../api/auth";
import { LinkedAccountsResponse, User } from "../../types/user.types";
import { useUserAtom } from "./state/useUserAtom";
import { showSuccessToast, showErrorToast } from "../../utils/toast";
import { identify, reset } from "../../analytics";
import { clearAttribution } from "../../utils/attribution";
import { AUTH_CLEARED_EVENT } from "../../api/axios";
import { resetAllFiltersAtom } from "../../store/filters.atoms";
import { useSetAtom } from "jotai";

/**
 * Binds the analytics + error-reporting identity to the user that just
 * authenticated.
 *
 * ALWAYS the public string `uid` — never the numeric database id. Exposing a
 * numeric id is a project-law violation, and the analytics wrapper rejects one
 * at runtime anyway.
 *
 * Wrapped in try/catch: analytics is best-effort telemetry and must never be
 * able to break a login or a signup.
 */
function identifyAuthenticatedUser(user: User | undefined | null): void {
  if (!user || typeof user.uid !== "string" || !user.uid) return;
  try {
    identify(user.uid, {
      companyUid: user.companyUid ?? user.company?.uid,
      // Primary role drives most cohort splits; the full list is kept for
      // multi-role accounts.
      role: user.roles?.[0],
      roles: user.roles,
    });
  } catch {
    // Telemetry only — swallow.
  }
}

export function useAuthMe() {
  const { setUser } = useUserAtom();
  const queryClient = useQueryClient();
  const token = localStorage.getItem("authToken");

  const {
    data: user,
    isLoading,
    isError,
  } = useQuery<User>({
    queryKey: authKeys.me(),
    queryFn: getCurrentUser,
    retry: 0,
    enabled: !!token, // Only fetch if token exists
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
  });

  // Update user atom when data changes
  useEffect(() => {
    if (user) {
      setUser(user);
    } else if (!token) {
      setUser(null);
    }
  }, [user, token, setUser]);

  // The axios interceptor wipes both tokens when a refresh fails, but it only
  // redirects on protected routes — on /careers, /blog or the landing page the
  // session just disappears. React Query keeps serving the last successful
  // /auth/me payload after a failed refetch, so the branch above never reaches
  // `setUser(null)` and the navbar keeps rendering a signed-out visitor's
  // avatar and name. Listen for the interceptor's event and drop the identity
  // explicitly.
  useEffect(() => {
    const handleAuthCleared = () => {
      setUser(null);
      queryClient.removeQueries({ queryKey: authKeys.me() });
    };

    window.addEventListener(AUTH_CLEARED_EVENT, handleAuthCleared);
    return () => {
      window.removeEventListener(AUTH_CLEARED_EVENT, handleAuthCleared);
    };
  }, [setUser, queryClient]);

  return {
    user,
    isLoading,
    isError,
    isAuthenticated: !!user && !!token,
  };
}

export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: login,
    onSuccess: (data) => {
      // Validate tokens before storing
      if (
        !data.token ||
        typeof data.token !== "string" ||
        data.token === "null" ||
        data.token === "undefined"
      ) {
        console.error("[AUTH] Invalid access token received:", data.token);
        showErrorToast(
          new Error(i18n.t("auth.toast.invalid_token")),
          i18n.t("auth.toast.auth_failed"),
        );
        return;
      }

      if (
        !data.refreshToken ||
        typeof data.refreshToken !== "string" ||
        data.refreshToken === "null" ||
        data.refreshToken === "undefined"
      ) {
        console.error(
          "[AUTH] Invalid refresh token received:",
          data.refreshToken,
        );
        showErrorToast(
          new Error(i18n.t("auth.toast.invalid_refresh_token")),
          i18n.t("auth.toast.auth_failed"),
        );
        return;
      }

      // Store both tokens
      localStorage.setItem("authToken", data.token);
      localStorage.setItem("refreshToken", data.refreshToken);

      // Bind the analytics identity as soon as the session is real.
      identifyAuthenticatedUser(data.user);

      // Invalidate to fetch user data
      queryClient.invalidateQueries({ queryKey: authKeys.me() });
      showSuccessToast(i18n.t("auth.toast.login_success"));
    },
    onError: (error) => {
      showErrorToast(error, i18n.t("auth.toast.login_failed"));
    },
  });
}

export function useRegister() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: register,
    onSuccess: (data) => {
      // The account now exists server-side, so the identity and the attribution
      // stash are settled BEFORE the token sanity checks below — a malformed
      // token must not silently lose the conversion.
      identifyAuthenticatedUser(data.user);

      // The first-touch attribution has been persisted onto the User row by the
      // register call, so drop the stash: a second signup in the same tab must
      // not be credited to the same campaign twice.
      clearAttribution();

      // Validate tokens before storing
      if (
        !data.token ||
        typeof data.token !== "string" ||
        data.token === "null" ||
        data.token === "undefined"
      ) {
        console.error(
          "[AUTH] Invalid access token received during registration:",
          data.token,
        );
        showErrorToast(
          new Error(i18n.t("auth.toast.invalid_token")),
          i18n.t("auth.toast.register_failed"),
        );
        return;
      }

      if (
        !data.refreshToken ||
        typeof data.refreshToken !== "string" ||
        data.refreshToken === "null" ||
        data.refreshToken === "undefined"
      ) {
        console.error(
          "[AUTH] Invalid refresh token received during registration:",
          data.refreshToken,
        );
        showErrorToast(
          new Error(i18n.t("auth.toast.invalid_refresh_token")),
          i18n.t("auth.toast.register_failed"),
        );
        return;
      }

      // Store both tokens
      localStorage.setItem("authToken", data.token);
      localStorage.setItem("refreshToken", data.refreshToken);

      // Invalidate to fetch user data
      queryClient.invalidateQueries({ queryKey: authKeys.me() });
      showSuccessToast(i18n.t("auth.toast.register_success"));
    },
    onError: (error) => {
      showErrorToast(error, i18n.t("auth.toast.register_failed"));
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  const { setUser } = useUserAtom();
  const resetAllFilters = useSetAtom(resetAllFiltersAtom);

  return () => {
    // Drop the analytics + Sentry identity first, so nothing captured after
    // this point is attributed to the user who just signed out.
    try {
      reset();
    } catch {
      // Telemetry only — swallow.
    }

    // Revoke the refresh token server-side BEFORE dropping it from storage.
    // Without this the token stays exchangeable at POST /auth/refresh for its
    // full lifetime, so a copy taken from a shared machine still buys a fresh
    // access token long after the user signed out. Best-effort: sign-out must
    // complete locally even if the network call fails.
    const refreshToken = localStorage.getItem("refreshToken");
    if (refreshToken) {
      void revokeRefreshToken(refreshToken).catch(() => {
        // Already signing out locally — nothing useful to surface.
      });
    }

    // Clear both tokens
    localStorage.removeItem("authToken");
    localStorage.removeItem("refreshToken");
    setUser(null);

    // Every logout path is an SPA navigation, so nothing else drops the cache.
    // Removing only authKeys.me() left candidates, job positions, files,
    // analytics and quota entries from the previous account in memory (5 min
    // staleTime / 10 min gcTime), where the next account to sign in on the same
    // tab would be served them before any refetch. Drop the whole cache.
    queryClient.clear();

    // Filter atoms are module-level globals under a single root provider, so a
    // stale search term and page number would otherwise follow the next user
    // into their first list view.
    resetAllFilters();
  };
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: forgotPassword,
  });
}

export function useResetPassword() {
  return useMutation({
    mutationFn: resetPassword,
  });
}

export function useVerifyEmail() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (token: string) => verifyEmail(token),
    onSuccess: () => {
      // The cached /auth/me still says emailVerified=false (5 min staleTime);
      // refresh it so ProtectedRoute stops sending the user back to the gate.
      queryClient.invalidateQueries({ queryKey: authKeys.me() });
    },
  });
}

export function useResendVerification() {
  return useMutation({
    mutationFn: resendVerification,
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const { setUser } = useUserAtom();

  return useMutation({
    mutationFn: updateProfile,
    onSuccess: (updatedUser) => {
      // Update user in cache and atom
      queryClient.setQueryData(authKeys.me(), updatedUser);
      setUser(updatedUser);
      showSuccessToast(i18n.t("profile.toast.updated"));
    },
    onError: (error) => {
      showErrorToast(error, i18n.t("profile.toast.update_failed"));
    },
  });
}

export function useAddEmail() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addEmail,
    onSuccess: () => {
      // Refresh user data so email field updates
      queryClient.invalidateQueries({ queryKey: authKeys.me() });
    },
  });
}

export function useLinkedAccounts() {
  const token = localStorage.getItem("authToken");

  return useQuery<LinkedAccountsResponse>({
    queryKey: authKeys.linkedAccounts(),
    queryFn: getLinkedAccounts,
    enabled: !!token,
    staleTime: 5 * 60 * 1000,
  });
}

export function useRequestEmailChange() {
  return useMutation({
    mutationFn: requestEmailChange,
  });
}

export function useConfirmEmailChange() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: confirmEmailChange,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: authKeys.me() });
    },
  });
}

export function useRequestPasswordChange() {
  return useMutation({
    mutationFn: requestPasswordChange,
  });
}

export function useConfirmPasswordChange() {
  return useMutation({
    mutationFn: confirmPasswordChange,
  });
}
