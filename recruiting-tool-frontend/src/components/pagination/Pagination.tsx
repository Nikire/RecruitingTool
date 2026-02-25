import {
  Box,
  Pagination as MuiPagination,
  Typography,
  Select,
  SelectChangeEvent,
  MenuItem,
  FormControl,
  InputLabel,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import { PaginationMeta } from "../../types/pagination.types";

interface PaginationProps {
  meta: PaginationMeta;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
  meta,
  onPageChange,
  onLimitChange,
}) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { page, totalPages, total, limit } = meta;

  const handlePageChange = (_: React.ChangeEvent<unknown>, value: number) => {
    onPageChange(value);
  };

  const handleLimitChange = (event: SelectChangeEvent<number>) => {
    onLimitChange(Number(event.target.value));
  };

  const startItem = (page - 1) * limit + 1;
  const endItem = Math.min(page * limit, total);

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        mt: { xs: 2, sm: 3 },
        flexWrap: "wrap",
        gap: { xs: 1.5, sm: 2 },
        p: { xs: 1, sm: 0 },
      }}
      role="navigation"
      aria-label={t("aria.pagination_navigation")}
    >
      <Typography
        variant="body2"
        color="textSecondary"
        sx={{ fontSize: { xs: "0.85rem", sm: "0.875rem" } }}
        aria-live="polite"
      >
        {t("pagination.showing", { start: startItem, end: endItem, total })}
      </Typography>

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: { xs: 1, sm: 2 },
          width: { xs: "100%", sm: "auto" },
          flexDirection: { xs: "column-reverse", sm: "row" },
        }}
      >
        <FormControl size="small" sx={{ minWidth: { xs: "100%", sm: 120 } }}>
          <InputLabel
            id="items-per-page-label"
            sx={{ fontSize: { xs: "0.85rem", sm: "0.875rem" } }}
          >
            {isMobile ? t("pagination.items") : t("pagination.items_per_page")}
          </InputLabel>
          <Select
            labelId="items-per-page-label"
            value={limit}
            onChange={handleLimitChange}
            label={
              isMobile ? t("pagination.items") : t("pagination.items_per_page")
            }
            inputProps={{
              "aria-label": t("pagination.items_per_page"),
            }}
            sx={{
              fontSize: { xs: "0.9rem", sm: "1rem" },
              height: { xs: 40, sm: 40 },
            }}
          >
            <MenuItem value={10}>10</MenuItem>
            <MenuItem value={25}>25</MenuItem>
            <MenuItem value={50}>50</MenuItem>
            <MenuItem value={100}>100</MenuItem>
          </Select>
        </FormControl>

        <Box
          sx={{
            width: { xs: "100%", sm: "auto" },
            display: "flex",
            justifyContent: "center",
          }}
        >
          <MuiPagination
            count={totalPages}
            page={page}
            onChange={handlePageChange}
            color="primary"
            shape="rounded"
            showFirstButton={!isMobile}
            showLastButton={!isMobile}
            size={isMobile ? "small" : "medium"}
            aria-label={t("aria.pagination_controls")}
            sx={{
              "& .MuiPaginationItem-root": {
                minWidth: { xs: 32, sm: 40 },
                height: { xs: 32, sm: 40 },
                fontSize: { xs: "0.75rem", sm: "0.875rem" },
              },
            }}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default Pagination;
