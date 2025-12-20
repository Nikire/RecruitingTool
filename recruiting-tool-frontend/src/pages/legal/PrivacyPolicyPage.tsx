import { Box, Container, Typography, Divider, Link } from "@mui/material";
import { useTranslation } from "react-i18next";

const PrivacyPolicyPage = () => {
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
          {t("legal.privacy.title")}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          {t("legal.privacy.effective_date")}
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          {t("legal.privacy.last_updated")}
        </Typography>
      </Box>

      <Divider sx={{ mb: 4 }} />

      {/* Introduction */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
          {t("legal.privacy.introduction.title")}
        </Typography>
        <Typography variant="body1" paragraph>
          {t("legal.privacy.introduction.content")}
        </Typography>
      </Box>

      {/* Information We Collect */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
          {t("legal.privacy.information_collected.title")}
        </Typography>
        <Typography variant="body1" paragraph>
          {t("legal.privacy.information_collected.content")}
        </Typography>

        <Typography
          variant="h6"
          gutterBottom
          sx={{ fontWeight: 600, mt: 3, mb: 1 }}
        >
          {t("legal.privacy.information_collected.personal_info.title")}
        </Typography>
        <Box component="ul" sx={{ pl: 4, mb: 2 }}>
          <Typography component="li" variant="body1" paragraph>
            {t("legal.privacy.information_collected.personal_info.item_1")}
          </Typography>
          <Typography component="li" variant="body1" paragraph>
            {t("legal.privacy.information_collected.personal_info.item_2")}
          </Typography>
          <Typography component="li" variant="body1" paragraph>
            {t("legal.privacy.information_collected.personal_info.item_3")}
          </Typography>
        </Box>

        <Typography
          variant="h6"
          gutterBottom
          sx={{ fontWeight: 600, mt: 3, mb: 1 }}
        >
          {t("legal.privacy.information_collected.usage_data.title")}
        </Typography>
        <Box component="ul" sx={{ pl: 4, mb: 2 }}>
          <Typography component="li" variant="body1" paragraph>
            {t("legal.privacy.information_collected.usage_data.item_1")}
          </Typography>
          <Typography component="li" variant="body1" paragraph>
            {t("legal.privacy.information_collected.usage_data.item_2")}
          </Typography>
          <Typography component="li" variant="body1" paragraph>
            {t("legal.privacy.information_collected.usage_data.item_3")}
          </Typography>
        </Box>
      </Box>

      {/* How We Use Your Information */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
          {t("legal.privacy.how_we_use.title")}
        </Typography>
        <Typography variant="body1" paragraph>
          {t("legal.privacy.how_we_use.content")}
        </Typography>
        <Box component="ul" sx={{ pl: 4, mb: 2 }}>
          <Typography component="li" variant="body1" paragraph>
            {t("legal.privacy.how_we_use.purpose_1")}
          </Typography>
          <Typography component="li" variant="body1" paragraph>
            {t("legal.privacy.how_we_use.purpose_2")}
          </Typography>
          <Typography component="li" variant="body1" paragraph>
            {t("legal.privacy.how_we_use.purpose_3")}
          </Typography>
          <Typography component="li" variant="body1" paragraph>
            {t("legal.privacy.how_we_use.purpose_4")}
          </Typography>
          <Typography component="li" variant="body1" paragraph>
            {t("legal.privacy.how_we_use.purpose_5")}
          </Typography>
        </Box>
      </Box>

      {/* Data Sharing and Disclosure */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
          {t("legal.privacy.data_sharing.title")}
        </Typography>
        <Typography variant="body1" paragraph>
          {t("legal.privacy.data_sharing.content")}
        </Typography>
        <Box component="ul" sx={{ pl: 4, mb: 2 }}>
          <Typography component="li" variant="body1" paragraph>
            {t("legal.privacy.data_sharing.scenario_1")}
          </Typography>
          <Typography component="li" variant="body1" paragraph>
            {t("legal.privacy.data_sharing.scenario_2")}
          </Typography>
          <Typography component="li" variant="body1" paragraph>
            {t("legal.privacy.data_sharing.scenario_3")}
          </Typography>
        </Box>
      </Box>

      {/* Data Security */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
          {t("legal.privacy.data_security.title")}
        </Typography>
        <Typography variant="body1" paragraph>
          {t("legal.privacy.data_security.content")}{" "}
          <Link href="/security" color="primary" underline="hover">
            {t("legal.privacy.data_security.security_link")}
          </Link>
          .
        </Typography>
      </Box>

      {/* Data Retention */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
          {t("legal.privacy.data_retention.title")}
        </Typography>
        <Typography variant="body1" paragraph>
          {t("legal.privacy.data_retention.content")}
        </Typography>
      </Box>

      {/* Your Rights */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
          {t("legal.privacy.your_rights.title")}
        </Typography>
        <Typography variant="body1" paragraph>
          {t("legal.privacy.your_rights.content")}
        </Typography>
        <Box component="ul" sx={{ pl: 4, mb: 2 }}>
          <Typography component="li" variant="body1" paragraph>
            {t("legal.privacy.your_rights.right_1")}
          </Typography>
          <Typography component="li" variant="body1" paragraph>
            {t("legal.privacy.your_rights.right_2")}
          </Typography>
          <Typography component="li" variant="body1" paragraph>
            {t("legal.privacy.your_rights.right_3")}
          </Typography>
          <Typography component="li" variant="body1" paragraph>
            {t("legal.privacy.your_rights.right_4")}
          </Typography>
          <Typography component="li" variant="body1" paragraph>
            {t("legal.privacy.your_rights.right_5")}
          </Typography>
        </Box>
      </Box>

      {/* Cookies and Tracking */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
          {t("legal.privacy.cookies.title")}
        </Typography>
        <Typography variant="body1" paragraph>
          {t("legal.privacy.cookies.content")}
        </Typography>
      </Box>

      {/* Third-Party Links */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
          {t("legal.privacy.third_party_links.title")}
        </Typography>
        <Typography variant="body1" paragraph>
          {t("legal.privacy.third_party_links.content")}
        </Typography>
      </Box>

      {/* Children's Privacy */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
          {t("legal.privacy.childrens_privacy.title")}
        </Typography>
        <Typography variant="body1" paragraph>
          {t("legal.privacy.childrens_privacy.content")}
        </Typography>
      </Box>

      {/* Changes to Privacy Policy */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
          {t("legal.privacy.changes.title")}
        </Typography>
        <Typography variant="body1" paragraph>
          {t("legal.privacy.changes.content")}
        </Typography>
      </Box>

      {/* Contact Us */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
          {t("legal.privacy.contact.title")}
        </Typography>
        <Typography variant="body1" paragraph>
          {t("legal.privacy.contact.content")}
        </Typography>
        <Typography variant="body1" paragraph>
          <strong>{t("legal.privacy.contact.email_label")}:</strong>{" "}
          <Link
            href="mailto:privacy@recruitingtool.com"
            color="primary"
            underline="hover"
          >
            privacy@recruitingtool.com
          </Link>
        </Typography>
      </Box>
    </Container>
  );
};

export default PrivacyPolicyPage;
