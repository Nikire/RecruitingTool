import { lazy, Suspense, type ReactElement } from "react";
import { Navigate, Route, Routes, useParams } from "react-router-dom";
import { extractJobUid } from "./pages/careers/careersUrls";

/* -------------------------------------------------------------------------- */
/* EAGER ROUTES                                                               */
/* -------------------------------------------------------------------------- */
/*
 * Only the surfaces that cold, unauthenticated traffic lands on first are
 * statically imported. Everything else is `React.lazy`, so a visitor reading
 * the marketing page no longer downloads the admin panel, the DataGrid, the
 * charting library and the markdown pipeline before the hero paints.
 *
 * Anything added here lands in the entry chunk and is `modulepreload`ed on
 * EVERY route — check what the page transitively imports before promoting a
 * route out of the lazy list below.
 */
import Login from "./pages/auth/Login";
import RegistrationWizard from "./pages/auth/RegistrationWizard";
import Logout from "./pages/auth/Logout";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";
import ResetPasswordPage from "./pages/auth/ResetPasswordPage";
import VerifyEmailPage from "./pages/auth/VerifyEmailPage";
import LandingPage from "./pages/landing/LandingPage";
import CareersPage from "./pages/careers/CareersPage";
import TermsOfServicePage from "./pages/legal/TermsOfServicePage";
import PrivacyPolicyPage from "./pages/legal/PrivacyPolicyPage";
import SecurityPolicyPage from "./pages/legal/SecurityPolicyPage";
import ContactPage from "./pages/contact/ContactPage";
import NotFoundPage from "./pages/errors/NotFoundPage";

// Layouts and guards render on the first paint of every route, so they stay eager.
import { ProtectedRoute } from "./lib/ProtectedRoute/ProtectedRoute";
import { RoleGuard } from "./lib/RoleGuard";
import { UserRoles } from "./types/user.types";
import MainLayout from "./layouts/MainLayout";
import AuthLayout from "./layouts/AuthLayout";
import LandingPageLayout from "./layouts/LandingPageLayout";

import { Toaster } from "react-hot-toast";
import { ScrollToTop } from "./components/common/ScrollToTop";
import CenteredLoadingSpinner from "./components/common/CenteredLoadingSpinner";
import Auth0CallbackHandler from "./components/auth/Auth0CallbackHandler";
import { useAuthMe } from "./hooks/api/useAuth";
import { usePageView } from "./analytics";

/* -------------------------------------------------------------------------- */
/* LAZY ROUTES                                                                */
/* -------------------------------------------------------------------------- */

// Layouts that only ever wrap authenticated / secondary surfaces.
const DocumentContainer = lazy(() => import("./layouts/DocumentContainer"));
const AdminLayout = lazy(() => import("./layouts/AdminLayout"));
const HRLayout = lazy(() => import("./layouts/HRLayout"));

// Public-but-secondary pages.
const HiringProcessTrackingPage = lazy(
  () => import("./pages/public/HiringProcessTrackingPage"),
);
const UnsubscribePage = lazy(() => import("./pages/public/UnsubscribePage"));
const CheckStatusPage = lazy(() => import("./pages/status/CheckStatusPage"));
const OAuthSuccessPage = lazy(() => import("./pages/auth/OAuthSuccessPage"));
const BookInterviewPage = lazy(
  () => import("./pages/booking/BookInterviewPage"),
);
const BookingConfirmedPage = lazy(
  () => import("./pages/booking/BookingConfirmedPage"),
);
const BookDemoPage = lazy(() => import("./pages/booking/BookDemoPage"));
const BookingDemoConfirmedPage = lazy(
  () => import("./pages/booking/BookingDemoConfirmedPage"),
);
const AsyncStageSubmissionPage = lazy(
  () => import("./pages/async-stage/AsyncStageSubmissionPage"),
);
/*
 * `/careers/:uid` is an SEO surface, but it statically imports `react-markdown`
 * (the ~1.1 MB `vendor-markdown` chunk). Keeping it eager would preload that
 * pipeline on the landing page too, which costs far more LCP than the single
 * extra request this page now pays for its own chunk.
 */
const JobPositionDetailPage = lazy(
  () => import("./pages/job-position-detail/JobPositionDetailPage"),
);
/*
 * Public SEO surfaces built on top of the careers board. They all import
 * `CareersBoard`, which `CareersPage` already pulls into the entry chunk, so
 * these only add their own thin page shells.
 */
const CompanyCareersPage = lazy(
  () => import("./pages/careers/CompanyCareersPage"),
);
const FacetedJobsPage = lazy(() => import("./pages/careers/FacetedJobsPage"));
const LegacyJobRedirect = lazy(
  () => import("./pages/careers/LegacyJobRedirect"),
);
/*
 * The blog inlines every article's Markdown at build time and renders it with
 * `react-markdown`, so it shares the heavy `vendor-markdown` chunk with the job
 * detail page. Lazy for the same reason that page is.
 */
const BlogIndexPage = lazy(() => import("./pages/blog/BlogIndexPage"));
const BlogPostPage = lazy(() => import("./pages/blog/BlogPostPage"));

// Authenticated shell.
const PendingEmailVerificationPage = lazy(
  () => import("./pages/auth/PendingEmailVerificationPage"),
);
const HiringProcessPage = lazy(
  () => import("./pages/hiring-process/HiringProcessPage"),
);
const OnboardingWizard = lazy(
  () => import("./pages/onboarding/OnboardingWizard"),
);
const HROnboardingWizard = lazy(
  () => import("./pages/onboarding/HROnboardingWizard"),
);
const ApplicantOnboarding = lazy(
  () => import("./pages/applicant/ApplicantOnboarding"),
);
const ProfilePage = lazy(() => import("./pages/profile/ProfilePage"));
const SubscriptionPage = lazy(() => import("./pages/profile/SubscriptionPage"));
const NotificationsPage = lazy(
  () => import("./pages/notifications/NotificationsPage"),
);
const NotificationPreferencesPage = lazy(
  () => import("./pages/settings/NotificationPreferencesPage"),
);
const AcceptInvitationPage = lazy(
  () => import("./pages/invitations/AcceptInvitationPage"),
);

// HR panel.
const HRDashboard = lazy(() => import("./pages/hr/HRDashboard"));
const ApplicationsPage = lazy(
  () => import("./pages/admin/applications/ApplicationsPage"),
);
const CandidatesPage = lazy(() => import("./pages/candidates/CandidatesPage"));
const CandidateDetailPage = lazy(
  () => import("./pages/candidates/CandidateDetailPage"),
);
const JobPositionsPage = lazy(
  () => import("./pages/job-positions/JobPositionsPage"),
);
const HRJobPositionDetailPage = lazy(
  () => import("./pages/hr/job-position-detail/HRJobPositionDetailPage"),
);
const HiringProcessesPage = lazy(
  () => import("./pages/hiring-processes/HiringProcessesPage"),
);
const AnalyticsPage = lazy(() => import("./pages/hr/AnalyticsPage"));
const EmailTemplatesPage = lazy(
  () => import("./pages/email-templates/EmailTemplatesPage"),
);
const CalendarSettingsPage = lazy(
  () => import("./pages/settings/CalendarSettingsPage"),
);
const ApiKeysPage = lazy(() => import("./pages/settings/ApiKeysPage"));
const CompanyCalendarPage = lazy(
  () => import("./pages/calendar/CompanyCalendarPage"),
);
const InterviewsPage = lazy(
  () => import("./pages/hr/interviews/InterviewsPage"),
);
const FilesPage = lazy(() => import("./pages/files/FilesPage"));
const HRGuidePage = lazy(() => import("./pages/hr/HRGuidePage"));
const TeamManagementPage = lazy(() => import("./pages/TeamManagementPage"));
const BillingPage = lazy(() => import("./pages/billing/BillingPage"));
const CompanyProfilePage = lazy(
  () => import("./pages/hr/company-profile/CompanyProfilePage"),
);

// Admin panel.
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const CompaniesPage = lazy(() =>
  import("./pages/companies/CompaniesPage").then((m) => ({
    default: m.CompaniesPage,
  })),
);
const CompanyDetailPage = lazy(
  () => import("./pages/companies/CompanyDetailPage"),
);
const UserManagementPage = lazy(
  () => import("./pages/users/UserManagementPage"),
);
const AdminSubscriptionsPage = lazy(
  () => import("./pages/admin/AdminSubscriptionsPage"),
);
const DeletedRecordsPage = lazy(
  () => import("./pages/admin/DeletedRecordsPage"),
);
const SystemSettingsPage = lazy(
  () => import("./pages/admin/SystemSettingsPage"),
);
const ContactMessagesPage = lazy(
  () => import("./pages/admin/ContactMessagesPage"),
);
const PlanLimitsPage = lazy(() => import("./pages/admin/PlanLimitsPage"));
const FeatureFlagsPage = lazy(() => import("./pages/admin/FeatureFlagsPage"));
const GeneralSettingsPage = lazy(
  () => import("./pages/admin/GeneralSettingsPage"),
);
const WebhooksPage = lazy(() => import("./pages/admin/WebhooksPage"));
const CustomPlansPage = lazy(() => import("./pages/admin/CustomPlansPage"));
const AIQuotaPage = lazy(() => import("./pages/admin/AIQuotaPage"));
const DocsPage = lazy(() => import("./pages/admin/DocsPage"));
const OutreachTemplatesPage = lazy(
  () => import("./pages/admin/OutreachTemplatesPage"),
);
const OutreachCRMPage = lazy(() => import("./pages/admin/OutreachCRMPage"));
const OutreachCRMDetailPage = lazy(
  () => import("./pages/admin/OutreachCRMDetailPage"),
);
const OutreachAnalyticsPage = lazy(
  () => import("./pages/admin/OutreachAnalyticsPage"),
);
const AdminEmailLogsPage = lazy(
  () => import("./pages/admin/AdminEmailLogsPage"),
);
const PipelineAnalyticsPage = lazy(
  () => import("./pages/admin/PipelineAnalyticsPage"),
);
const RevenueDashboardPage = lazy(
  () => import("./pages/admin/RevenueDashboardPage"),
);
const QuotaInspectorPage = lazy(
  () => import("./pages/admin/QuotaInspectorPage"),
);
const CompanyHealthPage = lazy(() => import("./pages/admin/CompanyHealthPage"));
const TrialTrackerPage = lazy(() => import("./pages/admin/TrialTrackerPage"));
const DemoBookingManagerPage = lazy(
  () => import("./pages/admin/DemoBookingManagerPage"),
);
const EmailDeliverabilityPage = lazy(
  () => import("./pages/admin/EmailDeliverabilityPage"),
);
const ChangelogPage = lazy(() => import("./pages/admin/ChangelogPage"));
const AdminTasksPage = lazy(() => import("./pages/admin/AdminTasksPage"));
const OutreachCampaignsPage = lazy(
  () => import("./pages/admin/OutreachCampaignsPage"),
);
const JobModerationPage = lazy(() => import("./pages/admin/JobModerationPage"));

// Development-only.
const ErrorBoundaryTest = lazy(() => import("./pages/test/ErrorBoundaryTest"));

/**
 * Suspense fallback for a lazily loaded route.
 *
 * A `null` fallback would collapse the content area to zero height and shift
 * the whole layout for the duration of the chunk request, so the project's
 * standard centred spinner is used instead.
 */
const RouteFallback = () => <CenteredLoadingSpinner minHeight="60vh" />;

/**
 * Wraps a route element in its OWN Suspense boundary.
 *
 * Wrapping each element individually (rather than putting one boundary above
 * `<Routes>`) means the nearest boundary to a suspending page is inside the
 * layout, so navigating between two lazy pages keeps the navbar/sidebar mounted
 * and only swaps the content area.
 */
const withSuspense = (element: ReactElement): ReactElement => (
  <Suspense fallback={<RouteFallback />}>{element}</Suspense>
);

const HR_ROLES = [
  UserRoles.HR,
  UserRoles.HR_MANAGER,
  UserRoles.RECRUITER,
  UserRoles.COMPANY_OWNER,
  UserRoles.COMPANY_ADMIN,
  UserRoles.ADMIN,
  UserRoles.SUPER_ADMIN,
];

/**
 * Splits the two-segment `/jobs/:a/:b` space between its two pages.
 *
 * `/jobs/acme-corp/senior-react-engineer-<uid>` is a job posting; the UID at the
 * tail of the second segment is the only load-bearing part of the path, and its
 * presence is also what distinguishes the URL from a facet index such as
 * `/jobs/engineering/colombia`. React Router cannot rank two identically shaped
 * paths, so the discrimination happens here rather than in the route table.
 */
const JobsTwoSegmentRoute = () => {
  const { companySlug, jobSlug } = useParams<{
    companySlug: string;
    jobSlug: string;
  }>();

  if (extractJobUid(jobSlug)) {
    return withSuspense(<JobPositionDetailPage />);
  }

  return withSuspense(
    <FacetedJobsPage facetSlug={companySlug} secondFacetSlug={jobSlug} />,
  );
};

const HiringProcessRoute = () => {
  const token = localStorage.getItem("authToken");
  const { user, isLoading } = useAuthMe();

  // While resolving auth with a token, avoid a flash to the wrong view
  if (token && isLoading) return null;

  // HR / company staff → full HR management view
  if (user && HR_ROLES.some((role) => user.roles?.includes(role))) {
    return withSuspense(<HiringProcessPage />);
  }

  // Candidate with account or unauthenticated → tracking page
  // (tracking page handles email-match bypass and code lock internally)
  return withSuspense(<HiringProcessTrackingPage />);
};

function App() {
  // Fires a PostHog `$pageview` on every SPA navigation. Must live inside the
  // router (it reads `useLocation`), hence here rather than in `main.tsx`.
  usePageView();

  return (
    <>
      <Toaster />
      <ScrollToTop />
      {/* Exchanges Auth0 token for a local JWT after social login */}
      <Auth0CallbackHandler />
      <Routes>
        {/* Landing Page - Marketing Page (root) */}
        <Route element={<LandingPageLayout />}>
          <Route index element={<LandingPage />} />
        </Route>

        {/* Test Routes - Development Only */}
        {import.meta.env.DEV && (
          <Route element={<MainLayout />}>
            <Route
              path="/test/error-boundary"
              element={withSuspense(<ErrorBoundaryTest />)}
            />
          </Route>
        )}

        {/* Auth Layout - navless, scroll-free, redirects authenticated users */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<RegistrationWizard />} />
          <Route path="/logout" element={<Logout />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/verify-email" element={<VerifyEmailPage />} />
        </Route>

        {/* Main Layout - for other public pages */}
        <Route element={<MainLayout />}>
          <Route path="/careers" element={<CareersPage />} />
          {/* Branded, linkable careers page for one company. */}
          <Route
            path="/careers/company/:companySlug"
            element={withSuspense(<CompanyCareersPage />)}
          />
          {/*
            Legacy job URL. Kept alive for links already in candidates' inboxes
            and already indexed; forwards to the canonical slugged URL.
          */}
          <Route
            path="/careers/:uid"
            element={withSuspense(<LegacyJobRedirect />)}
          />

          {/*
            Canonical job URLs and the faceted job indexes.
            `/jobs` itself is not a distinct page — the full board is /careers.
          */}
          <Route path="/jobs" element={<Navigate to="/careers" replace />} />
          <Route
            path="/jobs/:facetSlug"
            element={withSuspense(<FacetedJobsPage />)}
          />
          <Route
            path="/jobs/:companySlug/:jobSlug"
            element={<JobsTwoSegmentRoute />}
          />

          {/* Content marketing surface. */}
          <Route path="/blog" element={withSuspense(<BlogIndexPage />)} />
          <Route path="/blog/:slug" element={withSuspense(<BlogPostPage />)} />
          <Route
            path="/check-status"
            element={withSuspense(<CheckStatusPage />)}
          />
          <Route path="/contact" element={<ContactPage />} />
          <Route
            path="/book-interview/:token"
            element={withSuspense(<BookInterviewPage />)}
          />
          <Route
            path="/booking-confirmed/:token"
            element={withSuspense(<BookingConfirmedPage />)}
          />
          <Route
            path="/unsubscribe/:token"
            element={withSuspense(<UnsubscribePage />)}
          />
          <Route
            path="/book-demo/:token"
            element={withSuspense(<BookDemoPage />)}
          />
          <Route
            path="/submit/:token"
            element={withSuspense(<AsyncStageSubmissionPage />)}
          />
          <Route
            path="/booking-confirmed-demo/:token"
            element={withSuspense(<BookingDemoConfirmedPage />)}
          />

          {/* OAuth popup close page */}
          <Route
            path="/oauth/success"
            element={withSuspense(<OAuthSuccessPage />)}
          />

          {/* Legal Pages */}
          <Route path="/terms" element={<TermsOfServicePage />} />
          <Route path="/privacy" element={<PrivacyPolicyPage />} />
          <Route path="/security" element={<SecurityPolicyPage />} />

          <Route element={withSuspense(<DocumentContainer />)}>
            <Route
              path="/hiring-process/:uid"
              element={<HiringProcessRoute />}
            />
          </Route>

          <Route element={<ProtectedRoute />}>
            {/* Email verification gate — accessible to logged-in but unverified users */}
            <Route
              path="/pending-email-verification"
              element={withSuspense(<PendingEmailVerificationPage />)}
            />
            <Route
              path="/onboarding"
              element={withSuspense(<OnboardingWizard />)}
            />
            <Route
              path="/onboarding/hr"
              element={withSuspense(<HROnboardingWizard />)}
            />
            <Route
              path="/applicant/onboarding"
              element={withSuspense(<ApplicantOnboarding />)}
            />
            <Route path="/profile" element={withSuspense(<ProfilePage />)} />
            <Route
              path="/profile/subscription"
              element={withSuspense(<SubscriptionPage />)}
            />
            <Route
              path="/notifications"
              element={withSuspense(<NotificationsPage />)}
            />
            <Route
              path="/settings/notifications"
              element={withSuspense(<NotificationPreferencesPage />)}
            />
            <Route
              path="/invitations/accept/:token"
              element={withSuspense(<AcceptInvitationPage />)}
            />
          </Route>

          {/*
            Catch-all 404. nginx rewrites unknown paths to index.html, so
            without this every typo and dead inbound link rendered an empty
            page with HTTP 200 — a soft 404 across an unbounded URL space.
            Lives inside MainLayout so the visitor keeps the navbar; the page
            itself emits `noindex, nofollow`.
          */}
          <Route path="*" element={<NotFoundPage />} />
        </Route>

        {/* HR Panel Routes - accessible to HR, HR_MANAGER, RECRUITER, COMPANY_OWNER, COMPANY_ADMIN, ADMIN, and SUPER_ADMIN */}
        <Route element={<ProtectedRoute />}>
          <Route
            element={
              <RoleGuard
                allowedRoles={[
                  UserRoles.HR,
                  UserRoles.HR_MANAGER,
                  UserRoles.RECRUITER,
                  UserRoles.COMPANY_OWNER,
                  UserRoles.COMPANY_ADMIN,
                  UserRoles.ADMIN,
                  UserRoles.SUPER_ADMIN,
                ]}
                showUnauthorized={true}
              />
            }
          >
            <Route element={withSuspense(<HRLayout />)}>
              <Route
                path="/hr/dashboard"
                element={withSuspense(<HRDashboard />)}
              />
              <Route
                path="/hr/applications"
                element={withSuspense(<ApplicationsPage />)}
              />
              <Route
                path="/hr/candidates"
                element={withSuspense(<CandidatesPage />)}
              />
              <Route
                path="/hr/candidates/:uid"
                element={withSuspense(<CandidateDetailPage />)}
              />
              <Route
                path="/hr/job-positions"
                element={withSuspense(<JobPositionsPage />)}
              />
              <Route
                path="/hr/job-positions/:uid"
                element={withSuspense(<HRJobPositionDetailPage />)}
              />
              <Route
                path="/hr/hiring-processes"
                element={withSuspense(<HiringProcessesPage />)}
              />
              <Route
                path="/hr/analytics"
                element={withSuspense(<AnalyticsPage />)}
              />
              <Route
                path="/hr/email-templates"
                element={withSuspense(<EmailTemplatesPage />)}
              />
              <Route
                path="/settings/calendar"
                element={withSuspense(<CalendarSettingsPage />)}
              />
              <Route
                path="/settings/api-keys"
                element={withSuspense(<ApiKeysPage />)}
              />
              <Route
                path="/hr/calendar"
                element={withSuspense(<CompanyCalendarPage />)}
              />
              <Route
                path="/hr/interviews"
                element={withSuspense(<InterviewsPage />)}
              />
              <Route path="/hr/files" element={withSuspense(<FilesPage />)} />
              <Route path="/hr/guide" element={withSuspense(<HRGuidePage />)} />
            </Route>
          </Route>

          {/* Team Management - Only for HR_MANAGER and above */}
          <Route
            element={
              <RoleGuard
                allowedRoles={[
                  UserRoles.HR_MANAGER,
                  UserRoles.COMPANY_OWNER,
                  UserRoles.COMPANY_ADMIN,
                  UserRoles.ADMIN,
                  UserRoles.SUPER_ADMIN,
                ]}
                showUnauthorized={true}
              />
            }
          >
            <Route element={withSuspense(<HRLayout />)}>
              <Route
                path="/settings/team"
                element={withSuspense(<TeamManagementPage />)}
              />
            </Route>
          </Route>
        </Route>

        {/* Billing Route - accessible to COMPANY_OWNER only */}
        <Route element={<ProtectedRoute />}>
          <Route
            element={<RoleGuard allowedRoles={[UserRoles.COMPANY_OWNER]} />}
          >
            <Route element={withSuspense(<HRLayout />)}>
              <Route
                path="/hr/billing"
                element={withSuspense(<BillingPage />)}
              />
            </Route>
          </Route>
        </Route>

        {/* Company Profile Route - accessible to COMPANY_OWNER and COMPANY_ADMIN */}
        <Route element={<ProtectedRoute />}>
          <Route
            element={
              <RoleGuard
                allowedRoles={[
                  UserRoles.COMPANY_OWNER,
                  UserRoles.COMPANY_ADMIN,
                  UserRoles.HR,
                  UserRoles.HR_MANAGER,
                  UserRoles.RECRUITER,
                  UserRoles.ADMIN,
                  UserRoles.SUPER_ADMIN,
                ]}
                showUnauthorized={true}
              />
            }
          >
            <Route element={withSuspense(<HRLayout />)}>
              <Route
                path="/hr/settings/company"
                element={withSuspense(<CompanyProfilePage />)}
              />
            </Route>
          </Route>
        </Route>

        {/* Admin Panel Routes - accessible to ADMIN and SUPER_ADMIN only */}
        <Route element={<ProtectedRoute />}>
          <Route
            element={
              <RoleGuard
                allowedRoles={[UserRoles.ADMIN, UserRoles.SUPER_ADMIN]}
              />
            }
          >
            <Route element={withSuspense(<AdminLayout />)}>
              <Route path="/admin" element={withSuspense(<AdminDashboard />)} />
              <Route
                path="/admin/companies"
                element={withSuspense(<CompaniesPage />)}
              />
              <Route
                path="/admin/companies/:uid"
                element={withSuspense(<CompanyDetailPage />)}
              />
              <Route
                path="/admin/users"
                element={withSuspense(<UserManagementPage />)}
              />
              <Route
                path="/admin/subscriptions"
                element={withSuspense(<AdminSubscriptionsPage />)}
              />
              <Route
                path="/admin/deleted-records"
                element={withSuspense(<DeletedRecordsPage />)}
              />
              <Route
                path="/admin/settings"
                element={withSuspense(<SystemSettingsPage />)}
              />
              <Route
                path="/admin/contact-messages"
                element={withSuspense(<ContactMessagesPage />)}
              />
              <Route
                path="/admin/plan-limits"
                element={withSuspense(<PlanLimitsPage />)}
              />
              <Route
                path="/admin/feature-flags"
                element={withSuspense(<FeatureFlagsPage />)}
              />
              <Route
                path="/admin/general-settings"
                element={withSuspense(<GeneralSettingsPage />)}
              />
              <Route
                path="/admin/webhooks"
                element={withSuspense(<WebhooksPage />)}
              />
              <Route
                path="/admin/custom-plans"
                element={withSuspense(<CustomPlansPage />)}
              />
              <Route
                path="/admin/ai-quota"
                element={withSuspense(<AIQuotaPage />)}
              />
              <Route path="/admin/docs" element={withSuspense(<DocsPage />)} />
              <Route
                path="/admin/outreach-templates"
                element={withSuspense(<OutreachTemplatesPage />)}
              />
              <Route
                path="/admin/outreach-crm"
                element={withSuspense(<OutreachCRMPage />)}
              />
              <Route
                path="/admin/outreach-crm/:uid"
                element={withSuspense(<OutreachCRMDetailPage />)}
              />
              <Route
                path="/admin/outreach-analytics"
                element={withSuspense(<OutreachAnalyticsPage />)}
              />
              <Route
                path="/admin/email-logs"
                element={withSuspense(<AdminEmailLogsPage />)}
              />
              <Route
                path="/admin/pipeline-analytics"
                element={withSuspense(<PipelineAnalyticsPage />)}
              />
              <Route
                path="/admin/revenue"
                element={withSuspense(<RevenueDashboardPage />)}
              />
              <Route
                path="/admin/quota-inspector"
                element={withSuspense(<QuotaInspectorPage />)}
              />
              <Route
                path="/admin/health"
                element={withSuspense(<CompanyHealthPage />)}
              />
              <Route
                path="/admin/trials"
                element={withSuspense(<TrialTrackerPage />)}
              />
              <Route
                path="/admin/demos"
                element={withSuspense(<DemoBookingManagerPage />)}
              />
              <Route
                path="/admin/email-deliverability"
                element={withSuspense(<EmailDeliverabilityPage />)}
              />
              <Route
                path="/admin/changelog"
                element={withSuspense(<ChangelogPage />)}
              />
              <Route
                path="/admin/tasks"
                element={withSuspense(<AdminTasksPage />)}
              />
              <Route
                path="/admin/outreach-campaigns"
                element={withSuspense(<OutreachCampaignsPage />)}
              />
              <Route
                path="/admin/job-moderation"
                element={withSuspense(<JobModerationPage />)}
              />
            </Route>
          </Route>
        </Route>
      </Routes>
    </>
  );
}

export default App;
