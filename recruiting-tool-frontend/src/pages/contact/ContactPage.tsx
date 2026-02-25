import { useState } from "react";
import {
  Box,
  Button,
  Container,
  Grid,
  TextField,
  Typography,
  Paper,
  Stack,
  alpha,
  useTheme,
  CircularProgress,
} from "@mui/material";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { keyframes } from "@mui/material/styles";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import EmailIcon from "@mui/icons-material/Email";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import SendIcon from "@mui/icons-material/Send";
import { useCreateContactMessage } from "../../hooks/api/useContactMessages";
import { CreateContactMessageDto } from "../../types/contact-message.types";
import { useValidationRules } from "../../utils/validation";

const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

interface ContactFormData {
  name: string;
  email: string;
  company?: string;
  message: string;
}

const ContactPage = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const [submitted, setSubmitted] = useState(false);
  const validationRules = useValidationRules();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormData>();

  const { mutate: submitContact, isPending } = useCreateContactMessage();

  const onSubmit = (data: ContactFormData) => {
    const dto: CreateContactMessageDto = {
      name: data.name,
      email: data.email,
      message: data.message,
      ...(data.company?.trim() && { company: data.company.trim() }),
    };

    submitContact(dto, {
      onSuccess: () => {
        setSubmitted(true);
        reset();
      },
    });
  };

  const handleSendAnother = () => {
    setSubmitted(false);
  };

  const infoItems = [
    {
      icon: <AccessTimeIcon />,
      label: t("contact.info_response_time"),
      value: "",
    },
    {
      icon: <EmailIcon />,
      label: t("contact.info_email_label"),
      value: t("contact.info_email_value"),
    },
    {
      icon: <LocationOnIcon />,
      label: t("contact.info_location_label"),
      value: t("contact.info_location_value"),
    },
  ];

  return (
    <Box sx={{ minHeight: "80vh", py: { xs: 5, md: 8 } }}>
      <Container maxWidth="lg">
        {/* Page Header */}
        <Box
          sx={{
            textAlign: "center",
            mb: 6,
            animation: `${fadeInUp} 0.6s ease-out`,
          }}
        >
          <Typography
            variant="overline"
            sx={{
              color: theme.palette.primary.main,
              fontWeight: 800,
              fontSize: "0.875rem",
              letterSpacing: 2,
            }}
          >
            {t("contact.section_title")}
          </Typography>
          <Typography
            variant="h2"
            component="h1"
            gutterBottom
            sx={{
              fontWeight: 900,
              mt: 2,
              mb: 2,
              fontSize: { xs: "2rem", md: "2.75rem" },
              letterSpacing: "-0.02em",
            }}
          >
            {t("contact.page_title")}
          </Typography>
          <Typography
            variant="h6"
            color="text.secondary"
            sx={{
              maxWidth: 600,
              mx: "auto",
              lineHeight: 1.6,
              fontWeight: 400,
              fontSize: { xs: "1rem", md: "1.15rem" },
            }}
          >
            {t("contact.page_subtitle")}
          </Typography>
        </Box>

        <Grid container spacing={4} alignItems="flex-start">
          {/* Contact Form */}
          <Grid
            size={{ xs: 12, md: 7 }}
            sx={{ animation: `${fadeInUp} 0.7s ease-out 0.1s both` }}
          >
            <Paper
              elevation={0}
              sx={{
                p: { xs: 3, md: 5 },
                borderRadius: 4,
                border: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
                bgcolor: "background.paper",
              }}
            >
              {submitted ? (
                /* Success State */
                <Box
                  sx={{
                    textAlign: "center",
                    py: 6,
                    animation: `${fadeInUp} 0.5s ease-out`,
                  }}
                >
                  <CheckCircleIcon
                    sx={{
                      fontSize: 80,
                      color: theme.palette.success.main,
                      mb: 3,
                    }}
                  />
                  <Typography
                    variant="h4"
                    gutterBottom
                    sx={{ fontWeight: 800, mb: 2 }}
                  >
                    {t("contact.success_title")}
                  </Typography>
                  <Typography
                    variant="body1"
                    color="text.secondary"
                    sx={{ mb: 4, lineHeight: 1.7, fontSize: "1.05rem" }}
                  >
                    {t("contact.success_message")}
                  </Typography>
                  <Button
                    variant="outlined"
                    size="large"
                    onClick={handleSendAnother}
                    sx={{
                      borderRadius: 2,
                      px: 4,
                      py: 1.5,
                      fontWeight: 700,
                      textTransform: "none",
                      fontSize: "1rem",
                    }}
                  >
                    {t("contact.success_send_another")}
                  </Button>
                </Box>
              ) : (
                /* Form */
                <form onSubmit={handleSubmit(onSubmit)}>
                  <Typography
                    variant="h5"
                    gutterBottom
                    sx={{ fontWeight: 800, mb: 2.5, letterSpacing: "-0.01em" }}
                  >
                    {t("contact.section_subtitle")}
                  </Typography>

                  <Grid container spacing={2.5}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField
                        label={t("contact.form_name")}
                        placeholder={t("contact.form_name_placeholder")}
                        fullWidth
                        {...register(
                          "name",
                          validationRules.combine(
                            validationRules.required(t("contact.form_name")),
                            validationRules.minLength(2),
                            validationRules.maxLength(100),
                          ),
                        )}
                        error={!!errors.name}
                        helperText={errors.name?.message}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField
                        label={t("contact.form_email")}
                        placeholder={t("contact.form_email_placeholder")}
                        type="email"
                        fullWidth
                        {...register("email", validationRules.email())}
                        error={!!errors.email}
                        helperText={errors.email?.message}
                      />
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                      <TextField
                        label={t("contact.form_company")}
                        placeholder={t("contact.form_company_placeholder")}
                        fullWidth
                        {...register("company", validationRules.maxLength(200))}
                        error={!!errors.company}
                        helperText={errors.company?.message}
                      />
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                      <TextField
                        label={t("contact.form_message")}
                        placeholder={t("contact.form_message_placeholder")}
                        fullWidth
                        multiline
                        rows={5}
                        {...register(
                          "message",
                          validationRules.combine(
                            validationRules.required(t("contact.form_message")),
                            validationRules.minLength(10),
                            validationRules.maxLength(5000),
                          ),
                        )}
                        error={!!errors.message}
                        helperText={errors.message?.message}
                      />
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                      <Button
                        type="submit"
                        variant="contained"
                        size="large"
                        fullWidth
                        disabled={isPending}
                        endIcon={
                          isPending ? (
                            <CircularProgress size={20} color="inherit" />
                          ) : (
                            <SendIcon />
                          )
                        }
                        sx={{
                          py: 2,
                          fontSize: "1.05rem",
                          fontWeight: 700,
                          borderRadius: 2.5,
                          textTransform: "none",
                          boxShadow: `0 4px 16px ${alpha(theme.palette.primary.main, 0.25)}`,
                          "&:hover": {
                            transform: "translateY(-2px)",
                            boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.35)}`,
                          },
                          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                        }}
                      >
                        {isPending
                          ? t("contact.form_submitting")
                          : t("contact.form_submit")}
                      </Button>
                    </Grid>
                  </Grid>
                </form>
              )}
            </Paper>
          </Grid>

          {/* Info Panel */}
          <Grid
            size={{ xs: 12, md: 5 }}
            sx={{ animation: `${fadeInUp} 0.7s ease-out 0.2s both` }}
          >
            <Stack spacing={2}>
              {infoItems.map((item, index) => (
                <Paper
                  key={index}
                  elevation={0}
                  sx={{
                    p: 2,
                    borderRadius: 3,
                    border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    transition: "all 0.3s ease",
                    "&:hover": {
                      borderColor: alpha(theme.palette.primary.main, 0.2),
                      boxShadow: `0 4px 16px ${alpha(theme.palette.primary.main, 0.08)}`,
                    },
                  }}
                >
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: 2,
                      bgcolor: alpha(theme.palette.primary.main, 0.08),
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: theme.palette.primary.main,
                      flexShrink: 0,
                    }}
                  >
                    {item.icon}
                  </Box>
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                    }}
                  >
                    <Typography
                      variant="subtitle2"
                      sx={{
                        fontWeight: 700,
                        lineHeight: 1.3,
                        fontSize: "0.875rem",
                      }}
                    >
                      {item.label}
                    </Typography>
                    {item.value && (
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ fontSize: "0.8rem", lineHeight: 1.4, mt: 0.25 }}
                      >
                        {item.value}
                      </Typography>
                    )}
                  </Box>
                </Paper>
              ))}

              {/* Visual decoration */}
              <Box
                sx={{
                  p: 4,
                  borderRadius: 4,
                  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                  color: "white",
                  textAlign: "center",
                }}
              >
                <Typography
                  variant="h5"
                  sx={{ fontWeight: 800, mb: 1.5, letterSpacing: "-0.01em" }}
                >
                  {t("contact.cta_title")}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ opacity: 0.9, lineHeight: 1.6, fontSize: "0.95rem" }}
                >
                  {t("contact.cta_subtitle")}
                </Typography>
              </Box>
            </Stack>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default ContactPage;
