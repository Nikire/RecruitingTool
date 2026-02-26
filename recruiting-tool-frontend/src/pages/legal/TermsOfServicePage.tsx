import { Box, Container, Typography, Divider, Link } from "@mui/material";
import { useTranslation } from "react-i18next";

const TermsOfServicePage = () => {
  const { t } = useTranslation();

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h3"
          component="h1"
          gutterBottom
          sx={{ fontWeight: 700, mb: 2 }}
        >
          {t("legal.terms.title")}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          {t("legal.terms.effective_date")}
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          {t("legal.terms.last_updated")}
        </Typography>
      </Box>

      <Divider sx={{ mb: 4 }} />

      {/* Introduction */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
          {t("legal.terms.introduction.title")}
        </Typography>
        <Typography variant="body1" paragraph>
          {t("legal.terms.introduction.content")}
        </Typography>
      </Box>

      {/* Acceptance of Terms */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
          {t("legal.terms.acceptance.title")}
        </Typography>
        <Typography variant="body1" paragraph>
          {t("legal.terms.acceptance.content")}
        </Typography>
      </Box>

      {/* User Accounts */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
          {t("legal.terms.user_accounts.title")}
        </Typography>
        <Typography variant="body1" paragraph>
          {t("legal.terms.user_accounts.content")}
        </Typography>
        <Box component="ul" sx={{ pl: 4, mb: 2 }}>
          <Typography component="li" variant="body1" paragraph>
            {t("legal.terms.user_accounts.responsibility_1")}
          </Typography>
          <Typography component="li" variant="body1" paragraph>
            {t("legal.terms.user_accounts.responsibility_2")}
          </Typography>
          <Typography component="li" variant="body1" paragraph>
            {t("legal.terms.user_accounts.responsibility_3")}
          </Typography>
        </Box>
      </Box>

      {/* Services Provided */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
          {t("legal.terms.services.title")}
        </Typography>
        <Typography variant="body1" paragraph>
          {t("legal.terms.services.content")}
        </Typography>
      </Box>

      {/* Subscription and Payment */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
          {t("legal.terms.payment.title")}
        </Typography>
        <Typography variant="body1" paragraph>
          {t("legal.terms.payment.content")}
        </Typography>
        <Box component="ul" sx={{ pl: 4, mb: 2 }}>
          <Typography component="li" variant="body1" paragraph>
            {t("legal.terms.payment.item_1")}
          </Typography>
          <Typography component="li" variant="body1" paragraph>
            {t("legal.terms.payment.item_2")}
          </Typography>
          <Typography component="li" variant="body1" paragraph>
            {t("legal.terms.payment.item_3")}
          </Typography>
        </Box>
      </Box>

      {/* User Conduct */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
          {t("legal.terms.conduct.title")}
        </Typography>
        <Typography variant="body1" paragraph>
          {t("legal.terms.conduct.content")}
        </Typography>
        <Box component="ul" sx={{ pl: 4, mb: 2 }}>
          <Typography component="li" variant="body1" paragraph>
            {t("legal.terms.conduct.prohibited_1")}
          </Typography>
          <Typography component="li" variant="body1" paragraph>
            {t("legal.terms.conduct.prohibited_2")}
          </Typography>
          <Typography component="li" variant="body1" paragraph>
            {t("legal.terms.conduct.prohibited_3")}
          </Typography>
          <Typography component="li" variant="body1" paragraph>
            {t("legal.terms.conduct.prohibited_4")}
          </Typography>
        </Box>
      </Box>

      {/* Intellectual Property */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
          {t("legal.terms.intellectual_property.title")}
        </Typography>
        <Typography variant="body1" paragraph>
          {t("legal.terms.intellectual_property.content")}
        </Typography>
      </Box>

      {/* Data Privacy */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
          {t("legal.terms.data_privacy.title")}
        </Typography>
        <Typography variant="body1" paragraph>
          {t("legal.terms.data_privacy.content")}{" "}
          <Link href="/privacy" color="primary" underline="hover">
            {t("legal.terms.data_privacy.privacy_link")}
          </Link>
          .
        </Typography>
      </Box>

      {/* Termination */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
          {t("legal.terms.termination.title")}
        </Typography>
        <Typography variant="body1" paragraph>
          {t("legal.terms.termination.content")}
        </Typography>
      </Box>

      {/* Limitation of Liability */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
          {t("legal.terms.liability.title")}
        </Typography>
        <Typography variant="body1" paragraph>
          {t("legal.terms.liability.content")}
        </Typography>
      </Box>

      {/* Changes to Terms */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
          {t("legal.terms.changes.title")}
        </Typography>
        <Typography variant="body1" paragraph>
          {t("legal.terms.changes.content")}
        </Typography>
      </Box>

      {/* Contact Information */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
          {t("legal.terms.contact.title")}
        </Typography>
        <Typography variant="body1" paragraph>
          {t("legal.terms.contact.content")}
        </Typography>
        <Typography variant="body1" paragraph>
          <strong>{t("legal.terms.contact.email_label")}:</strong>{" "}
          <Link
            href={`mailto:${t("app.legal_email")}`}
            color="primary"
            underline="hover"
          >
            {t("app.legal_email")}
          </Link>
        </Typography>
      </Box>
    </Container>
  );
};

export default TermsOfServicePage;
