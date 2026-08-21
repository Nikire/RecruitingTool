import {
  Box,
  Typography,
  Card,
  CardContent,
  Skeleton,
  Stack,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { GridColDef, DataGridProps } from "@mui/x-data-grid";
import { useTranslation } from "react-i18next";
import { EnhancedDataGrid } from "../../tables";
import EmptyState, { EmptyStateAction } from "../../common/EmptyState";
import { ReactNode, useCallback, useMemo } from "react";

/**
 * Column configuration for DataTable<T>
 * Extends GridColDef with mobile card rendering support.
 */
export type DataTableColumn<T> = GridColDef & {
  /** Required field name - ensures each column has an identifier */
  field: string;
  /**
   * Mobile card renderer function
   * If provided, this field will be shown in mobile card view
   */
  mobileRender?: (item: T) => ReactNode;
  /**
   * Whether to show this column in mobile view
   * @default false (only fields with mobileRender are shown)
   */
  showInMobile?: boolean;
};

/**
 * Props for DataTable<T> component
 */
export interface DataTableProps<T> {
  /**
   * Array of data items to display
   */
  data: T[];
  /**
   * Column definitions (extends GridColDef with mobile support)
   */
  columns: DataTableColumn<T>[];
  /**
   * Function to extract unique identifier from each row
   */
  getRowId: (row: T) => string;
  /**
   * Loading state
   */
  loading?: boolean;
  /**
   * Error state
   */
  error?: boolean;
  /**
   * i18n key for empty state message.
   * Acts as the fallback headline when `emptyTitle` is not provided.
   * @example "candidates.no_candidates"
   */
  emptyMessage: string;
  /**
   * i18n key for error message
   * @default "errors.fetch_failed"
   */
  errorMessage?: string;
  /**
   * Icon shown in the empty state (defaults to an inbox icon)
   */
  emptyIcon?: ReactNode;
  /**
   * i18n key for the empty state headline when NO filter is active
   * ("you have nothing yet"). Falls back to `emptyMessage`.
   */
  emptyTitle?: string;
  /**
   * i18n key for the supporting sentence when NO filter is active
   */
  emptyDescription?: string;
  /**
   * Primary call-to-action that resolves the emptiness
   * ("Post your first job", "Invite your team").
   */
  emptyAction?: EmptyStateAction;
  /**
   * Whether the current list is narrowed by a search term / filter.
   * When true the empty state switches to the "your filter matched nothing"
   * copy, which is a completely different user situation from "you have
   * nothing yet" and needs a different CTA.
   * @default false
   */
  isFiltered?: boolean;
  /**
   * Icon shown in the filtered empty state
   */
  filteredEmptyIcon?: ReactNode;
  /**
   * i18n key for the empty state headline when a filter IS active
   * @default "empty.no_results"
   */
  filteredEmptyTitle?: string;
  /**
   * i18n key for the supporting sentence when a filter IS active
   */
  filteredEmptyDescription?: string;
  /**
   * CTA shown when a filter is active (usually "Clear filters")
   */
  filteredEmptyAction?: EmptyStateAction;
  /**
   * Unique key for onboarding state storage
   */
  onboardingKey: string;
  /**
   * Current page (1-indexed for server-side pagination)
   */
  page?: number;
  /**
   * Items per page
   */
  limit?: number;
  /**
   * Total number of rows (for server-side pagination)
   */
  totalRows?: number;
  /**
   * Callback when page changes
   */
  onPageChange?: (page: number) => void;
  /**
   * Callback when page size changes
   */
  onLimitChange?: (limit: number) => void;
  /**
   * Whether to use server-side pagination
   * @default false
   */
  serverPagination?: boolean;
  /**
   * Custom mobile card renderer
   * If provided, this will be used instead of auto-generated cards
   */
  renderMobileCard?: (item: T) => ReactNode;
  /**
   * Whether to show mobile card view on small screens
   * @default true
   */
  enableMobileView?: boolean;
  /**
   * Height of the DataGrid container
   * @default 600
   */
  height?: number | string;
  /**
   * Height of the DataGrid container while there are no rows.
   * Keeps a brand new account from staring at 600px of nothing.
   * @default 380
   */
  emptyHeight?: number | string;
  /**
   * Additional DataGrid props to pass through
   */
  dataGridProps?: Partial<DataGridProps>;
}

/**
 * Skeleton loader for mobile card view
 */
const MobileCardSkeleton = () => (
  <Card sx={{ mb: 2, p: 2 }}>
    <Stack spacing={1}>
      <Skeleton variant="text" width="70%" height={28} />
      <Skeleton variant="text" width="50%" height={20} />
      <Skeleton variant="text" width="60%" height={20} />
      <Box sx={{ display: "flex", gap: 1, mt: 2, justifyContent: "flex-end" }}>
        <Skeleton variant="circular" width={40} height={40} />
        <Skeleton variant="circular" width={40} height={40} />
      </Box>
    </Stack>
  </Card>
);

/**
 * Default mobile card view (auto-generated from columns)
 */
const DefaultMobileCard = <T,>({
  item,
  columns,
  getRowId,
}: {
  item: T;
  columns: DataTableColumn<T>[];
  getRowId: (row: T) => string;
}) => {
  return (
    <Card
      key={getRowId(item)}
      sx={{
        mb: 2,
        p: 2,
        transition: "all 0.2s ease-in-out",
        "&:hover": {
          boxShadow: 3,
          transform: "translateY(-2px)",
        },
      }}
    >
      <CardContent sx={{ p: 0, "&:last-child": { pb: 0 } }}>
        <Stack spacing={1}>
          {columns
            .filter((col) => col.mobileRender || col.showInMobile)
            .map((col, index) => {
              if (col.mobileRender) {
                return (
                  <Box key={`${col.field}-${index}`}>
                    {col.mobileRender(item)}
                  </Box>
                );
              }
              // Fallback: render field value as text
              const value = (item as Record<string, unknown>)[col.field];
              return (
                <Typography
                  key={`${col.field}-${index}`}
                  variant="body2"
                  color="textSecondary"
                >
                  {String(value || "-")}
                </Typography>
              );
            })}
        </Stack>
      </CardContent>
    </Card>
  );
};

/**
 * Generic DataTable component with desktop grid and mobile card views
 *
 * @example
 * ```tsx
 * <DataTable
 *   data={candidates}
 *   columns={columns}
 *   getRowId={(row) => row.uid}
 *   emptyMessage="candidates.no_candidates"
 *   emptyTitle="candidates.empty_title"
 *   emptyDescription="candidates.empty_description"
 *   emptyAction={{ label: "candidates.create", onClick: openCreateDialog }}
 *   isFiltered={Boolean(search)}
 *   filteredEmptyAction={{ label: "search.clear_filters", onClick: reset }}
 *   onboardingKey="candidates-list"
 * />
 * ```
 */
export const DataTable = <T,>({
  data,
  columns,
  getRowId,
  loading = false,
  error = false,
  emptyMessage,
  errorMessage = "errors.fetch_failed",
  emptyIcon,
  emptyTitle,
  emptyDescription,
  emptyAction,
  isFiltered = false,
  filteredEmptyIcon,
  filteredEmptyTitle,
  filteredEmptyDescription,
  filteredEmptyAction,
  onboardingKey,
  page,
  limit = 10,
  totalRows,
  onPageChange,
  onLimitChange,
  serverPagination = false,
  renderMobileCard,
  enableMobileView = true,
  height = 600,
  emptyHeight = 380,
  dataGridProps = {},
}: DataTableProps<T>) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const showMobile = enableMobileView && isMobile;

  const isEmpty = !loading && data.length === 0;

  /**
   * "You have nothing yet" and "your filter matched nothing" are two
   * completely different situations and need different copy and CTAs.
   */
  const emptyConfig = useMemo(() => {
    if (isFiltered) {
      return {
        icon: filteredEmptyIcon ?? emptyIcon,
        title: filteredEmptyTitle ?? "empty.no_results",
        description: filteredEmptyDescription,
        action: filteredEmptyAction,
      };
    }
    return {
      icon: emptyIcon,
      title: emptyTitle ?? emptyMessage,
      description: emptyDescription,
      action: emptyAction,
    };
  }, [
    isFiltered,
    emptyIcon,
    emptyTitle,
    emptyDescription,
    emptyAction,
    emptyMessage,
    filteredEmptyIcon,
    filteredEmptyTitle,
    filteredEmptyDescription,
    filteredEmptyAction,
  ]);

  const NoRowsOverlay = useCallback(
    () => (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
          width: "100%",
        }}
      >
        <EmptyState
          variant="plain"
          dense
          icon={emptyConfig.icon}
          message={emptyConfig.title}
          description={emptyConfig.description}
          action={emptyConfig.action}
        />
      </Box>
    ),
    [emptyConfig],
  );

  // Mobile loading state
  if (showMobile && loading && data.length === 0) {
    return (
      <Box sx={{ width: "100%" }}>
        {[1, 2, 3].map((i) => (
          <MobileCardSkeleton key={i} />
        ))}
      </Box>
    );
  }

  // Error state
  if (error && data.length === 0) {
    return (
      <Box sx={{ p: { xs: 2, sm: 4 } }}>
        <Typography
          color="error"
          sx={{ fontSize: { xs: "0.95rem", sm: "1rem" } }}
        >
          {t(errorMessage)}
        </Typography>
      </Box>
    );
  }

  // Mobile view with cards
  if (showMobile) {
    if (data.length === 0) {
      return (
        <EmptyState
          icon={emptyConfig.icon}
          message={emptyConfig.title}
          description={emptyConfig.description}
          action={emptyConfig.action}
        />
      );
    }

    return (
      <Box sx={{ width: "100%" }}>
        {data.map((item) =>
          renderMobileCard ? (
            renderMobileCard(item)
          ) : (
            <DefaultMobileCard
              key={getRowId(item)}
              item={item}
              columns={columns}
              getRowId={getRowId}
            />
          ),
        )}
      </Box>
    );
  }

  // `slots` from callers must be merged, not clobbered, so our noRowsOverlay
  // survives while a caller-supplied toolbar keeps working.
  const { slots: callerSlots, ...restGridProps } = dataGridProps;

  // Desktop view with DataGrid
  return (
    <Box sx={{ height: isEmpty ? emptyHeight : height, width: "100%" }}>
      <EnhancedDataGrid
        rows={data}
        columns={columns as GridColDef[]}
        loading={loading}
        getRowId={getRowId}
        rowCount={serverPagination ? totalRows : undefined}
        paginationMode={serverPagination ? "server" : "client"}
        paginationModel={
          serverPagination && page
            ? { page: page - 1, pageSize: limit }
            : undefined
        }
        onPaginationModelChange={
          serverPagination && onPageChange && onLimitChange
            ? (model) => {
                if (page && model.page !== page - 1) {
                  onPageChange(model.page + 1);
                }
                if (model.pageSize !== limit) {
                  onLimitChange(model.pageSize);
                }
              }
            : undefined
        }
        pageSizeOptions={[10, 25, 50, 100]}
        disableRowSelectionOnClick
        onboardingKey={onboardingKey}
        localeText={{
          noRowsLabel: t(emptyConfig.title),
        }}
        slots={{ noRowsOverlay: NoRowsOverlay, ...callerSlots }}
        {...restGridProps}
      />
    </Box>
  );
};

export default DataTable;
