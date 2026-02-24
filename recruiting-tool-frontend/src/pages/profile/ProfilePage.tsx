import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Chip,
  TextField,
  Divider,
  Grid,
  alpha,
  Skeleton,
} from "@mui/material";
import {
  Save as SaveIcon,
  Refresh as RefreshIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Work as WorkIcon,
  Business as BusinessIcon,
  Language as LanguageIcon,
  LinkedIn as LinkedInIcon,
  Schedule as ScheduleIcon,
  Info as InfoIcon,
  VerifiedUser as VerifiedUserIcon,
  OpenInNew as OpenInNewIcon,
} from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useUserAtom } from "../../hooks/api/state/useUserAtom";
import { useForm } from "react-hook-form";
import { UpdateUserDto, UserRoles } from "../../types/user.types";
import { useUpdateUser } from "../../hooks/api/useUsers";
import { useResendVerification } from "../../hooks/api/useAuth";
import { useEffect } from "react";
import { showSuccessToast, showErrorToast } from "../../utils/toast";
import ProfilePictureUpload from "../../components/user/ProfilePictureUpload";
import { RoleBadge } from "../../components/common";
import { useSubscription } from "../../api/subscription";
import { SubscriptionStatus } from "../../types/subscription.types";
import { hasRole } from "../../utils/permissions";

const ProfilePage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useUserAtom();
  const { mutate: updateUser, isPending } = useUpdateUser();
  const { mutate: resendVerification, isPending: isResendingVerification } =
    useResendVerification();

  const isOwner = hasRole(user, UserRoles.COMPANY_OWNER);
  const { data: subscription, isLoading: isLoadingSubscription } =
    useSubscription();

  const getSubscriptionStatusColor = (
    status: SubscriptionStatus,
  ): "success" | "warning" | "error" | "default" | "info" => {
    switch (status) {
      case SubscriptionStatus.ACTIVE:
        return "success";
      case SubscriptionStatus.TRIALING:
        return "info";
      case SubscriptionStatus.PAST_DUE:
        return "warning";
      case SubscriptionStatus.CANCELED:
      case SubscriptionStatus.UNPAID:
      case SubscriptionStatus.EXPIRED:
        return "error";
      default:
        return "default";
    }
  };

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
    watch,
  } = useForm<UpdateUserDto>({
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
      phoneNumber: user?.phoneNumber || "",
      position: user?.position || "",
      department: user?.department || "",
      bio: user?.bio || "",
      linkedinUrl: user?.linkedinUrl || "",
      timezone: user?.timezone || "",
      profilePicture: user?.profilePicture || "",
    },
  });

  // Reset form when user data changes (e.g., after successful update)
  useEffect(() => {
    if (user) {
      reset({
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber || "",
        position: user.position || "",
        department: user.department || "",
        bio: user.bio || "",
        linkedinUrl: user.linkedinUrl || "",
        timezone: user.timezone || "",
        profilePicture: user.profilePicture || "",
      });
    }
  }, [user, reset]);

  const watchedName = watch("name");

  const onSubmit = (data: UpdateUserDto) => {
    if (!user) return;

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

    updateUser({ uid: user.uid, data: cleanedData });
  };

  const handleReset = () => {
    if (user) {
      reset({
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber || "",
        position: user.position || "",
        department: user.department || "",
        bio: user.bio || "",
        linkedinUrl: user.linkedinUrl || "",
        timezone: user.timezone || "",
        profilePicture: user.profilePicture || "",
      });
    }
  };

  if (!user) {
    return (
      <Box sx={{ p: 4 }}>
        <Typography variant="h5" color="error">
          {t("profile_page.no_user_data")}
        </Typography>
      </Box>
    );
  }

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h4">{t("profile_page.my_profile")}</Typography>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={handleReset}
            disabled={!isDirty || isPending}
          >
            {t("profile_page.reset")}
          </Button>
          <Button
            type="submit"
            variant="contained"
            startIcon={<SaveIcon />}
            disabled={!isDirty || isPending}
          >
            {isPending ? t("common.saving") : t("profile.update_title")}
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Profile Overview Card */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card
            sx={{
              background: (theme) =>
                `linear-gradient(135deg, ${alpha(
                  theme.palette.primary.main,
                  0.05,
                )} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
              borderTop: 3,
              borderColor: "primary.main",
            }}
          >
            <CardContent
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                p: 4,
              }}
            >
              <ProfilePictureUpload
                currentPicture={
                  user.profilePicture
                    ? user.profilePicture.startsWith("http")
                      ? user.profilePicture
                      : `${import.meta.env.VITE_API_URL}/files/${
                          user.profilePicture
                        }/view`
                    : undefined
                }
                userName={watchedName || user.name}
                onUploadSuccess={(_fileUrl, fileUid) => {
                  // Store file UID instead of signed URL
                  console.log("Image uploaded with UID:", fileUid);
                  updateUser(
                    {
                      uid: user.uid,
                      data: { profilePicture: fileUid },
                    },
                    {
                      onSuccess: () => {
                        console.log(
                          "Profile picture updated successfully with UID!",
                        );
                      },
                      onError: (error) => {
                        console.error(
                          "Failed to update profile picture:",
                          error,
                        );
                      },
                    },
                  );
                }}
                onRemove={() => {
                  // Automatically remove profile picture from user profile
                  console.log("Removing profile picture");
                  updateUser(
                    {
                      uid: user.uid,
                      data: { profilePicture: "" },
                    },
                    {
                      onSuccess: () => {
                        console.log("Profile picture removed successfully!");
                      },
                      onError: (error) => {
                        console.error(
                          "Failed to remove profile picture:",
                          error,
                        );
                      },
                    },
                  );
                }}
              />
              <Typography
                variant="h5"
                gutterBottom
                sx={{ mt: 2, fontWeight: 600 }}
              >
                {watchedName || user.name}
              </Typography>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 0.5,
                  mb: 2,
                }}
              >
                <EmailIcon sx={{ fontSize: 16, color: "text.secondary" }} />
                <Typography variant="body2" color="text.secondary">
                  {user.email}
                </Typography>
              </Box>

              {/* Account Status Badge */}
              <Box
                sx={{
                  mb: 2,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                <Chip
                  icon={<VerifiedUserIcon />}
                  label={
                    user.emailVerified
                      ? t("profile_page.email_verified")
                      : t("profile_page.email_not_verified")
                  }
                  color={user.emailVerified ? "success" : "warning"}
                  size="medium"
                  sx={{ fontWeight: 600 }}
                />
                {!user.emailVerified && (
                  <Button
                    size="small"
                    variant="outlined"
                    color="warning"
                    disabled={isResendingVerification}
                    onClick={() =>
                      resendVerification(undefined, {
                        onSuccess: () =>
                          showSuccessToast(
                            t("profile_page.resend_verification_success"),
                          ),
                        onError: (error) =>
                          showErrorToast(
                            error,
                            t("profile_page.resend_verification_error"),
                          ),
                      })
                    }
                    sx={{ fontSize: "0.75rem" }}
                  >
                    {isResendingVerification
                      ? t("common.sending")
                      : t("profile_page.resend_verification")}
                  </Button>
                )}
              </Box>

              {/* Roles Section */}
              <Divider sx={{ width: "100%", my: 2 }} />
              <Box sx={{ width: "100%" }}>
                <Typography
                  variant="subtitle2"
                  sx={{
                    mb: 1,
                    fontWeight: 600,
                    color: "text.secondary",
                    textAlign: "center",
                  }}
                >
                  {t("profile_page.roles")}
                </Typography>
                <Box
                  sx={{
                    display: "flex",
                    gap: 1,
                    flexWrap: "wrap",
                    justifyContent: "center",
                  }}
                >
                  {user.roles.map((role) => (
                    <RoleBadge key={role} role={role} />
                  ))}
                </Box>
              </Box>

              {/* Subscription Section - COMPANY_OWNER only */}
              {isOwner && (
                <>
                  <Divider sx={{ width: "100%", my: 2 }} />
                  <Box sx={{ width: "100%" }}>
                    <Typography
                      variant="subtitle2"
                      sx={{
                        mb: 1.5,
                        fontWeight: 600,
                        color: "text.secondary",
                        textAlign: "center",
                      }}
                    >
                      {t("profile_page.your_plan")}
                    </Typography>
                    {isLoadingSubscription ? (
                      <Skeleton
                        variant="rectangular"
                        height={32}
                        sx={{ borderRadius: 1, mb: 1.5 }}
                      />
                    ) : subscription ? (
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          gap: 1,
                        }}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            gap: 1,
                            flexWrap: "wrap",
                            justifyContent: "center",
                          }}
                        >
                          <Chip
                            label={t(
                              `subscription.plans.${subscription.plan.toLowerCase()}.name`,
                            )}
                            color="primary"
                            size="small"
                            variant="outlined"
                          />
                          <Chip
                            label={t(
                              `subscription.status.${subscription.status.toLowerCase()}`,
                            )}
                            color={getSubscriptionStatusColor(
                              subscription.status,
                            )}
                            size="small"
                          />
                        </Box>
                        <Button
                          size="small"
                          variant="outlined"
                          endIcon={<OpenInNewIcon sx={{ fontSize: 14 }} />}
                          onClick={() => navigate("/profile/subscription")}
                          sx={{ mt: 0.5, width: "100%" }}
                        >
                          {t("profile_page.manage_subscription")}
                        </Button>
                      </Box>
                    ) : null}
                  </Box>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Profile Edit Form Card */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              {/* Basic Information Section */}
              <Box
                sx={{
                  mb: 4,
                  p: 3,
                  borderRadius: 2,
                  backgroundColor: (theme) =>
                    alpha(theme.palette.info.main, 0.05),
                  border: (theme) =>
                    `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: 40,
                      height: 40,
                      borderRadius: "50%",
                      backgroundColor: "info.main",
                      color: "white",
                      mr: 2,
                    }}
                  >
                    <PersonIcon />
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {t("profile_page.basic_info")}
                  </Typography>
                </Box>
                <Grid container spacing={2.5}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label={t("profile_page.full_name")}
                      {...register("name", {
                        required: t("validation.name_required"),
                      })}
                      error={!!errors.name}
                      helperText={errors.name?.message}
                      variant="outlined"
                      size="small"
                      InputProps={{
                        startAdornment: (
                          <PersonIcon sx={{ mr: 1, color: "info.main" }} />
                        ),
                      }}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label={t("profile_page.email_address")}
                      type="email"
                      {...register("email", {
                        required: t("validation.email_required"),
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: t("validation.email_invalid"),
                        },
                      })}
                      error={!!errors.email}
                      helperText={errors.email?.message}
                      variant="outlined"
                      size="small"
                      InputProps={{
                        startAdornment: (
                          <EmailIcon sx={{ mr: 1, color: "info.main" }} />
                        ),
                      }}
                    />
                  </Grid>

                  <Grid size={{ xs: 12 }}>
                    <TextField
                      fullWidth
                      label={t("profile_page.phone_number")}
                      placeholder="+1-555-0123"
                      {...register("phoneNumber")}
                      variant="outlined"
                      size="small"
                      InputProps={{
                        startAdornment: (
                          <PhoneIcon sx={{ mr: 1, color: "info.main" }} />
                        ),
                      }}
                    />
                  </Grid>
                </Grid>
              </Box>

              {/* Professional Information Section */}
              <Box
                sx={{
                  mb: 4,
                  p: 3,
                  borderRadius: 2,
                  backgroundColor: (theme) =>
                    alpha(theme.palette.success.main, 0.05),
                  border: (theme) =>
                    `1px solid ${alpha(theme.palette.success.main, 0.2)}`,
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: 40,
                      height: 40,
                      borderRadius: "50%",
                      backgroundColor: "success.main",
                      color: "white",
                      mr: 2,
                    }}
                  >
                    <WorkIcon />
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {t("profile_page.professional_info")}
                  </Typography>
                </Box>
                <Grid container spacing={2.5}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label={t("profile_page.position")}
                      placeholder={t("edit_profile.position_placeholder")}
                      {...register("position")}
                      variant="outlined"
                      size="small"
                      InputProps={{
                        startAdornment: (
                          <WorkIcon sx={{ mr: 1, color: "success.main" }} />
                        ),
                      }}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label={t("profile_page.department")}
                      placeholder={t("edit_profile.department_placeholder")}
                      {...register("department")}
                      variant="outlined"
                      size="small"
                      InputProps={{
                        startAdornment: (
                          <BusinessIcon sx={{ mr: 1, color: "success.main" }} />
                        ),
                      }}
                    />
                  </Grid>
                </Grid>
              </Box>

              {/* Additional Information Section */}
              <Box
                sx={{
                  mb: 4,
                  p: 3,
                  borderRadius: 2,
                  backgroundColor: (theme) =>
                    alpha(theme.palette.warning.main, 0.05),
                  border: (theme) =>
                    `1px solid ${alpha(theme.palette.warning.main, 0.2)}`,
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: 40,
                      height: 40,
                      borderRadius: "50%",
                      backgroundColor: "warning.main",
                      color: "white",
                      mr: 2,
                    }}
                  >
                    <LanguageIcon />
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {t("profile_page.additional_info")}
                  </Typography>
                </Box>
                <Grid container spacing={2.5}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label={t("profile_page.timezone")}
                      placeholder={t("edit_profile.timezone_placeholder")}
                      {...register("timezone")}
                      variant="outlined"
                      size="small"
                      InputProps={{
                        startAdornment: (
                          <ScheduleIcon sx={{ mr: 1, color: "warning.main" }} />
                        ),
                      }}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label={t("profile_page.linkedin_profile")}
                      placeholder={t("edit_profile.linkedin_placeholder")}
                      {...register("linkedinUrl")}
                      variant="outlined"
                      size="small"
                      InputProps={{
                        startAdornment: (
                          <LinkedInIcon sx={{ mr: 1, color: "warning.main" }} />
                        ),
                      }}
                    />
                  </Grid>
                </Grid>
              </Box>

              {/* Bio Section */}
              <Box
                sx={{
                  p: 3,
                  borderRadius: 2,
                  backgroundColor: (theme) =>
                    alpha(theme.palette.secondary.main, 0.05),
                  border: (theme) =>
                    `1px solid ${alpha(theme.palette.secondary.main, 0.2)}`,
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: 40,
                      height: 40,
                      borderRadius: "50%",
                      backgroundColor: "secondary.main",
                      color: "white",
                      mr: 2,
                    }}
                  >
                    <InfoIcon />
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {t("profile_page.about_you")}
                  </Typography>
                </Box>
                <TextField
                  fullWidth
                  label={t("profile_page.bio")}
                  placeholder={t("edit_profile.bio_placeholder")}
                  multiline
                  rows={6}
                  {...register("bio")}
                  variant="outlined"
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ProfilePage;
