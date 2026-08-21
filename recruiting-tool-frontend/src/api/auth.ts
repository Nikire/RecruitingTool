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

/**
 * First-touch marketing attribution accepted by `POST /auth/register`.
 *
 * Every field is optional: omitting all of them never fails the request, which
 * is deliberate — a visitor with sessionStorage blocked must still be able to
 * sign up. The fields are WRITE-ONLY server-side (they are not part of
 * `UserResponseDto`), so nothing here is ever read back from the API.
 *
 * Populate with `buildRegistrationAttribution()` from
 * `src/pages/auth/signupFunnel.ts` rather than mapping the stash by hand.
 */
export interface RegistrationAttribution {
  /** Max 255 chars server-side. */
  utmSource?: string;
  /** Max 255 chars server-side. */
  utmMedium?: string;
  /** Max 255 chars server-side. */
  utmCampaign?: string;
  /** Max 255 chars server-side. */
  utmTerm?: string;
  /** Max 255 chars server-side. */
  utmContent?: string;
  /** Raw `document.referrer` of the first touch. Max 2048 chars server-side. */
  referrerUrl?: string;
  /** Pathname of the session's first page. Max 2048 chars server-side. */
  landingPath?: string;
}

export interface RegisterPayload extends RegistrationAttribution {
  name: string;
  email: string;
  password: string;
  roles?: string[];
  companyName?: string;
}

export function register(
  data: RegisterPayload,
): Promise<{ user: User; token: string; refreshToken: string }> {
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
 * Request an email address change — sends a 6-digit code to the new email
 */
export function requestEmailChange(data: {
  newEmail: string;
}): Promise<{ message: string }> {
  return api.post("/auth/change-email/request", data).then((res) => res.data);
}

/**
 * Confirm email address change using the 6-digit code
 */
export function confirmEmailChange(data: {
  code: string;
}): Promise<{ message: string }> {
  return api.post("/auth/change-email/confirm", data).then((res) => res.data);
}

/**
 * Request a password change — sends a 6-digit code to the current email
 */
export function requestPasswordChange(): Promise<{ message: string }> {
  return api.post("/auth/change-password/request").then((res) => res.data);
}

/**
 * Confirm password change using the 6-digit code and new password
 */
export function confirmPasswordChange(data: {
  code: string;
  newPassword: string;
}): Promise<{ message: string }> {
  return api
    .post("/auth/change-password/confirm", data)
    .then((res) => res.data);
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
