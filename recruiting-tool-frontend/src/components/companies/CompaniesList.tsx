import {
  Box,
  Typography,
  Card,
  CardContent,
  Skeleton,
  Stack,
  Chip,
  IconButton,
  useMediaQuery,
  useTheme,
  Paper,
} from "@mui/material";
import { GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { useTranslation } from "react-i18next";
import { useListCompanies } from "../../hooks/api/useCompanies";
import { Company } from "../../types/company.types";
import { EnhancedDataGrid, ActionsCell } from "../tables";

interface CompaniesListProps {
  page: number;
  limit: number;
  search: string;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  onEdit: (company: Company) => void;
  onDelete: (company: Company) => void;
}

// Skeleton loader for loading state
const CompanyCardSkeleton = () => (
  <Card sx={{ mb: 2, p: 2 }}>
    <Stack spacing={1}>
      <Skeleton variant="text" width="70%" height={28} />
      <Skeleton variant="text" width="90%" height={20} />
      <Box sx={{ display: "flex", gap: 1, mt: 2 }}>
        <Skeleton variant="rectangular" width={80} height={32} />
        <Skeleton variant="rectangular" width={80} height={32} />
      </Box>
      <Box sx={{ display: "flex", gap: 1, mt: 2, justifyContent: "flex-end" }}>
        <Skeleton variant="circular" width={40} height={40} />
        <Skeleton variant="circular" width={40} height={40} />
      </Box>
    </Stack>
  </Card>
);

// Mobile card view component
const CompanyCardView: React.FC<{
  company: Company;
  onEdit: (company: Company) => void;
  onDelete: (company: Company) => void;
}> = ({ company, onEdit, onDelete }) => {
  const { t } = useTranslation();
  return (
    <Card
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
        <Typography
          variant="h6"
          sx={{ mb: 1, fontSize: { xs: "1.1rem", sm: "1.25rem" } }}
        >
          {company.name}
        </Typography>

        <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
          {company.description || "-"}
        </Typography>

        <Box sx={{ display: "flex", gap: 1, mb: 2, flexWrap: "wrap" }}>
          <Chip
            label={`${company.userCount || 0} ${t("users.title")}`}
            variant="outlined"
            size="small"
            sx={{ fontSize: "0.85rem" }}
          />
          <Chip
            label={`${company.jobPositionCount || 0} ${t("job_positions.title")}`}
            variant="outlined"
            size="small"
            sx={{ fontSize: "0.85rem" }}
          />
        </Box>

        <Box
          sx={{
            display: "flex",
            gap: 1,
            justifyContent: "flex-end",
            mt: 2,
          }}
        >
          <IconButton
            size="small"
            color="primary"
            onClick={() => onEdit(company)}
            aria-label={t("common.edit")}
            sx={{
              minHeight: 44,
              minWidth: 44,
            }}
          >
            <EditIcon />
          </IconButton>
          <IconButton
            size="small"
            color="error"
            onClick={() => onDelete(company)}
            aria-label={t("common.delete")}
            sx={{
              minHeight: 44,
              minWidth: 44,
            }}
          >
            <DeleteIcon />
          </IconButton>
        </Box>
      </CardContent>
    </Card>
  );
};

const CompaniesList: React.FC<CompaniesListProps> = ({
  page,
  limit,
  search,
  onPageChange,
  onLimitChange,
  onEdit,
  onDelete,
}) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { data, isLoading } = useListCompanies({
    page,
    limit,
    search,
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  const companies = data?.data || [];
  const totalRows = data?.meta?.total || 0;

  const columns: GridColDef[] = [
    {
      field: "name",
      headerName: t("companies.name_label"),
      flex: 1,
      minWidth: 150,
    },
    {
      field: "description",
      headerName: t("companies.description_label"),
      flex: 2,
      minWidth: 200,
      renderCell: (params) => params.value || "-",
    },
    {
      field: "userCount",
      headerName: t("users.title"),
      width: 120,
      align: "center",
      headerAlign: "center",
      valueGetter: (value) => value || 0,
    },
    {
      field: "jobPositionCount",
      headerName: t("job_positions.title"),
      width: 150,
      align: "center",
      headerAlign: "center",
      valueGetter: (value) => value || 0,
    },
    {
      field: "actions",
      headerName: t("common.actions"),
      width: 120,
      sortable: false,
      filterable: false,
      align: "center",
      headerAlign: "center",
      renderCell: (params: GridRenderCellParams<Company>) => (
        <ActionsCell
          onEdit={() => onEdit(params.row)}
          onDelete={() => onDelete(params.row)}
        />
      ),
    },
  ];

  // Show skeleton loader on INITIAL load, not on refetch
  if (isLoading && !data) {
    if (isMobile) {
      return (
        <Box sx={{ width: "100%" }}>
          {[1, 2, 3].map((i) => (
            <CompanyCardSkeleton key={i} />
          ))}
        </Box>
      );
    }
    // Desktop loading is handled by EnhancedDataGrid
  }

  // Mobile view (card layout)
  if (isMobile) {
    return (
      <>
        {companies.length > 0 ? (
          <Box sx={{ width: "100%" }}>
            {companies.map((company) => (
              <CompanyCardView
                key={company.uid}
                company={company}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </Box>
        ) : (
          <Paper sx={{ p: { xs: 2, sm: 4 }, textAlign: "center" }}>
            <Typography variant="body1" color="textSecondary">
              {t("companies.no_companies")}
            </Typography>
          </Paper>
        )}
      </>
    );
  }

  // Desktop view (DataGrid)
  return (
    <Box sx={{ height: 600, width: "100%" }}>
      <EnhancedDataGrid
        rows={companies}
        columns={columns}
        loading={isLoading}
        getRowId={(row) => row.uid}
        rowCount={totalRows}
        paginationMode="server"
        paginationModel={{ page: page - 1, pageSize: limit }}
        onPaginationModelChange={(model) => {
          if (model.page !== page - 1) {
            onPageChange(model.page + 1);
          }
          if (model.pageSize !== limit) {
            onLimitChange(model.pageSize);
          }
        }}
        pageSizeOptions={[10, 25, 50, 100]}
        disableRowSelectionOnClick
        onboardingKey="companies-list"
        localeText={{
          noRowsLabel: t("companies.no_companies"),
        }}
      />
    </Box>
  );
};

export default CompaniesList;
