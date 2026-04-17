import { styled } from "@mui/material/styles";
import { DataGrid } from "@mui/x-data-grid";

/**
 * StyledDataGrid - DataGrid with always-visible column menu icon and proper cell alignment
 *
 * The default DataGrid only shows the column menu icon on hover,
 * which makes it hard for users to discover the filter/sort/column features.
 * This styled version makes the menu icon always visible and ensures
 * all cell content is vertically centered.
 */
const StyledDataGrid = styled(DataGrid)(({ theme }) => ({
  // Make column menu icon always visible (not just on hover)
  "& .MuiDataGrid-menuIcon": {
    visibility: "visible",
    width: "auto",
  },
  "& .MuiDataGrid-columnHeader:hover .MuiDataGrid-menuIcon": {
    visibility: "visible",
  },
  // Add subtle hover effect to column headers to indicate interactivity
  "& .MuiDataGrid-columnHeader": {
    transition: "background-color 0.2s ease",
    "&:hover": {
      backgroundColor: theme.palette.action.hover,
    },
  },
  // Better focus indicators for accessibility
  "& .MuiDataGrid-columnHeader:focus-within": {
    outline: `2px solid ${theme.palette.primary.main}`,
    outlineOffset: -2,
  },
  // Remove default cell focus outline for cleaner look
  "& .MuiDataGrid-cell:focus": {
    outline: "none",
  },
  "& .MuiDataGrid-cell:focus-within": {
    outline: "none",
  },
  // Ensure cell content is vertically centered
  "& .MuiDataGrid-cell": {
    display: "flex",
    alignItems: "center",
  },
}));

export default StyledDataGrid;
