import React from "react";
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Grid,
  Typography,
  Chip,
  Button,
  Stack,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import {
  KeyOutlined as ApiKeyIcon,
  WebhookOutlined as WebhookIcon,
  AddOutlined as AddIcon,
  VpnKeyOutlined as GenerateIcon,
} from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import { Navigate } from "react-router-dom";
import { useUserAtom } from "../../hooks/api/state/useUserAtom";
import { UserRoles } from "../../types/user.types";
import PageHeader from "../../components/common/PageHeader";
import AccessDeniedMessage from "../../components/common/AccessDeniedMessage";

/**
 * Skeleton rows to simulate an empty table with upcoming data.
 */
const SkeletonTableRows: React.FC<{ columns: number; rows?: number }> = ({
  columns,
  rows = 3,
}) => (
  <>
    {[...Array(rows)].map((_, rowIdx) => (
      <TableRow key={rowIdx}>
        {[...Array(columns)].map((_, colIdx) => (
          <TableCell key={colIdx}>
            <Skeleton
              variant="text"
              width={
                colIdx === 0 ? "60%" : colIdx === columns - 1 ? "40%" : "80%"
              }
              height={24}
            />
          </TableCell>
        ))}
      </TableRow>
    ))}
  </>
);

/**
 * WebhooksPage - Webhook & API key management (stub)
 *
 * Provides a placeholder UI for managing API keys and webhooks.
 * Both sections are disabled ("Coming Soon") until the backend
 * endpoints and token-generation logic are implemented.
 *
 * Access: SUPER_ADMIN only
 */
const WebhooksPage: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useUserAtom();

  if (!user) {
    return <Navigate to="/login" />;
  }

  const isSuperAdmin = user?.roles?.includes(UserRoles.SUPER_ADMIN);
  if (!isSuperAdmin) {
    return <AccessDeniedMessage requiredRoles={["SUPER_ADMIN"]} />;
  }

  return (
    <Box>
      <PageHeader title="webhooks.title" subtitle="webhooks.subtitle" />

      <Grid container spacing={3}>
        {/* API Keys Card */}
        <Grid size={{ xs: 12 }}>
          <Card elevation={2}>
            <CardHeader
              title={
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <ApiKeyIcon color="action" />
                  <Typography variant="h6" fontWeight={600}>
                    {t("webhooks.api_keys_section")}
                  </Typography>
                  <Chip
                    label={t("webhooks.coming_soon")}
                    size="small"
                    color="default"
                    variant="outlined"
                    sx={{ fontWeight: 500 }}
                  />
                </Box>
              }
              action={
                <Button
                  variant="contained"
                  startIcon={<GenerateIcon />}
                  disabled
                  size="small"
                  sx={{ mr: 1, mt: 0.5 }}
                >
                  {t("webhooks.generate_api_key")}
                </Button>
              }
              sx={{ pb: 0 }}
            />
            <CardContent>
              <Stack spacing={2}>
                <Typography variant="body2" color="text.secondary">
                  {t("webhooks.api_keys_description")}
                </Typography>

                <TableContainer component={Paper} variant="outlined">
                  <Table
                    size="small"
                    aria-label={t("webhooks.api_keys_section")}
                  >
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600 }}>
                          {t("webhooks.col_name")}
                        </TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>
                          {t("webhooks.col_key_prefix")}
                        </TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>
                          {t("webhooks.col_created")}
                        </TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>
                          {t("webhooks.col_last_used")}
                        </TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>
                          {t("webhooks.col_actions")}
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <SkeletonTableRows columns={5} rows={2} />
                      <TableRow>
                        <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                          <Typography variant="body2" color="text.disabled">
                            {t("webhooks.no_api_keys")}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Webhooks Card */}
        <Grid size={{ xs: 12 }}>
          <Card elevation={2}>
            <CardHeader
              title={
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <WebhookIcon color="action" />
                  <Typography variant="h6" fontWeight={600}>
                    {t("webhooks.webhooks_section")}
                  </Typography>
                  <Chip
                    label={t("webhooks.coming_soon")}
                    size="small"
                    color="default"
                    variant="outlined"
                    sx={{ fontWeight: 500 }}
                  />
                </Box>
              }
              action={
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  disabled
                  size="small"
                  sx={{ mr: 1, mt: 0.5 }}
                >
                  {t("webhooks.add_webhook")}
                </Button>
              }
              sx={{ pb: 0 }}
            />
            <CardContent>
              <Stack spacing={2}>
                <Typography variant="body2" color="text.secondary">
                  {t("webhooks.webhooks_description")}
                </Typography>

                <TableContainer component={Paper} variant="outlined">
                  <Table
                    size="small"
                    aria-label={t("webhooks.webhooks_section")}
                  >
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600 }}>
                          {t("webhooks.col_name")}
                        </TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>
                          {t("webhooks.col_url")}
                        </TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>
                          {t("webhooks.col_events")}
                        </TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>
                          {t("webhooks.col_status")}
                        </TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>
                          {t("webhooks.col_actions")}
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <SkeletonTableRows columns={5} rows={2} />
                      <TableRow>
                        <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                          <Typography variant="body2" color="text.disabled">
                            {t("webhooks.no_webhooks")}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>

                <Box
                  sx={{
                    p: 1.5,
                    borderRadius: 1,
                    bgcolor: "action.hover",
                  }}
                >
                  <Typography variant="caption" color="text.secondary">
                    {t("webhooks.coming_soon_note")}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default WebhooksPage;
