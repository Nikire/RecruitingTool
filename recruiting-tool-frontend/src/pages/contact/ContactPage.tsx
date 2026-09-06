import { useMemo, useState } from "react";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Grid,
  Paper,
  TextField,
  Typography,
  alpha,
  useTheme,
} from "@mui/material";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { keyframes } from "@mui/material/styles";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import EmailIcon from "@mui/icons-material/Email";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import SendIcon from "@mui/icons-material/Send";
import { useCreateContactMessage } from "../../hooks/api/useContactMessages";
import { CreateContactMessageDto } from "../../types/contact-message.types";
import { useValidationRules } from "../../utils/validation";
import BookDemoDialog from "../../components/contact/BookDemoDialog";
import Seo from "../../components/common/Seo";
import { buildFaqPageLd } from "../../utils/structuredData";

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

/** Backend `CreateContactMessageDto.message` is `@MaxLength(5000)`. */
const CONTACT_MESSAGE_MAX_LENGTH = 5000;

interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  company?: string;
  message: string;
}

const ContactPage = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const [submitted, setSubmitted] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState<string | false>(false);
  const [bookDemoDialogOpen, setBookDemoDialogOpen] = useState(false);
  const validationRules = useValidationRules();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormData>();

  const {
    mutate: submitContact,
    isPending,
    isError,
  } = useCreateContactMessage();

  const onSubmit = (data: ContactFormData) => {
    const dto: CreateContactMessageDto = {
      name: data.name,
      email: data.email,
      message: `[${data.subject}] ${data.message}`,
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

  const handleFaqChange =
    (panel: string) => (_event: React.SyntheticEvent, isExpanded: boolean) => {
      setExpandedFaq(isExpanded ? panel : false);
    };

  const contactMethods = [
    {
      icon: <EmailIcon sx={{ fontSize: 32 }} />,
      title: t("contact.method_email_title"),
      description: t("contact.method_email_description"),
      action: (
        <Button
          variant="contained"
          size="small"
          href={`mailto:${t("app.support_email")}`}
          sx={{
            mt: "auto",
            borderRadius: 2,
            textTransform: "none",
            fontWeight: 600,
          }}
        >
          {t("contact.method_email_action")}
        </Button>
      ),
    },
    {
      icon: <CalendarMonthIcon sx={{ fontSize: 32 }} />,
      title: t("contact.method_demo_title"),
      description: t("contact.method_demo_description"),
      action: (
        <Button
          variant="contained"
          size="small"
          onClick={() => setBookDemoDialogOpen(true)}
          sx={{
            mt: "auto",
            borderRadius: 2,
            textTransform: "none",
            fontWeight: 600,
          }}
        >
          {t("contact.method_demo_action")}
        </Button>
      ),
    },
    {
      icon: <MenuBookIcon sx={{ fontSize: 32 }} />,
      title: t("contact.method_docs_title"),
      description: t("contact.method_docs_description"),
      action: (
        <Chip
          label={t("contact.method_docs_coming_soon")}
          size="small"
          color="default"
          sx={{ mt: "auto", fontWeight: 600 }}
        />
      ),
    },
  ];

  /**
   * Single source of truth for the FAQ: the accordions below and the
   * `FAQPage` JSON-LD both read this array, so the structured data can never
   * drift away from the copy a visitor actually sees — which is exactly what
   * Google penalises FAQ markup for.
   */
  const faqItems = useMemo(
    () => [
      {
        id: "faq1",
        question: t("contact.faq_1_question"),
        answer: t("contact.faq_1_answer"),
      },
      {
        id: "faq2",
        question: t("contact.faq_2_question"),
        answer: t("contact.faq_2_answer"),
      },
      {
        id: "faq3",
        question: t("contact.faq_3_question"),
        answer: t("contact.faq_3_answer"),
      },
      {
        id: "faq4",
        question: t("contact.faq_4_question"),
        answer: t("contact.faq_4_answer"),
      },
    ],
    [t],
  );

  // Memoised: `<Seo>` keys its head entry on `jsonLd` by reference.
  const faqLd = useMemo(() => buildFaqPageLd(faqItems), [faqItems]);

  return (
    <>
      <Seo
        title={t("seo.contact.title")}
        description={t("seo.contact.description")}
        jsonLd={faqLd}
      />

      <Box sx={{ minHeight: "80vh", py: { xs: 5, md: 8 } }}>
        <Container maxWidth="lg">
          {/* Hero Section */}
          <Box
            sx={{
              textAlign: "center",
              mb: 8,
              animation: `${fadeInUp} 0.6s ease-out`,
            }}
          >
            <Typography
              variant="h2"
              component="h1"
              gutterBottom
              sx={{
                fontWeight: 900,
                mb: 2,
                fontSize: { xs: "2.25rem", md: "3rem" },
                letterSpacing: "-0.02em",
              }}
            >
              {t("contact.page_title")}
            </Typography>
            <Typography
              variant="h6"
              component="p"
              color="text.secondary"
              sx={{
                maxWidth: 520,
                mx: "auto",
                lineHeight: 1.6,
                fontWeight: 400,
                fontSize: { xs: "1rem", md: "1.125rem" },
              }}
            >
              {t("contact.page_subtitle")}
            </Typography>
          </Box>

          {/* Contact Methods */}
          <Box
            sx={{
              mb: 8,
              animation: `${fadeInUp} 0.6s ease-out 0.1s both`,
            }}
          >
            <Grid container spacing={3}>
              {contactMethods.map((method, index) => (
                <Grid key={index} size={{ xs: 12, sm: 4 }}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 3,
                      height: "100%",
                      borderRadius: 3,
                      border: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
                      display: "flex",
                      flexDirection: "column",
                      gap: 1.5,
                      transition: "all 0.25s ease",
                      "&:hover": {
                        borderColor: alpha(theme.palette.primary.main, 0.25),
                        boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.08)}`,
                        transform: "translateY(-2px)",
                      },
                    }}
                  >
                    <Box
                      sx={{
                        width: 56,
                        height: 56,
                        borderRadius: 2.5,
                        bgcolor: alpha(theme.palette.primary.main, 0.08),
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: theme.palette.primary.main,
                      }}
                    >
                      {method.icon}
                    </Box>
                    <Typography
                      variant="subtitle1"
                      component="h2"
                      sx={{ fontWeight: 700, letterSpacing: "-0.01em" }}
                    >
                      {method.title}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ lineHeight: 1.6, flexGrow: 1 }}
                    >
                      {method.description}
                    </Typography>
                    {method.action}
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Box>

          {/* Contact Form */}
          <Box
            sx={{
              mb: 8,
              animation: `${fadeInUp} 0.6s ease-out 0.2s both`,
            }}
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
                <Box
                  sx={{
                    textAlign: "center",
                    py: 6,
                    animation: `${fadeInUp} 0.5s ease-out`,
                  }}
                >
                  <CheckCircleIcon
                    sx={{
                      fontSize: 72,
                      color: theme.palette.success.main,
                      mb: 2.5,
                    }}
                  />
                  <Typography
                    variant="h4"
                    component="h2"
                    gutterBottom
                    sx={{ fontWeight: 800, mb: 1.5 }}
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
                    variant="contained"
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
                <>
                  <Box sx={{ mb: 3.5 }}>
                    <Typography
                      variant="h5"
                      component="h2"
                      sx={{
                        fontWeight: 800,
                        letterSpacing: "-0.01em",
                        mb: 0.5,
                      }}
                    >
                      {t("contact.form_section_title")}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {t("contact.form_section_subtitle")}
                    </Typography>
                  </Box>

                  <form onSubmit={handleSubmit(onSubmit)} noValidate>
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
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                          label={t("contact.form_subject")}
                          placeholder={t("contact.form_subject_placeholder")}
                          fullWidth
                          {...register(
                            "subject",
                            validationRules.combine(
                              validationRules.required(
                                t("contact.form_subject"),
                              ),
                              validationRules.maxLength(200),
                            ),
                          )}
                          error={!!errors.subject}
                          helperText={errors.subject?.message}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                          label={t("contact.form_company")}
                          placeholder={t("contact.form_company_placeholder")}
                          fullWidth
                          {...register(
                            "company",
                            validationRules.maxLength(200),
                          )}
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
                          rows={4}
                          {...register(
                            "message",
                            validationRules.combine(
                              validationRules.required(
                                t("contact.form_message"),
                              ),
                              validationRules.minLength(10),
                              validationRules.maxLength(
                                CONTACT_MESSAGE_MAX_LENGTH,
                              ),
                              {
                                // The subject is prepended to the message on
                                // submit; the backend caps the combined string.
                                validate: (
                                  value: string,
                                  formValues: ContactFormData,
                                ) =>
                                  `[${formValues.subject ?? ""}] ${value}`
                                    .length <= CONTACT_MESSAGE_MAX_LENGTH ||
                                  t("contact.form_message_too_long", {
                                    max: CONTACT_MESSAGE_MAX_LENGTH,
                                  }),
                              },
                            ),
                          )}
                          error={!!errors.message}
                          helperText={errors.message?.message}
                        />
                      </Grid>
                      {isError && (
                        <Grid size={{ xs: 12 }}>
                          <Alert severity="error" sx={{ borderRadius: 2 }}>
                            {t("contact.form_error")}
                          </Alert>
                        </Grid>
                      )}
                      <Grid size={{ xs: 12 }}>
                        <Button
                          type="submit"
                          variant="contained"
                          size="large"
                          fullWidth
                          disabled={isPending}
                          endIcon={
                            isPending ? (
                              <CircularProgress size={18} color="inherit" />
                            ) : (
                              <SendIcon />
                            )
                          }
                          sx={{
                            py: 1.75,
                            fontSize: "1rem",
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
                </>
              )}
            </Paper>
          </Box>

          {/* FAQ Section */}
          <Box sx={{ animation: `${fadeInUp} 0.6s ease-out 0.3s both` }}>
            <Box sx={{ textAlign: "center", mb: 4 }}>
              <Typography
                variant="h4"
                component="h2"
                sx={{
                  fontWeight: 800,
                  letterSpacing: "-0.02em",
                  mb: 1,
                  fontSize: { xs: "1.75rem", md: "2.25rem" },
                }}
              >
                {t("contact.faq_title")}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {t("contact.faq_subtitle")}
              </Typography>
            </Box>

            <Box sx={{ maxWidth: 760, mx: "auto" }}>
              {faqItems.map((item) => (
                <Accordion
                  key={item.id}
                  expanded={expandedFaq === item.id}
                  onChange={handleFaqChange(item.id)}
                  elevation={0}
                  disableGutters
                  sx={{
                    mb: 1.5,
                    borderRadius: "12px !important",
                    border: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
                    "&:before": { display: "none" },
                    "&.Mui-expanded": {
                      borderColor: alpha(theme.palette.primary.main, 0.2),
                      boxShadow: `0 4px 16px ${alpha(theme.palette.primary.main, 0.06)}`,
                    },
                    overflow: "hidden",
                  }}
                >
                  <AccordionSummary
                    expandIcon={
                      <ExpandMoreIcon
                        sx={{ color: theme.palette.primary.main }}
                      />
                    }
                    sx={{
                      px: 3,
                      py: 0.5,
                      "& .MuiAccordionSummary-content": { my: 1.5 },
                    }}
                  >
                    <Typography
                      variant="subtitle1"
                      component="h3"
                      sx={{ fontWeight: 700, letterSpacing: "-0.01em" }}
                    >
                      {item.question}
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails sx={{ px: 3, pb: 3, pt: 0 }}>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ lineHeight: 1.75 }}
                    >
                      {item.answer}
                    </Typography>
                  </AccordionDetails>
                </Accordion>
              ))}
            </Box>

            {/* Still have questions? CTA */}
            <Alert
              severity="info"
              icon={<EmailIcon />}
              sx={{
                mt: 4,
                maxWidth: 760,
                mx: "auto",
                borderRadius: 3,
                "& .MuiAlert-message": { width: "100%" },
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: 1.5,
                }}
              >
                <Box>
                  <Typography
                    variant="subtitle2"
                    component="p"
                    sx={{ fontWeight: 700, mb: 0.25 }}
                  >
                    {t("contact.cta_title")}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.85 }}>
                    {t("contact.cta_subtitle")}
                  </Typography>
                </Box>
                <Button
                  variant="contained"
                  size="small"
                  href={`mailto:${t("app.support_email")}`}
                  sx={{
                    borderRadius: 2,
                    textTransform: "none",
                    fontWeight: 600,
                    flexShrink: 0,
                  }}
                >
                  {t("contact.cta_button")}
                </Button>
              </Box>
            </Alert>
          </Box>
        </Container>
      </Box>

      <BookDemoDialog
        open={bookDemoDialogOpen}
        onClose={() => setBookDemoDialogOpen(false)}
      />
    </>
  );
};

export default ContactPage;
