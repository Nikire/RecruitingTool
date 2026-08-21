import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import jsxA11y from "eslint-plugin-jsx-a11y";
import i18next from "eslint-plugin-i18next";
import tseslint from "typescript-eslint";

// ───────────────────────────────────────────────────────────────────────────
// LEGACY DEBT BASELINE — measured 2026-08-20, and it is a BACKLOG, not a policy.
//
// `yarn lint:check` runs `eslint . --max-warnings=0`, so on this repo a rule set
// to "warn" fails CI exactly as hard as one set to "error". There is therefore no
// warn-first middle gear: a rule is either enforced everywhere or it cannot be
// turned on at all.
//
// So every accessibility and i18n rule below is enforced at ERROR repo-wide, and
// the files that already violated it on the day it was switched on are listed
// here, per rule, with their finding counts. Consequences worth being explicit
// about:
//   • Every NEW file, and every new violation in an unlisted file, is a hard
//     CI failure. That is the point — this stops the bleeding.
//   • A listed file is exempt ONLY from the specific rule it is listed under.
//     It is still fully linted by every other rule.
//   • Fix a file, delete its line. The lists only shrink. When a rule's list
//     empties, delete the whole entry.
// Do not add to these lists to silence new code. Fix the code.
// ───────────────────────────────────────────────────────────────────────────

const A11Y_LEGACY = [
  // jsx-a11y/no-autofocus — 13 finding(s) in 10 file(s)
  {
    rule: "jsx-a11y/no-autofocus",
    files: [
      "src/components/contact/BookDemoDialog.tsx", // 1
      "src/components/dialogs/AddEmailDialog.tsx", // 1
      "src/components/dialogs/ChangeEmailDialog.tsx", // 2
      "src/components/dialogs/ChangePasswordDialog.tsx", // 1
      "src/components/dialogs/FormDialog.tsx", // 1
      "src/components/dialogs/JobModerationReviewDialog.tsx", // 1
      "src/components/dialogs/ManualCandidateDialog.tsx", // 1
      "src/pages/admin/CustomPlansPage.tsx", // 1
      "src/pages/admin/OutreachCampaignsPage.tsx", // 2
      "src/pages/settings/ApiKeysPage.tsx", // 2
    ],
  },
  // jsx-a11y/anchor-is-valid — 13 finding(s) in 8 file(s)
  {
    rule: "jsx-a11y/anchor-is-valid",
    files: [
      "src/components/job-positions/JobModerationNotice.tsx", // 1
      "src/components/notifications/NotificationDropdown.tsx", // 1
      "src/pages/admin/OutreachCampaignsPage.tsx", // 1
      "src/pages/auth/ForgotPasswordPage.tsx", // 2
      "src/pages/auth/Login.tsx", // 2
      "src/pages/auth/RegistrationWizard.tsx", // 1
      "src/pages/auth/ResetPasswordPage.tsx", // 3
      "src/pages/auth/VerifyEmailPage.tsx", // 2
    ],
  },
  // jsx-a11y/alt-text — 9 finding(s) in 9 file(s)
  {
    rule: "jsx-a11y/alt-text",
    files: [
      "src/components/ai-ranking/CandidateScoreCard.tsx", // 1
      "src/components/ai-ranking/RankedCandidatesList.tsx", // 1
      "src/components/candidate/CandidateProfileHeader.tsx", // 1
      "src/components/careers/CompactJobCard.tsx", // 1
      "src/components/notifications/NotificationItem.tsx", // 1
      "src/pages/admin/AdminTasksPage.tsx", // 1
      "src/pages/careers/CareersPage.tsx", // 1
      "src/pages/companies/CompanyDetailPage.tsx", // 1
      "src/pages/notifications/NotificationsPage.tsx", // 1
    ],
  },
  // jsx-a11y/click-events-have-key-events — 3 finding(s) in 3 file(s)
  {
    rule: "jsx-a11y/click-events-have-key-events",
    files: [
      "src/components/notifications/NotificationDropdown.tsx", // 1
      "src/components/tables/cells/ActionsCell.test.tsx", // 1
      "src/pages/admin/OutreachCampaignsPage.tsx", // 1
    ],
  },
  // jsx-a11y/no-static-element-interactions — 3 finding(s) in 3 file(s)
  {
    rule: "jsx-a11y/no-static-element-interactions",
    files: [
      "src/components/notifications/NotificationDropdown.tsx", // 1
      "src/components/tables/cells/ActionsCell.test.tsx", // 1
      "src/pages/admin/OutreachCampaignsPage.tsx", // 1
    ],
  },
  // jsx-a11y/media-has-caption — 1 finding(s) in 1 file(s)
  {
    rule: "jsx-a11y/media-has-caption",
    files: [
      "src/pages/landing/LandingPage.tsx", // 1
    ],
  },
];

// 225 finding(s) in 80 file(s)
const I18N_LEGACY = [
  "src/components/candidate/CandidateActivityTimeline.tsx", // 1
  "src/components/connection-requests/ConnectionRequestsList.tsx", // 3
  "src/components/connection-requests/RequestToJoinDialog.tsx", // 2
  "src/components/contact/BookDemoDialog.tsx", // 3
  "src/components/dashboard/ApplicationListItem.tsx", // 1
  "src/components/dialogs/AddEmailDialog.tsx", // 1
  "src/components/dialogs/ApplicationDetailDialog.tsx", // 4
  "src/components/dialogs/CreateCandidateDialog.tsx", // 3
  "src/components/dialogs/CreateHiringProcessDialog.tsx", // 2
  "src/components/dialogs/CreateJobPositionDialog.tsx", // 7
  "src/components/dialogs/CreateUserDialog.tsx", // 3
  "src/components/dialogs/ManageStagesDialog.tsx", // 1
  "src/components/dialogs/ManualCandidateDialog.tsx", // 4
  "src/components/dialogs/UpdateCandidateDialog.tsx", // 2
  "src/components/dialogs/UpdateCompanyDialog.tsx", // 2
  "src/components/dialogs/UpdateHiringProcessDialog.tsx", // 1
  "src/components/dialogs/UpdateJobPositionDialog.tsx", // 1
  "src/components/dialogs/UpdateProfileDialog.tsx", // 8
  "src/components/dialogs/UpdateUserDialog.tsx", // 4
  "src/components/email-templates/EmailTemplateDialog.tsx", // 3
  "src/components/error/ErrorBoundary.tsx", // 1
  "src/components/files/FileUpload.tsx", // 8
  "src/components/hiring-processes/HiringProcessesGroupedList.tsx", // 1
  "src/components/job-positions/JobPositionsList.tsx", // 1
  "src/components/layout/DashboardLayout.tsx", // 1
  "src/components/navbar/Navbar.tsx", // 2
  "src/components/scorecard/ScorecardViewer.tsx", // 1
  "src/components/settings/AIConfigCard.tsx", // 1
  "src/components/stages/StageNoteButton.tsx", // 1
  "src/components/tables/TableRowActions.tsx", // 6
  "src/components/tables/cells/DateCell.tsx", // 1
  "src/components/team/InviteTeamMemberDialog.tsx", // 1
  "src/components/user/ProfilePictureUpload.tsx", // 1
  "src/layouts/AuthLayout.tsx", // 1
  "src/pages/TeamManagementPage.tsx", // 1
  "src/pages/admin/AdminTasksPage.tsx", // 1
  "src/pages/admin/CompanyHealthPage.tsx", // 1
  "src/pages/admin/CustomPlansPage.tsx", // 3
  "src/pages/admin/DemoBookingManagerPage.tsx", // 1
  "src/pages/admin/FeatureFlagsPage.tsx", // 3
  "src/pages/admin/GeneralSettingsPage.tsx", // 5
  "src/pages/admin/JobModerationPage.tsx", // 1
  "src/pages/admin/OutreachAnalyticsPage.tsx", // 1
  "src/pages/admin/OutreachCRMDetailPage.tsx", // 2
  "src/pages/admin/OutreachCampaignsPage.tsx", // 5
  "src/pages/admin/OutreachTemplatesPage.tsx", // 2
  "src/pages/admin/PipelineAnalyticsPage.tsx", // 1
  "src/pages/admin/PlanLimitsPage.tsx", // 3
  "src/pages/admin/RevenueDashboardPage.tsx", // 1
  "src/pages/admin/SystemSettingsPage.tsx", // 5
  "src/pages/admin/TrialTrackerPage.tsx", // 1
  "src/pages/admin/WebhooksPage.tsx", // 1
  "src/pages/admin/applications/ApplicationsPage.tsx", // 1
  "src/pages/applicant/onboarding-steps/PreferencesStep.tsx", // 2
  "src/pages/applicant/onboarding-steps/ProfileStep.tsx", // 7
  "src/pages/auth/ForgotPasswordPage.tsx", // 1
  "src/pages/auth/Login.tsx", // 2
  "src/pages/auth/OAuthSuccessPage.tsx", // 1
  "src/pages/auth/ResetPasswordPage.tsx", // 2
  "src/pages/auth/wizard-steps/AccountCreationStep.tsx", // 4
  "src/pages/auth/wizard-steps/RoleInfoStep.tsx", // 4
  "src/pages/candidates/CandidatesPage.tsx", // 1
  "src/pages/companies/CompaniesPage.tsx", // 1
  "src/pages/contact/ContactPage.tsx", // 5
  "src/pages/email-templates/EmailTemplatesPage.tsx", // 1
  "src/pages/hiring-processes/HiringProcessesPage.tsx", // 1
  "src/pages/hr/AnalyticsPage.tsx", // 1
  "src/pages/hr/HRDashboard.tsx", // 1
  "src/pages/hr/company-profile/CompanyProfilePage.tsx", // 15
  "src/pages/hr/interviews/InterviewsPage.tsx", // 2
  "src/pages/job-positions/JobPositionsPage.tsx", // 4
  "src/pages/landing/LandingPage.tsx", // 2
  "src/pages/onboarding/HROnboardingWizard.tsx", // 5
  "src/pages/onboarding/wizard-steps/CompanySetupStep.tsx", // 3
  "src/pages/profile/ProfilePage.tsx", // 7
  "src/pages/public/HiringProcessTrackingPage.tsx", // 3
  "src/pages/settings/ApiKeysPage.tsx", // 15
  "src/pages/settings/CalendarSettingsPage.tsx", // 2
  "src/pages/test/ErrorBoundaryTest.tsx", // 10
  "src/pages/users/UserManagementPage.tsx", // 1
];
export default tseslint.config(
  { ignores: ["dist"] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],
    },
  },

  // ── Analytics seam ───────────────────────────────────────────────────────
  // `src/analytics/` is the ONLY place allowed to touch the vendor SDK. Every
  // other module imports `track` / `identify` / `reset` from the seam, so the
  // app keeps working (as a no-op) when no PostHog key is configured, and so
  // swapping vendors is a one-directory change.
  //
  // This was previously a convention held up by code review and doc comments
  // alone, and it held — there is exactly one importer today, so this rule adds
  // zero findings. It exists to keep that true: a direct `posthog-js` import
  // added by a later change is now a CI failure rather than a silent leak.
  {
    files: ["**/*.{ts,tsx}"],
    ignores: ["src/analytics/**"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "posthog-js",
              message:
                "Import the analytics seam instead: `import { track } from '@/analytics'` (see src/analytics/index.ts). Only src/analytics/ may import posthog-js directly.",
            },
          ],
          patterns: [
            {
              group: ["posthog-js/*"],
              message:
                "Import the analytics seam instead (see src/analytics/index.ts). Only src/analytics/ may import posthog-js directly.",
            },
          ],
        },
      ],
    },
  },

  // ── Accessibility ────────────────────────────────────────────────────────
  // jsx-a11y's `recommended` set, unmodified, at its own severities (error).
  {
    files: ["**/*.tsx"],
    ...jsxA11y.flatConfigs.recommended,
    settings: {
      // jsx-a11y reasons about DOM elements. Nearly every control in this app is
      // a MUI component, so without this map the plugin sees an unknown tag and
      // stays silent — which is why an "a11y clean" report meant nothing before.
      "jsx-a11y": {
        components: {
          Button: "button",
          IconButton: "button",
          LoadingButton: "button",
          Fab: "button",
          Link: "a",
          TextField: "input",
          Checkbox: "input",
          Switch: "input",
          Radio: "input",
          Avatar: "img",
          CardMedia: "img",
        },
      },
    },
  },
  {
    files: ["**/*.tsx"],
    rules: {
      // Ships OFF in jsx-a11y's recommended set; both are switched ON here and
      // both are at zero violations today, so they cost nothing and can only
      // prevent regressions.
      //
      // control-has-associated-label: 0 violations — but read this before
      // trusting that zero. The rule assumes any child that is an unknown
      // component might itself render the label, so `<IconButton><DeleteIcon /></IconButton>`
      // is NOT reported, while `<IconButton />` and `<IconButton><span /></IconButton>`
      // are. Nameless MUI icon buttons — the single most common a11y defect in
      // this codebase — therefore slip past it. This rule is worth having, but
      // it is not the control that catches them; nothing here is. See the report
      // note about auditing icon buttons for `aria-label` by hand.
      "jsx-a11y/control-has-associated-label": "error",
      "jsx-a11y/no-noninteractive-element-interactions": "error",
    },
  },

  // ── i18n ─────────────────────────────────────────────────────────────────
  {
    files: ["**/*.tsx"],
    plugins: { i18next },
    rules: {
      // Scoped deliberately. The default (`mode: 'all'`) flags every string
      // literal anywhere in the file — import paths, object keys, MUI `variant`
      // and `color` values, test ids — which produces thousands of findings that
      // have nothing to do with translation, and a rule nobody can read is a
      // rule that gets deleted.
      //
      // `mode: 'jsx-only'` narrows it to JSX. The explicit `jsx-attributes.include`
      // list narrows it further to the props that actually render human-readable
      // text, so `variant="contained"` is ignored while `aria-label="Delete"` is
      // not — which also makes this rule the thing that catches unlabelled
      // controls being labelled in English rather than through `t()`.
      "i18next/no-literal-string": [
        "error",
        {
          mode: "jsx-only",
          "jsx-attributes": {
            include: [
              "label",
              "aria-label",
              "placeholder",
              "title",
              "alt",
              "helperText",
              "header",
              "tooltip",
            ],
          },
        },
      ],
    },
  },
  {
    // Not debt. Test files assert against literal English on purpose; running
    // their fixtures through `t()` would test the translation layer instead of
    // the component. 47 findings across 6 files, permanently exempt.
    files: ["**/*.test.tsx", "src/test/**/*.tsx", "src/__tests__/**/*.tsx"],
    rules: { "i18next/no-literal-string": "off" },
  },

  // ── Legacy debt exemptions (see the note at the top of this file) ─────────
  ...A11Y_LEGACY.map(({ rule, files }) => ({
    files,
    rules: { [rule]: "off" },
  })),
  {
    files: I18N_LEGACY,
    rules: { "i18next/no-literal-string": "off" },
  },
);
