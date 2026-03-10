import { Alert, Button } from "@mui/material";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useUserAtom } from "../../hooks/api/state/useUserAtom";
import AddEmailDialog from "../dialogs/AddEmailDialog";

const AddEmailBanner: React.FC = () => {
  const { t } = useTranslation();
  const { user, isAuthenticated } = useUserAtom();
  const [dialogOpen, setDialogOpen] = useState(false);

  // Only show when authenticated and user has no email
  if (!isAuthenticated || !user || user.email) {
    return null;
  }

  return (
    <>
      <Alert
        severity="warning"
        sx={{
          borderRadius: 0,
          py: 0.5,
          "& .MuiAlert-message": {
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
            gap: 2,
          },
        }}
        action={
          <Button
            color="warning"
            size="small"
            variant="outlined"
            onClick={() => setDialogOpen(true)}
            sx={{ whiteSpace: "nowrap", flexShrink: 0 }}
          >
            {t("auth.add_email_action")}
          </Button>
        }
      >
        {t("auth.add_email_banner")}
      </Alert>

      <AddEmailDialog open={dialogOpen} onClose={() => setDialogOpen(false)} />
    </>
  );
};

export default AddEmailBanner;
