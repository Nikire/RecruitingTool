import {
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  Divider,
  Grid,
  CircularProgress,
} from "@mui/material";
import FormDialog from "./FormDialog";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { User, UpdateUserDto } from "../../types/user.types";
import { useUpdateUser } from "../../hooks/api/useUsers";
import { useValidationRules } from "../../utils/validation";

interface UpdateProfileDialogProps {
  open: boolean;
  onClose: () => void;
  user: User;
}

const UpdateProfileDialog: React.FC<UpdateProfileDialogProps> = ({
  open,
  onClose,
  user,
}) => {
  const { t } = useTranslation();
  const validationRules = useValidationRules();
  const { mutate: updateUser, isPending } = useUpdateUser();

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
  } = useForm<UpdateUserDto>({
    defaultValues: {
      name: user.name,
      phoneNumber: user.phoneNumber || "",
      position: user.position || "",
      department: user.department || "",
      bio: user.bio || "",
      linkedinUrl: user.linkedinUrl || "",
      timezone: user.timezone || "",
      profilePicture: user.profilePicture || "",
    },
  });

  const onSubmit = (data: UpdateUserDto) => {
    // Remove empty strings and convert to undefined
    const cleanedData: UpdateUserDto = Object.entries(data).reduce(
      (acc, [key, value]) => {
        if (value !== "" && value !== undefined) {
          acc[key as keyof UpdateUserDto] = value;
        }
        return acc;
      },
      {} as UpdateUserDto,
    );

    updateUser(
      { uid: user.uid, data: cleanedData },
      {
        onSuccess: () => {
          // Cache invalidation in useUpdateUser will automatically refresh user data
          handleClose();
        },
      },
    );
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <FormDialog
      open={open}
      onClose={handleClose}
      isDirty={isDirty}
      maxWidth="md"
      fullWidth
      PaperProps={{ sx: { borderRadius: 2 } }}
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogTitle sx={{ pb: 1 }}>
          <Typography variant="h5" component="div" sx={{ fontWeight: 600 }}>
            {t("edit_profile.title")}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {t("edit_profile.subtitle")}
          </Typography>
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ pt: 3, pb: 2 }}>
          {/* Basic Information Section */}
          <Box sx={{ mb: 4 }}>
            <Typography
              variant="h6"
              sx={{ mb: 2, fontWeight: 600, color: "primary.main" }}
            >
              {t("edit_profile.basic_info")}
            </Typography>
            <Grid container spacing={2.5}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label={t("edit_profile.full_name")}
                  {...register(
                    "name",
                    validationRules.required(t("edit_profile.full_name")),
                  )}
                  error={!!errors.name}
                  helperText={errors.name?.message}
                  variant="outlined"
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label={t("edit_profile.phone_number")}
                  placeholder={t("edit_profile.phone_placeholder")}
                  {...register("phoneNumber")}
                  variant="outlined"
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label={t("edit_profile.profile_picture_url")}
                  placeholder={t("edit_profile.picture_placeholder")}
                  {...register("profilePicture")}
                  variant="outlined"
                />
              </Grid>
            </Grid>
          </Box>

          {/* Professional Information Section */}
          <Box sx={{ mb: 4 }}>
            <Typography
              variant="h6"
              sx={{ mb: 2, fontWeight: 600, color: "primary.main" }}
            >
              {t("edit_profile.professional_info")}
            </Typography>
            <Grid container spacing={2.5}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label={t("edit_profile.position")}
                  placeholder={t("edit_profile.position_placeholder")}
                  {...register("position")}
                  variant="outlined"
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label={t("edit_profile.department")}
                  placeholder={t("edit_profile.department_placeholder")}
                  {...register("department")}
                  variant="outlined"
                />
              </Grid>
            </Grid>
          </Box>

          {/* Additional Information Section */}
          <Box sx={{ mb: 4 }}>
            <Typography
              variant="h6"
              sx={{ mb: 2, fontWeight: 600, color: "primary.main" }}
            >
              {t("edit_profile.additional_info")}
            </Typography>
            <Grid container spacing={2.5}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label={t("edit_profile.timezone")}
                  placeholder={t("edit_profile.timezone_placeholder")}
                  {...register("timezone")}
                  variant="outlined"
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label={t("edit_profile.linkedin_profile")}
                  placeholder={t("edit_profile.linkedin_placeholder")}
                  {...register("linkedinUrl", validationRules.linkedinUrl())}
                  error={!!errors.linkedinUrl}
                  helperText={errors.linkedinUrl?.message}
                  variant="outlined"
                />
              </Grid>
            </Grid>
          </Box>

          {/* Bio Section - Separated */}
          <Box>
            <Typography
              variant="h6"
              sx={{ mb: 2, fontWeight: 600, color: "primary.main" }}
            >
              {t("edit_profile.about_you")}
            </Typography>
            <TextField
              fullWidth
              label={t("edit_profile.bio")}
              placeholder={t("edit_profile.bio_placeholder")}
              multiline
              rows={6}
              {...register("bio")}
              variant="outlined"
            />
          </Box>
        </DialogContent>
        <Divider />
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={handleClose} disabled={isPending} size="large">
            {t("common.cancel")}
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={isPending}
            size="large"
            startIcon={
              isPending ? <CircularProgress size={20} color="inherit" /> : null
            }
          >
            {isPending ? t("common.saving") : t("common.save")}
          </Button>
        </DialogActions>
      </form>
    </FormDialog>
  );
};

export default UpdateProfileDialog;
