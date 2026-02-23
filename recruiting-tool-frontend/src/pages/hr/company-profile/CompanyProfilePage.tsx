import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  TextField,
  Grid,
  Avatar,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  alpha,
  Skeleton,
} from "@mui/material";
import {
  Business as BusinessIcon,
  Language as LanguageIcon,
  LinkedIn as LinkedInIcon,
  Twitter as TwitterIcon,
  Instagram as InstagramIcon,
  PhotoCamera as PhotoCameraIcon,
  Save as SaveIcon,
  Work as WorkIcon,
  LocationOn as LocationOnIcon,
  CalendarToday as CalendarTodayIcon,
  People as PeopleIcon,
  Public as PublicIcon,
} from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import { useForm, Controller } from "react-hook-form";
import { useEffect, useRef, useState } from "react";
import {
  useMyCompanyProfile,
  useUpdateMyCompanyProfile,
  useUploadCompanyLogo,
} from "../../../hooks/api/useCompanies";
import { UpdateCompanyProfileDto } from "../../../types/company.types";
import { showSuccessToast, showErrorToast } from "../../../utils/toast";
import { PageHeader } from "../../../components/common";
import { useUserAtom } from "../../../hooks/api/state/useUserAtom";
import { hasRole } from "../../../utils/permissions";
import { UserRoles } from "../../../types/user.types";

const INDUSTRY_OPTIONS = [
  "technology",
  "healthcare",
  "finance",
  "education",
  "retail",
  "manufacturing",
  "media",
  "real_estate",
  "consulting",
  "legal",
  "hospitality",
  "transportation",
  "energy",
  "agriculture",
  "other",
] as const;

const COMPANY_SIZE_OPTIONS = [
  "1-10",
  "11-50",
  "51-200",
  "201-1000",
  "1000+",
] as const;

const CompanyProfilePage: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useUserAtom();
  const isAdmin =
    hasRole(user, UserRoles.COMPANY_OWNER) ||
    hasRole(user, UserRoles.COMPANY_ADMIN);

  const { data: profile, isLoading } = useMyCompanyProfile();
  const { mutate: updateProfile, isPending: isSaving } =
    useUpdateMyCompanyProfile();
  const { mutate: uploadLogo, isPending: isUploadingLogo } =
    useUploadCompanyLogo();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isDirty },
  } = useForm<UpdateCompanyProfileDto>({
    defaultValues: {
      name: "",
      description: "",
      website: "",
      industry: "",
      companySize: "",
      foundedYear: undefined,
      location: "",
      linkedinUrl: "",
      twitterUrl: "",
      instagramUrl: "",
      careersEnabled: true,
      careersHeadline: "",
    },
  });

  useEffect(() => {
    if (profile) {
      reset({
        name: profile.name || "",
        description: profile.description || "",
        website: profile.website || "",
        industry: profile.industry || "",
        companySize: profile.companySize || "",
        foundedYear: profile.foundedYear ?? undefined,
        location: profile.location || "",
        linkedinUrl: profile.linkedinUrl || "",
        twitterUrl: profile.twitterUrl || "",
        instagramUrl: profile.instagramUrl || "",
        careersEnabled: profile.careersEnabled ?? true,
        careersHeadline: profile.careersHeadline || "",
      });
    }
  }, [profile, reset]);

  const onSubmit = (data: UpdateCompanyProfileDto) => {
    const cleaned: UpdateCompanyProfileDto = {
      ...data,
      foundedYear: data.foundedYear ? Number(data.foundedYear) : undefined,
    };
    updateProfile(cleaned, {
      onSuccess: () => {
        showSuccessToast(t("company_profile.save_success"));
      },
    });
  };

  const handleLogoFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const validTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
    ];
    if (!validTypes.includes(file.type)) {
      showErrorToast(t("company_profile.logo_invalid_type"));
      return;
    }

    const maxSizeInBytes = 5 * 1024 * 1024;
    if (file.size > maxSizeInBytes) {
      showErrorToast(t("company_profile.logo_size_limit"));
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setLogoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    uploadLogo(file, {
      onSuccess: () => {
        showSuccessToast(t("company_profile.logo_upload_success"));
        setLogoPreview(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      },
      onError: () => {
        setLogoPreview(null);
      },
    });
  };

  const currentLogoUrl = logoPreview || profile?.logoUrl;
  const companyInitial = (profile?.name || "C").charAt(0).toUpperCase();

  if (isLoading) {
    return (
      <Box sx={{ p: 3 }}>
        <Skeleton variant="text" width={300} height={40} sx={{ mb: 1 }} />
        <Skeleton variant="text" width={200} height={24} sx={{ mb: 4 }} />
        <Grid container spacing={3}>
          <Grid size={{ xs: 12 }}>
            <Skeleton
              variant="rectangular"
              height={200}
              sx={{ borderRadius: 2 }}
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <Skeleton
              variant="rectangular"
              height={400}
              sx={{ borderRadius: 2 }}
            />
          </Grid>
        </Grid>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <PageHeader
        title={t("company_profile.title")}
        subtitle={t("company_profile.subtitle")}
      />

      <Box component="form" onSubmit={handleSubmit(onSubmit)}>
        <Grid container spacing={3}>
          {/* Company Logo Section */}
          <Grid size={{ xs: 12 }}>
            <Card
              elevation={0}
              sx={{
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 2,
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box
                  sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}
                >
                  <BusinessIcon color="primary" fontSize="small" />
                  <Typography variant="h6" fontWeight={600}>
                    {t("company_profile.section_logo")}
                  </Typography>
                </Box>

                <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
                  <Box sx={{ position: "relative" }}>
                    <Avatar
                      src={currentLogoUrl}
                      alt={profile?.name}
                      sx={{
                        width: 100,
                        height: 100,
                        fontSize: "2.5rem",
                        bgcolor: "primary.main",
                        border: "2px solid",
                        borderColor: "divider",
                      }}
                    >
                      {companyInitial}
                    </Avatar>
                    {isUploadingLogo && (
                      <Box
                        sx={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          backgroundColor: "rgba(0,0,0,0.5)",
                          borderRadius: "50%",
                        }}
                      >
                        <CircularProgress size={32} sx={{ color: "white" }} />
                      </Box>
                    )}
                  </Box>

                  <Box>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 1.5 }}
                    >
                      {t("company_profile.logo_hint")}
                    </Typography>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                      onChange={handleLogoFileSelect}
                      style={{ display: "none" }}
                    />
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<PhotoCameraIcon />}
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploadingLogo || !isAdmin}
                    >
                      {isUploadingLogo
                        ? t("company_profile.logo_uploading")
                        : t("company_profile.logo_upload_button")}
                    </Button>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Basic Info Section */}
          <Grid size={{ xs: 12 }}>
            <Card
              elevation={0}
              sx={{
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 2,
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box
                  sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}
                >
                  <WorkIcon color="primary" fontSize="small" />
                  <Typography variant="h6" fontWeight={600}>
                    {t("company_profile.section_basic_info")}
                  </Typography>
                </Box>

                <Grid container spacing={2.5}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      label={t("company_profile.field_name")}
                      fullWidth
                      disabled={!isAdmin}
                      error={!!errors.name}
                      helperText={errors.name?.message}
                      {...register("name", {
                        minLength: {
                          value: 2,
                          message: t("validation.min_length", { min: 2 }),
                        },
                        maxLength: {
                          value: 100,
                          message: t("validation.max_length", { max: 100 }),
                        },
                      })}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      label={t("company_profile.field_website")}
                      fullWidth
                      disabled={!isAdmin}
                      placeholder="https://company.com"
                      error={!!errors.website}
                      helperText={errors.website?.message}
                      InputProps={{
                        startAdornment: (
                          <LanguageIcon
                            fontSize="small"
                            sx={{ mr: 1, color: "text.secondary" }}
                          />
                        ),
                      }}
                      {...register("website")}
                    />
                  </Grid>

                  <Grid size={{ xs: 12 }}>
                    <TextField
                      label={t("company_profile.field_description")}
                      fullWidth
                      multiline
                      rows={3}
                      disabled={!isAdmin}
                      placeholder={t(
                        "company_profile.field_description_placeholder",
                      )}
                      error={!!errors.description}
                      helperText={errors.description?.message}
                      {...register("description", {
                        maxLength: {
                          value: 1000,
                          message: t("validation.max_length", { max: 1000 }),
                        },
                      })}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Controller
                      name="industry"
                      control={control}
                      render={({ field }) => (
                        <FormControl fullWidth disabled={!isAdmin}>
                          <InputLabel>
                            {t("company_profile.field_industry")}
                          </InputLabel>
                          <Select
                            label={t("company_profile.field_industry")}
                            {...field}
                            value={field.value || ""}
                          >
                            <MenuItem value="">
                              <em>{t("company_profile.select_none")}</em>
                            </MenuItem>
                            {INDUSTRY_OPTIONS.map((industry) => (
                              <MenuItem key={industry} value={industry}>
                                {t(`company_profile.industry_${industry}`)}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      )}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Controller
                      name="companySize"
                      control={control}
                      render={({ field }) => (
                        <FormControl fullWidth disabled={!isAdmin}>
                          <InputLabel>
                            {t("company_profile.field_company_size")}
                          </InputLabel>
                          <Select
                            label={t("company_profile.field_company_size")}
                            {...field}
                            value={field.value || ""}
                          >
                            <MenuItem value="">
                              <em>{t("company_profile.select_none")}</em>
                            </MenuItem>
                            {COMPANY_SIZE_OPTIONS.map((size) => (
                              <MenuItem key={size} value={size}>
                                {t("company_profile.size_employees", {
                                  range: size,
                                })}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      )}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      label={t("company_profile.field_founded_year")}
                      fullWidth
                      type="number"
                      disabled={!isAdmin}
                      placeholder="2020"
                      inputProps={{ min: 1800, max: new Date().getFullYear() }}
                      error={!!errors.foundedYear}
                      helperText={errors.foundedYear?.message}
                      InputProps={{
                        startAdornment: (
                          <CalendarTodayIcon
                            fontSize="small"
                            sx={{ mr: 1, color: "text.secondary" }}
                          />
                        ),
                      }}
                      {...register("foundedYear", {
                        min: {
                          value: 1800,
                          message: t("company_profile.founded_year_min"),
                        },
                        max: {
                          value: new Date().getFullYear(),
                          message: t("company_profile.founded_year_max"),
                        },
                      })}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      label={t("company_profile.field_location")}
                      fullWidth
                      disabled={!isAdmin}
                      placeholder={t(
                        "company_profile.field_location_placeholder",
                      )}
                      InputProps={{
                        startAdornment: (
                          <LocationOnIcon
                            fontSize="small"
                            sx={{ mr: 1, color: "text.secondary" }}
                          />
                        ),
                      }}
                      {...register("location")}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Social Links Section */}
          <Grid size={{ xs: 12 }}>
            <Card
              elevation={0}
              sx={{
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 2,
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box
                  sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}
                >
                  <PublicIcon color="primary" fontSize="small" />
                  <Typography variant="h6" fontWeight={600}>
                    {t("company_profile.section_social")}
                  </Typography>
                </Box>

                <Grid container spacing={2.5}>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <TextField
                      label="LinkedIn"
                      fullWidth
                      disabled={!isAdmin}
                      placeholder="https://linkedin.com/company/..."
                      InputProps={{
                        startAdornment: (
                          <LinkedInIcon
                            fontSize="small"
                            sx={{ mr: 1, color: "#0A66C2" }}
                          />
                        ),
                      }}
                      {...register("linkedinUrl")}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, sm: 4 }}>
                    <TextField
                      label="Twitter / X"
                      fullWidth
                      disabled={!isAdmin}
                      placeholder="https://twitter.com/..."
                      InputProps={{
                        startAdornment: (
                          <TwitterIcon
                            fontSize="small"
                            sx={{ mr: 1, color: "#1DA1F2" }}
                          />
                        ),
                      }}
                      {...register("twitterUrl")}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, sm: 4 }}>
                    <TextField
                      label="Instagram"
                      fullWidth
                      disabled={!isAdmin}
                      placeholder="https://instagram.com/..."
                      InputProps={{
                        startAdornment: (
                          <InstagramIcon
                            fontSize="small"
                            sx={{ mr: 1, color: "#E1306C" }}
                          />
                        ),
                      }}
                      {...register("instagramUrl")}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Careers Page Section */}
          <Grid size={{ xs: 12 }}>
            <Card
              elevation={0}
              sx={{
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 2,
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box
                  sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}
                >
                  <PeopleIcon color="primary" fontSize="small" />
                  <Typography variant="h6" fontWeight={600}>
                    {t("company_profile.section_careers")}
                  </Typography>
                </Box>

                <Grid container spacing={2.5}>
                  <Grid size={{ xs: 12 }}>
                    <Controller
                      name="careersEnabled"
                      control={control}
                      render={({ field }) => (
                        <FormControlLabel
                          control={
                            <Switch
                              checked={field.value ?? true}
                              onChange={(e) => field.onChange(e.target.checked)}
                              disabled={!isAdmin}
                              color="primary"
                            />
                          }
                          label={
                            <Box>
                              <Typography variant="body1" fontWeight={500}>
                                {t("company_profile.careers_enabled_label")}
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                {t("company_profile.careers_enabled_hint")}
                              </Typography>
                            </Box>
                          }
                        />
                      )}
                    />
                  </Grid>

                  <Grid size={{ xs: 12 }}>
                    <TextField
                      label={t("company_profile.field_careers_headline")}
                      fullWidth
                      disabled={!isAdmin}
                      placeholder={t(
                        "company_profile.field_careers_headline_placeholder",
                      )}
                      error={!!errors.careersHeadline}
                      helperText={errors.careersHeadline?.message}
                      {...register("careersHeadline", {
                        maxLength: {
                          value: 300,
                          message: t("validation.max_length", { max: 300 }),
                        },
                      })}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Save Button */}
          {isAdmin && (
            <Grid size={{ xs: 12 }}>
              <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  startIcon={
                    isSaving ? (
                      <CircularProgress size={18} color="inherit" />
                    ) : (
                      <SaveIcon />
                    )
                  }
                  disabled={isSaving || !isDirty}
                  sx={{ minWidth: 160 }}
                >
                  {isSaving ? t("common.saving") : t("common.save")}
                </Button>
              </Box>
            </Grid>
          )}

          {!isAdmin && (
            <Grid size={{ xs: 12 }}>
              <Box
                sx={{
                  p: 2,
                  borderRadius: 2,
                  bgcolor: (theme) => alpha(theme.palette.info.main, 0.08),
                  border: "1px solid",
                  borderColor: (theme) => alpha(theme.palette.info.main, 0.2),
                }}
              >
                <Typography variant="body2" color="info.main">
                  {t("company_profile.read_only_notice")}
                </Typography>
              </Box>
            </Grid>
          )}
        </Grid>
      </Box>
    </Box>
  );
};

export default CompanyProfilePage;
