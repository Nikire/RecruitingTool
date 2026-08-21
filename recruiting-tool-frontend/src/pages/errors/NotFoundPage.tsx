import { Box, Button, Paper, Stack, Typography } from "@mui/material";
import {
  Home as HomeIcon,
  WorkOutline as WorkOutlineIcon,
  SearchOff as SearchOffIcon,
} from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import { Link as RouterLink } from "react-router-dom";
import Seo from "../../components/common/Seo";

/**
 * NotFoundPage — the catch-all `path="*"` route.
 *
 * WHY THIS EXISTS: nginx rewrites every unknown path to `index.html`, so before
 * this route existed a typo, a stale inbound link or a deleted job posting all
 * rendered a blank `<Container>` with HTTP 200. Google treats that as an
 * indexable thin page across an unbounded URL space. This page renders real
 * copy plus `noindex, nofollow` so those URLs are explicitly dropped from the
 * index instead of silently bloating it.
 */
const NotFoundPage = () => {
  const { t } = useTranslation();

  return (
    <>
      <Seo
        title={t("not_found.seo_title")}
        description={t("not_found.seo_description")}
        noindex
      />

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "70vh",
          py: 4,
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: { xs: 3, sm: 5 },
            maxWidth: 560,
            width: "100%",
            textAlign: "center",
            borderRadius: 2,
          }}
        >
          <SearchOffIcon
            color="disabled"
            sx={{ fontSize: 72, mb: 1 }}
            aria-hidden
          />

          <Typography
            variant="h3"
            component="p"
            color="text.secondary"
            sx={{ fontWeight: 700, letterSpacing: 2 }}
          >
            {t("not_found.code")}
          </Typography>

          <Typography variant="h5" component="h1" sx={{ mt: 1, mb: 2 }}>
            {t("not_found.title")}
          </Typography>

          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            {t("not_found.message")}
          </Typography>

          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            justifyContent="center"
          >
            <Button
              variant="contained"
              startIcon={<HomeIcon />}
              component={RouterLink}
              to="/"
            >
              {t("not_found.go_home")}
            </Button>
            <Button
              variant="outlined"
              startIcon={<WorkOutlineIcon />}
              component={RouterLink}
              to="/careers"
            >
              {t("not_found.browse_jobs")}
            </Button>
          </Stack>
        </Paper>
      </Box>
    </>
  );
};

export default NotFoundPage;
