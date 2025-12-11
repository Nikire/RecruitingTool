import {
  Paper,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import { useTranslation } from "react-i18next";

interface TableSkeletonLoaderProps {
  rows?: number;
  columns?: number;
  showHeader?: boolean;
}

/**
 * TableSkeletonLoader - Skeleton loader specifically for table structures
 * Renders a complete table skeleton with headers and rows
 *
 * @param rows - Number of skeleton rows to display (default: 10)
 * @param columns - Number of columns in the table (default: 5)
 * @param showHeader - Whether to show the header skeleton (default: true)
 */
const TableSkeletonLoader: React.FC<TableSkeletonLoaderProps> = ({
  rows = 10,
  columns = 5,
  showHeader = true,
}) => {
  const { t } = useTranslation();

  return (
    <TableContainer
      component={Paper}
      role="status"
      aria-label={t("common.loading")}
    >
      <Table>
        {showHeader && (
          <TableHead>
            <TableRow>
              {Array.from({ length: columns }).map((_, index) => (
                <TableCell key={index}>
                  <Skeleton variant="text" width="80%" height={24} />
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
        )}
        <TableBody>
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <TableRow key={rowIndex}>
              {Array.from({ length: columns }).map((_, colIndex) => (
                <TableCell key={colIndex}>
                  <Skeleton variant="text" width="90%" height={20} />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default TableSkeletonLoader;
