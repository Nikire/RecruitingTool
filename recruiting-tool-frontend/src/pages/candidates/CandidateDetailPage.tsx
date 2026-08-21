import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Divider,
  Paper,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useTranslation } from "react-i18next";

import { useCandidate } from "../../hooks/api/useCandidates";
import { useAuthMe } from "../../hooks/api/useAuth";
import { canManageResources } from "../../utils/permissions";
import { useDialog } from "../../hooks/useDialog";
import { Candidate } from "../../types/candidate";
import UpdateCandidateDialog from "../../components/dialogs/UpdateCandidateDialog";
import FileUpload from "../../components/files/FileUpload";
import FileList from "../../components/files/FileList";
import {
  CandidateActivityTimeline,
  CandidateInterviews,
  CandidateJourney,
  CandidateNotes,
  CandidateProfileHeader,
} from "../../components/candidate";
import {
  AccessDeniedMessage,
  CenteredLoadingSpinner,
} from "../../components/common";
import Seo from "../../components/common/Seo";

/** Tab ids, kept as strings so reordering the array never shifts a selection. */
const TABS = ["overview", "interviews", "notes", "activity", "files"] as const;

type CandidateTab = (typeof TABS)[number];

const TAB_LABEL_KEYS: Record<CandidateTab, string> = {
  overview: "candidate_detail.tab_overview",
  interviews: "candidate_detail.tab_interviews",
  notes: "candidate_detail.tab_notes",
  activity: "candidate_detail.tab_activity",
  files: "candidate_detail.tab_files",
};

/**
 * `/hr/candidates/:uid` — the read view of the core object of the ATS.
 *
 * Everything on this page already existed but had no route to reach it: the
 * journey endpoint had no consumer, `CandidateActivityTimeline` had no
 * importer, and notes/files were reachable only by opening the *edit* dialog.
 * This page is assembly, not new machinery — the edit dialog is still the only
 * place a candidate is mutated, and it is reused here unchanged.
 *
 * Authenticated and gated, so it is served `noindex, nofollow`.
 */
const CandidateDetailPage: React.FC = () => {
  const { t } = useTranslation();
  const { uid } = useParams<{ uid: string }>();
  const navigate = useNavigate();

  const { user, isLoading: isUserLoading } = useAuthMe();
  const canManage = canManageResources(user);

  const { data: candidate, isLoading, isError } = useCandidate(uid || "");
  const updateDialog = useDialog<Candidate>();
  const [activeTab, setActiveTab] = useState<CandidateTab>("overview");

  const goBack = () => navigate("/hr/candidates");

  const backButton = (
    <Button
      startIcon={<ArrowBackIcon />}
      onClick={goBack}
      sx={{ mb: 2, minHeight: 44 }}
    >
      {t("candidate_detail.back_to_candidates")}
    </Button>
  );

  if (isUserLoading) {
    return <CenteredLoadingSpinner />;
  }

  if (!canManage) {
    return (
      <AccessDeniedMessage requiredRoles={["HR", "ADMIN", "SUPER_ADMIN"]} />
    );
  }

  if (isLoading) {
    return <CenteredLoadingSpinner />;
  }

  if (isError || !candidate) {
    return (
      <Box sx={{ p: { xs: 2, sm: 3 } }}>
        <Seo
          title={t("seo.candidate_detail.not_found_title")}
          description={t("seo.candidate_detail.not_found_description")}
          noindex
        />
        {backButton}
        <Alert severity="error">{t("candidate_detail.error_loading")}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      <Seo
        title={t("seo.candidate_detail.title", { name: candidate.name })}
        description={t("seo.candidate_detail.description")}
        noindex
      />

      {backButton}

      <CandidateProfileHeader
        candidate={candidate}
        onEdit={() => updateDialog.openWith(candidate)}
      />

      <Paper sx={{ p: { xs: 2, sm: 3 } }}>
        <Tabs
          value={activeTab}
          onChange={(_event, value: CandidateTab) => setActiveTab(value)}
          variant="scrollable"
          scrollButtons="auto"
          allowScrollButtonsMobile
          aria-label={t("candidate_detail.tabs_aria")}
        >
          {TABS.map((tab) => (
            <Tab
              key={tab}
              value={tab}
              label={t(TAB_LABEL_KEYS[tab])}
              id={`candidate-tab-${tab}`}
              aria-controls={`candidate-tabpanel-${tab}`}
            />
          ))}
        </Tabs>

        <Divider sx={{ mb: 3 }} />

        <Box
          role="tabpanel"
          id={`candidate-tabpanel-${activeTab}`}
          aria-labelledby={`candidate-tab-${activeTab}`}
        >
          {activeTab === "overview" && (
            <CandidateJourney candidateUid={candidate.uid} />
          )}

          {activeTab === "interviews" && (
            <CandidateInterviews candidate={candidate} />
          )}

          {activeTab === "notes" && (
            <CandidateNotes candidateUid={candidate.uid} />
          )}

          {activeTab === "activity" && (
            <CandidateActivityTimeline candidateUid={candidate.uid} />
          )}

          {activeTab === "files" && (
            <>
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  {t("candidates.upload_files")}
                </Typography>
                <FileUpload candidateUid={candidate.uid} />
              </Box>

              <Divider sx={{ my: 3 }} />

              <Box>
                <Typography variant="h6" gutterBottom>
                  {t("candidates.uploaded_files")}
                </Typography>
                <FileList candidateUid={candidate.uid} />
              </Box>
            </>
          )}
        </Box>
      </Paper>

      <UpdateCandidateDialog
        open={updateDialog.isOpen}
        onClose={updateDialog.close}
        candidate={updateDialog.selectedItem}
      />
    </Box>
  );
};

export default CandidateDetailPage;
