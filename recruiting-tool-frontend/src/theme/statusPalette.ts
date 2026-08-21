/**
 * Canonical status → colour mapping for the whole application.
 *
 * WHY THIS FILE EXISTS
 * --------------------
 * Before this module the same status word rendered in different colours
 * depending on which screen you were on:
 *
 *   status        StatusLabel      utils/statusColors      StatusChip
 *   OPEN          info             info                    success
 *   CLOSED        error            success                 default
 *   IN_PROGRESS   secondary        primary                 —
 *   CANCELLED     error            default                 —
 *   ARCHIVED      —                default                 warning
 *
 * There is now exactly ONE table. Every status-rendering component must read
 * its colour from `getStatusColor()` rather than re-deriving it locally.
 *
 * THE TAXONOMY
 * ------------
 * Statuses fall into four buckets and the colour follows the bucket, not the
 * word:
 *   in-flight / awaiting action  → info | primary | warning
 *   positive terminal            → success
 *   negative terminal            → error
 *   neutral terminal             → default
 *
 * A status is only allowed a per-domain override when the SAME word genuinely
 * means something different in that domain (see `DOMAIN_OVERRIDES`). Adding an
 * override is a deliberate act — do not add one just to keep a screen looking
 * the way it looks today.
 */

/**
 * The MUI colour slots a status is allowed to resolve to. Deliberately a plain
 * union rather than `ChipProps["color"]` so it is assignable to Chip, Badge,
 * Button, Alert and Avatar props alike without casting.
 */
export type StatusColor =
  | "default"
  | "primary"
  | "secondary"
  | "error"
  | "info"
  | "success"
  | "warning";

/**
 * Business domains that own a status vocabulary. Passing a domain is optional —
 * it only matters for the handful of words listed in `DOMAIN_OVERRIDES`.
 */
export type StatusDomain =
  | "application"
  | "hiringProcess"
  | "jobPosition"
  | "jobModeration"
  | "stage"
  | "userRole";

/**
 * The single source of truth. Keys are the raw upper-case status tokens the API
 * returns; they intentionally match the `status.*` i18n keys (lower-cased).
 */
export const STATUS_COLOR: Readonly<Record<string, StatusColor>> = {
  // ── in-flight / awaiting action ──────────────────────────────────────────
  OPEN: "info",
  CURRENT: "info",
  REVIEWED: "info",
  IN_PROGRESS: "primary",
  ACTIVE: "success",
  PENDING: "warning",
  PENDING_APPROVAL: "warning",

  // ── positive terminal ────────────────────────────────────────────────────
  DONE: "success",
  COMPLETED: "success",
  ACCEPTED: "success",
  APPROVED: "success",

  // ── negative terminal ────────────────────────────────────────────────────
  REJECTED: "error",

  // ── neutral terminal ─────────────────────────────────────────────────────
  CLOSED: "default",
  CANCELLED: "default",
  ARCHIVED: "default",
  INACTIVE: "default",
};

/**
 * The only sanctioned deviations from `STATUS_COLOR`.
 *
 * `hiringProcess.CLOSED` — a hiring process is CLOSED when the role has been
 * filled, i.e. it is a *successful* terminal state, unlike a CLOSED job posting
 * which is merely no longer accepting applications.
 */
const DOMAIN_OVERRIDES: Partial<
  Record<StatusDomain, Readonly<Record<string, StatusColor>>>
> = {
  hiringProcess: {
    CLOSED: "success",
  },
};

/**
 * Role → colour. Roles are not statuses (they are not a lifecycle) so they get
 * their own table, but they live here so that "what colour is this badge?" has
 * exactly one answer and one file.
 */
const ROLE_COLOR: Readonly<Record<string, StatusColor>> = {
  SUPER_ADMIN: "error",
  ADMIN: "warning",
  HR: "info",
};

/** Normalises whatever the API handed us into a lookup key. */
const normalise = (value: string | null | undefined): string =>
  (value ?? "").trim().toUpperCase();

/**
 * Resolves a status (or role) to its MUI colour slot.
 *
 * Unknown values resolve to `"default"` rather than throwing — status
 * vocabularies grow on the backend and a new enum member must never blank out
 * a table row.
 *
 * @param status Raw status token, e.g. `"IN_PROGRESS"`. Case-insensitive.
 * @param domain Optional owning domain; only affects the words in
 *               `DOMAIN_OVERRIDES` and switches to the role table for
 *               `"userRole"`.
 */
export const getStatusColor = (
  status: string | null | undefined,
  domain?: StatusDomain,
): StatusColor => {
  const key = normalise(status);
  if (!key) return "default";

  if (domain === "userRole") {
    return ROLE_COLOR[key] ?? "default";
  }

  const override = domain ? DOMAIN_OVERRIDES[domain]?.[key] : undefined;
  return override ?? STATUS_COLOR[key] ?? "default";
};

/**
 * Builds the i18n key for a status label. Centralised alongside the colour so
 * the two can never drift apart (they are derived from the same token).
 *
 * @example getStatusTranslationKey("IN_PROGRESS") // "status.in_progress"
 */
export const getStatusTranslationKey = (
  status: string | null | undefined,
  prefix = "status.",
): string => `${prefix}${normalise(status).toLowerCase()}`;
