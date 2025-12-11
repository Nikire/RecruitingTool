import {
  Box,
  Typography,
  CircularProgress,
  Card,
  CardContent,
  CardActionArea,
  Chip,
  Divider,
  Paper,
} from "@mui/material";
import FolderIcon from "@mui/icons-material/Folder";
import { useListJobPositions } from "../../hooks/api/useJobPositions";
import { useNavigate } from "react-router-dom";

interface JobPositionsFolderViewProps {
  hiringProcesses?: any[];
}

const JobPositionsFolderView: React.FC<JobPositionsFolderViewProps> = ({
  hiringProcesses,
}) => {
  const navigate = useNavigate();
  const { data: jobPositionsData, isLoading } = useListJobPositions({
    page: 1,
    limit: 100,
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  const jobPositions = jobPositionsData?.data;

  // Group hiring processes by job position
  const jobPositionStats = jobPositions?.map((jp) => {
    const processCount =
      hiringProcesses?.filter((p) => p.jobPosition?.uid === jp.uid).length || 0;
    const statusCounts = {
      OPEN:
        hiringProcesses?.filter(
          (p) => p.jobPosition?.uid === jp.uid && p.status === "OPEN",
        ).length || 0,
      IN_PROGRESS:
        hiringProcesses?.filter(
          (p) => p.jobPosition?.uid === jp.uid && p.status === "IN_PROGRESS",
        ).length || 0,
      CLOSED:
        hiringProcesses?.filter(
          (p) => p.jobPosition?.uid === jp.uid && p.status === "CLOSED",
        ).length || 0,
    };
    return { ...jp, processCount, statusCounts };
  });

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      <Typography variant="h5" sx={{ mb: 2 }}>
        Job Positions
      </Typography>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
          gap: 2,
          mb: 4,
        }}
      >
        {jobPositionStats && jobPositionStats.length > 0 ? (
          jobPositionStats.map((jp) => (
            <Card elevation={2} key={jp.uid}>
              <CardActionArea
                onClick={() => navigate(`/job-position/${jp.uid}`)}
              >
                <CardContent>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <FolderIcon
                      sx={{ fontSize: 40, color: "primary.main", mr: 2 }}
                    />
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6" noWrap>
                        {jp.title}
                      </Typography>
                      <Chip
                        label={jp.status}
                        size="small"
                        color={jp.status === "OPEN" ? "success" : "default"}
                      />
                    </Box>
                  </Box>
                  <Divider sx={{ my: 1 }} />
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      flexWrap: "wrap",
                      gap: 1,
                    }}
                  >
                    <Typography variant="body2" color="textSecondary">
                      Total Processes: <strong>{jp.processCount}</strong>
                    </Typography>
                  </Box>
                  <Box
                    sx={{ display: "flex", gap: 1, mt: 1, flexWrap: "wrap" }}
                  >
                    {jp.statusCounts.OPEN > 0 && (
                      <Chip
                        label={`Open: ${jp.statusCounts.OPEN}`}
                        size="small"
                        color="info"
                        variant="outlined"
                      />
                    )}
                    {jp.statusCounts.IN_PROGRESS > 0 && (
                      <Chip
                        label={t("job_positions.in_progress_count", {
                          count: jp.statusCounts.IN_PROGRESS,
                        })}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    )}
                    {jp.statusCounts.CLOSED > 0 && (
                      <Chip
                        label={`Closed: ${jp.statusCounts.CLOSED}`}
                        size="small"
                        color="success"
                        variant="outlined"
                      />
                    )}
                  </Box>
                </CardContent>
              </CardActionArea>
            </Card>
          ))
        ) : (
          <Paper sx={{ p: 4, textAlign: "center" }}>
            <Typography variant="body1" color="textSecondary">
              No job positions found.
            </Typography>
          </Paper>
        )}
      </Box>
    </>
  );
};

export default JobPositionsFolderView;
