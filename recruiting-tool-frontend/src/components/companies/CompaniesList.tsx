import { GridRenderCellParams } from "@mui/x-data-grid";
import { Box, Typography, Chip, IconButton, Tooltip } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useListCompanies } from "../../hooks/api/useCompanies";
import { Company } from "../../types/company.types";
import { ActionsCell } from "../tables";
import { DataTable, DataTableColumn } from "../shared/DataTable";

interface CompaniesListProps {
  page: number;
  limit: number;
  search: string;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  onEdit: (company: Company) => void;
  onDelete: (company: Company) => void;
}

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
  const navigate = useNavigate();
  const { data, isLoading } = useListCompanies({
    page,
    limit,
    search,
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  const companies = data?.data || [];
  const totalRows = data?.meta?.total || 0;

  const columns: DataTableColumn<Company>[] = [
    {
      field: "name",
      headerName: t("companies.name_label"),
      flex: 1,
      minWidth: 150,
      mobileRender: (company: Company) => (
        <Typography
          variant="h6"
          sx={{ mb: 1, fontSize: { xs: "1.1rem", sm: "1.25rem" } }}
        >
          {company.name}
        </Typography>
      ),
    },
    {
      field: "description",
      headerName: t("companies.description_label"),
      flex: 2,
      minWidth: 200,
      renderCell: (params: GridRenderCellParams) => params.value || "-",
      mobileRender: (company: Company) => (
        <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
          {company.description || "-"}
        </Typography>
      ),
    },
    {
      field: "userCount",
      headerName: t("users.title"),
      width: 120,
      align: "center",
      headerAlign: "center",
      valueGetter: (value) => value || 0,
      mobileRender: (company: Company) => (
        <Chip
          label={`${company.userCount || 0} ${t("users.title")}`}
          variant="filled"
          size="small"
          sx={{ fontSize: "0.85rem", mb: 1 }}
        />
      ),
    },
    {
      field: "jobPositionCount",
      headerName: t("job_positions.title"),
      width: 150,
      align: "center",
      headerAlign: "center",
      valueGetter: (value) => value || 0,
      mobileRender: (company: Company) => (
        <Chip
          label={`${company.jobPositionCount || 0} ${t("job_positions.title")}`}
          variant="filled"
          size="small"
          sx={{ fontSize: "0.85rem", mb: 1 }}
        />
      ),
    },
    {
      field: "actions",
      headerName: t("common.actions"),
      width: 160,
      sortable: false,
      filterable: false,
      align: "center",
      headerAlign: "center",
      renderCell: (params: GridRenderCellParams) => (
        <Box sx={{ display: "flex", gap: 0.5, alignItems: "center" }}>
          <Tooltip title={t("common.view")}>
            <IconButton
              size="small"
              color="info"
              onClick={() => navigate(`/admin/companies/${params.row.uid}`)}
              aria-label={t("common.view")}
            >
              <VisibilityIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <ActionsCell
            onEdit={() => onEdit(params.row)}
            onDelete={() => onDelete(params.row)}
          />
        </Box>
      ),
      mobileRender: (company: Company) => (
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
            color="info"
            onClick={() => navigate(`/admin/companies/${company.uid}`)}
            aria-label={t("common.view")}
            sx={{ minHeight: 44, minWidth: 44 }}
          >
            <VisibilityIcon />
          </IconButton>
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
      ),
    },
  ];

  return (
    <DataTable
      data={companies}
      columns={columns}
      getRowId={(row) => row.uid}
      loading={isLoading}
      emptyMessage="companies.no_companies"
      onboardingKey="companies-list"
      page={page}
      limit={limit}
      totalRows={totalRows}
      onPageChange={onPageChange}
      onLimitChange={onLimitChange}
      serverPagination={true}
    />
  );
};

export default CompaniesList;
