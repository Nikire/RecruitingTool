import { LinkedAccountsResponse, User } from "../types/user.types";
import api from "./axios";

export interface RegisteredUserDto {
  user: User;
  token: string;
  refreshToken: string;
}

export function getCurrentUser(): Promise<User> {
  return api.get("/auth/me").then((res) => res.data);
}

export function login(data: {
  email: string;
  password: string;
}): Promise<{ user: User; token: string; refreshToken: string }> {
  return api.post("/auth/sign-in", data).then((res) => res.data);
}

export function register(data: {
  name: string;
  email: string;
  password: string;
  roles?: string[];
  companyName?: string;
}): Promise<{ user: User; token: string; refreshToken: string }> {
  return api.post("/auth/register", data).then((res) => res.data);
}

export function refreshToken(refreshToken: string): Promise<{
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}> {
  return api.post("/auth/refresh", { refreshToken }).then((res) => res.data);
}

export function logout(refreshToken: string): Promise<{ message: string }> {
  return api.post("/auth/logout", { refreshToken }).then((res) => res.data);
}

export function updateProfile(data: {
  phoneNumber?: string;
  location?: string;
  linkedinUrl?: string;
  portfolioUrl?: string;
}): Promise<User> {
  return api.patch("/users/profile", data).then((res) => res.data);
}

/**
 * Get list of linked social accounts for current user
 */
export function getLinkedAccounts(): Promise<LinkedAccountsResponse> {
  return api.get("/auth/linked-accounts").then((res) => res.data);
}

/**
 * Link a social account to the current user
 * Requires Auth0 token in Authorization header and local JWT in X-Local-Token header
 */
export function linkSocialAccount(
  auth0Token: string,
  localToken: string,
): Promise<{ message: string }> {
  return api
    .post(
      "/auth/link-social",
      {},
      {
        headers: {
          Authorization: `Bearer ${auth0Token}`,
          "X-Local-Token": localToken,
        },
      },
    )
    .then((res) => res.data);
}

/**
 * Unlink social account from the current user
 */
export function unlinkSocialAccount(): Promise<{ message: string }> {
  return api.delete("/auth/unlink-social").then((res) => res.data);
}

/**
 * Request a password reset email for the given address
 */
export function forgotPassword(data: {
  email: string;
}): Promise<{ message: string }> {
  return api.post("/auth/forgot-password", data).then((res) => res.data);
}

/**
 * Reset the user password using the token received via email
 */
export function resetPassword(data: {
  token: string;
  newPassword: string;
}): Promise<{ message: string }> {
  return api.post("/auth/reset-password", data).then((res) => res.data);
}

/**
 * Verify email address using the token from the verification email
 */
export function verifyEmail(token: string): Promise<{ message: string }> {
  return api
    .get("/auth/verify-email", { params: { token } })
    .then((res) => res.data);
}

/**
 * Resend the email verification link (requires authentication)
 */
export function resendVerification(): Promise<{ message: string }> {
  return api.post("/auth/resend-verification").then((res) => res.data);
}

/**
 * Add an email address to a social-only account (user has no email set)
 */
export function addEmail(data: {
  email: string;
}): Promise<{ message: string }> {
  return api.post("/auth/add-email", data).then((res) => res.data);
}

/**
 * Exchange an Auth0 access token for a local JWT.
 * Called after Auth0 redirects back to the app and isAuthenticated becomes true.
 */
export function socialCallback(auth0Token: string): Promise<RegisteredUserDto> {
  return api
    .post(
      "/auth/social/callback",
      {},
      {
        headers: { Authorization: `Bearer ${auth0Token}` },
      },
    )
    .then((res) => res.data);
}
