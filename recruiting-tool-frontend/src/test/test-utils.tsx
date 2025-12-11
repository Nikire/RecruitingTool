import { render, RenderOptions } from "@testing-library/react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { I18nextProvider } from "react-i18next";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import i18n from "i18next";
import { ReactElement } from "react";

// Initialize i18n for tests
if (!i18n.isInitialized) {
  i18n.init({
    lng: "en",
    fallbackLng: "en",
    interpolation: {
      escapeValue: false,
    },
    resources: {
      en: {
        translation: {
          common: {
            select: "Select",
            loading: "Loading...",
            cancel: "Cancel",
            delete: "Delete",
            deleting: "Deleting...",
            save: "Save",
            edit: "Edit",
            create: "Create",
            update: "Update",
            submit: "Submit",
            actions: "Actions",
            search: "Search",
            filter: "Filter",
            reset: "Reset",
            apply: "Apply",
            close: "Close",
            confirm: "Confirm",
            view: "View",
            yes: "Yes",
            no: "No",
          },
          dialogs: {
            delete_confirmation: "Delete Confirmation",
            delete_message: "Are you sure you want to delete this item?",
            action_irreversible: "This action cannot be undone.",
          },
          aria: {
            search: "Search",
            status: "Status",
            warning_icon: "Warning",
            cancel: "Cancel",
            loading: "Loading",
            pagination_navigation: "Pagination navigation",
            pagination_controls: "Pagination controls",
          },
          pagination: {
            showing: "Showing {{start}} to {{end}} of {{total}} items",
            items_per_page: "Items per page",
            items: "Items",
          },
          search: {
            status: "Status",
            skills: "Skills",
            location: "Location",
            experience: "Experience",
            salary: "Salary",
            date_range: "Date Range",
            start_date: "Start Date",
            end_date: "End Date",
            skills_placeholder: "Add skills",
            skills_helper: "Type and press enter to add skills",
            location_placeholder: "Enter location",
            experience_years: "{{min}} - {{max}} years",
            salary_range: "${{min}} - ${{max}}",
            reset_filters: "Reset Filters",
            apply_filters: "Apply Filters",
          },
          applications: {
            applicant_name: "Applicant Name",
            email: "Email",
            phone: "Phone",
            job_position: "Job Position",
            status: "Status",
            applied_date: "Applied Date",
          },
          candidates: {
            title: "Candidates",
            create_candidate: "Create Candidate",
            no_candidates: "No candidates found",
            name: "Name",
            email: "Email",
            phone: "Phone",
            status: "Status",
          },
          jobPositions: {
            title: "Job Positions",
            create_position: "Create Position",
            no_positions: "No job positions found",
            job_title: "Job Title",
            department: "Department",
            status: "Status",
          },
          dashboard: {
            title: "Dashboard",
            welcome: "Welcome",
            total_candidates: "Total Candidates",
            active_candidates: "Active Candidates",
            total_job_positions: "Total Job Positions",
            open_positions: "Open Positions",
            total_applications: "Total Applications",
            pending_applications: "Pending Applications",
            hiring_processes: "Hiring Processes",
            active_processes: "Active Processes",
          },
          errors: {
            loading_failed: "Failed to load data",
            network_error: "Network error occurred",
          },
        },
      },
    },
  });
}

/**
 * Create a new QueryClient for each test to avoid cache pollution
 */
export const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  });

interface AllTheProvidersProps {
  children: React.ReactNode;
  queryClient?: QueryClient;
}

/**
 * Wrapper component with all necessary providers for testing
 */
export function AllTheProviders({
  children,
  queryClient,
}: AllTheProvidersProps) {
  const theme = createTheme();
  const testQueryClient = queryClient || createTestQueryClient();

  return (
    <QueryClientProvider client={testQueryClient}>
      <ThemeProvider theme={theme}>
        <I18nextProvider i18n={i18n}>{children}</I18nextProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

/**
 * Custom render function that includes all necessary providers
 */
export function renderWithProviders(
  ui: ReactElement,
  options?: Omit<RenderOptions, "wrapper"> & { queryClient?: QueryClient },
) {
  const { queryClient, ...renderOptions } = options || {};

  return render(ui, {
    wrapper: ({ children }) => (
      <AllTheProviders queryClient={queryClient}>{children}</AllTheProviders>
    ),
    ...renderOptions,
  });
}

// Re-export everything from React Testing Library
export * from "@testing-library/react";
export { default as userEvent } from "@testing-library/user-event";
