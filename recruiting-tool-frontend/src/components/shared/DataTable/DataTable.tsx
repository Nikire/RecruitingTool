import {
  Box,
  Paper,
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
import { ReactNode } from "react";

/**
 * Column configuration for DataTable<T>
 */
export interface DataTableColumn<T> extends GridColDef {
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
}

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
   * i18n key for empty state message
   * @example "candidates.no_candidates"
   */
  emptyMessage: string;
  /**
   * i18n key for error message
   * @default "errors.fetch_failed"
   */
  errorMessage?: string;
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
              const value = (item as Record<string, unknown>)[
                col.field as string
              ];
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
 * interface Candidate {
 *   uid: string;
 *   name: string;
 *   email: string;
 * }
 *
 * const columns: DataTableColumn<Candidate>[] = [
 *   {
 *     field: "name",
 *     headerName: t("candidates.name_label"),
 *     flex: 1,
 *     mobileRender: (candidate) => (
 *       <Typography variant="h6">{candidate.name}</Typography>
 *     ),
 *   },
 * ];
 *
 * <DataTable
 *   data={candidates}
 *   columns={columns}
 *   getRowId={(row) => row.uid}
 *   emptyMessage="candidates.no_candidates"
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
  dataGridProps = {},
}: DataTableProps<T>) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const showMobile = enableMobileView && isMobile;

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
        <Paper sx={{ p: { xs: 2, sm: 4 }, textAlign: "center" }}>
          <Typography variant="body1" color="textSecondary">
            {t(emptyMessage)}
          </Typography>
        </Paper>
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

  // Desktop view with DataGrid
  return (
    <Box sx={{ height, width: "100%" }}>
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
          noRowsLabel: t(emptyMessage),
        }}
        {...dataGridProps}
      />
    </Box>
  );
};

export default DataTable;
