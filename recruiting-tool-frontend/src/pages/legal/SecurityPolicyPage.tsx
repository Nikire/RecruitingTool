import { Box, Container, Typography, Divider, Link, Alert } from '@mui/material';
import { useTranslation } from 'react-i18next';
import ShieldIcon from '@mui/icons-material/Shield';

const SecurityPolicyPage = () => {
  const { t } = useTranslation();

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h3"
          component="h1"
          gutterBottom
          sx={{ fontWeight: 700, mb: 2, display: 'flex', alignItems: 'center', gap: 2 }}
        >
          <ShieldIcon sx={{ fontSize: 48, color: 'primary.main' }} />
          {t('legal.security.title')}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          {t('legal.security.effective_date')}
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          {t('legal.security.last_updated')}
        </Typography>
      </Box>

      <Alert severity="info" sx={{ mb: 4 }}>
        {t('legal.security.commitment_notice')}
      </Alert>

      <Divider sx={{ mb: 4 }} />

      {/* Introduction */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
          {t('legal.security.introduction.title')}
        </Typography>
        <Typography variant="body1" paragraph>
          {t('legal.security.introduction.content')}
        </Typography>
      </Box>

      {/* Data Encryption */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
          {t('legal.security.encryption.title')}
        </Typography>
        <Typography variant="body1" paragraph>
          {t('legal.security.encryption.content')}
        </Typography>
        <Box component="ul" sx={{ pl: 4, mb: 2 }}>
          <Typography component="li" variant="body1" paragraph>
            {t('legal.security.encryption.measure_1')}
          </Typography>
          <Typography component="li" variant="body1" paragraph>
            {t('legal.security.encryption.measure_2')}
          </Typography>
          <Typography component="li" variant="body1" paragraph>
            {t('legal.security.encryption.measure_3')}
          </Typography>
        </Box>
      </Box>

      {/* Access Controls */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
          {t('legal.security.access_controls.title')}
        </Typography>
        <Typography variant="body1" paragraph>
          {t('legal.security.access_controls.content')}
        </Typography>
        <Box component="ul" sx={{ pl: 4, mb: 2 }}>
          <Typography component="li" variant="body1" paragraph>
            {t('legal.security.access_controls.control_1')}
          </Typography>
          <Typography component="li" variant="body1" paragraph>
            {t('legal.security.access_controls.control_2')}
          </Typography>
          <Typography component="li" variant="body1" paragraph>
            {t('legal.security.access_controls.control_3')}
          </Typography>
          <Typography component="li" variant="body1" paragraph>
            {t('legal.security.access_controls.control_4')}
          </Typography>
        </Box>
      </Box>

      {/* Infrastructure Security */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
          {t('legal.security.infrastructure.title')}
        </Typography>
        <Typography variant="body1" paragraph>
          {t('legal.security.infrastructure.content')}
        </Typography>
        <Box component="ul" sx={{ pl: 4, mb: 2 }}>
          <Typography component="li" variant="body1" paragraph>
            {t('legal.security.infrastructure.measure_1')}
          </Typography>
          <Typography component="li" variant="body1" paragraph>
            {t('legal.security.infrastructure.measure_2')}
          </Typography>
          <Typography component="li" variant="body1" paragraph>
            {t('legal.security.infrastructure.measure_3')}
          </Typography>
          <Typography component="li" variant="body1" paragraph>
            {t('legal.security.infrastructure.measure_4')}
          </Typography>
        </Box>
      </Box>

      {/* Application Security */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
          {t('legal.security.application_security.title')}
        </Typography>
        <Typography variant="body1" paragraph>
          {t('legal.security.application_security.content')}
        </Typography>
        <Box component="ul" sx={{ pl: 4, mb: 2 }}>
          <Typography component="li" variant="body1" paragraph>
            {t('legal.security.application_security.practice_1')}
          </Typography>
          <Typography component="li" variant="body1" paragraph>
            {t('legal.security.application_security.practice_2')}
          </Typography>
          <Typography component="li" variant="body1" paragraph>
            {t('legal.security.application_security.practice_3')}
          </Typography>
          <Typography component="li" variant="body1" paragraph>
            {t('legal.security.application_security.practice_4')}
          </Typography>
        </Box>
      </Box>

      {/* Data Backup and Recovery */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
          {t('legal.security.backup.title')}
        </Typography>
        <Typography variant="body1" paragraph>
          {t('legal.security.backup.content')}
        </Typography>
      </Box>

      {/* Incident Response */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
          {t('legal.security.incident_response.title')}
        </Typography>
        <Typography variant="body1" paragraph>
          {t('legal.security.incident_response.content')}
        </Typography>
        <Box component="ul" sx={{ pl: 4, mb: 2 }}>
          <Typography component="li" variant="body1" paragraph>
            {t('legal.security.incident_response.step_1')}
          </Typography>
          <Typography component="li" variant="body1" paragraph>
            {t('legal.security.incident_response.step_2')}
          </Typography>
          <Typography component="li" variant="body1" paragraph>
            {t('legal.security.incident_response.step_3')}
          </Typography>
          <Typography component="li" variant="body1" paragraph>
            {t('legal.security.incident_response.step_4')}
          </Typography>
        </Box>
      </Box>

      {/* Employee Training */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
          {t('legal.security.employee_training.title')}
        </Typography>
        <Typography variant="body1" paragraph>
          {t('legal.security.employee_training.content')}
        </Typography>
      </Box>

      {/* Third-Party Security */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
          {t('legal.security.third_party.title')}
        </Typography>
        <Typography variant="body1" paragraph>
          {t('legal.security.third_party.content')}
        </Typography>
      </Box>

      {/* Compliance */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
          {t('legal.security.compliance.title')}
        </Typography>
        <Typography variant="body1" paragraph>
          {t('legal.security.compliance.content')}
        </Typography>
        <Box component="ul" sx={{ pl: 4, mb: 2 }}>
          <Typography component="li" variant="body1" paragraph>
            {t('legal.security.compliance.standard_1')}
          </Typography>
          <Typography component="li" variant="body1" paragraph>
            {t('legal.security.compliance.standard_2')}
          </Typography>
          <Typography component="li" variant="body1" paragraph>
            {t('legal.security.compliance.standard_3')}
          </Typography>
        </Box>
      </Box>

      {/* Your Responsibilities */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
          {t('legal.security.user_responsibilities.title')}
        </Typography>
        <Typography variant="body1" paragraph>
          {t('legal.security.user_responsibilities.content')}
        </Typography>
        <Box component="ul" sx={{ pl: 4, mb: 2 }}>
          <Typography component="li" variant="body1" paragraph>
            {t('legal.security.user_responsibilities.responsibility_1')}
          </Typography>
          <Typography component="li" variant="body1" paragraph>
            {t('legal.security.user_responsibilities.responsibility_2')}
          </Typography>
          <Typography component="li" variant="body1" paragraph>
            {t('legal.security.user_responsibilities.responsibility_3')}
          </Typography>
          <Typography component="li" variant="body1" paragraph>
            {t('legal.security.user_responsibilities.responsibility_4')}
          </Typography>
        </Box>
      </Box>

      {/* Reporting Security Issues */}
      <Box sx={{ mb: 4 }}>
        <Alert severity="warning" sx={{ mb: 2 }}>
          {t('legal.security.reporting.alert')}
        </Alert>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
          {t('legal.security.reporting.title')}
        </Typography>
        <Typography variant="body1" paragraph>
          {t('legal.security.reporting.content')}
        </Typography>
        <Typography variant="body1" paragraph>
          <strong>{t('legal.security.reporting.email_label')}:</strong>{' '}
          <Link href="mailto:security@recruitingtool.com" color="primary" underline="hover">
            security@recruitingtool.com
          </Link>
        </Typography>
      </Box>

      {/* Updates to Security Policy */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
          {t('legal.security.updates.title')}
        </Typography>
        <Typography variant="body1" paragraph>
          {t('legal.security.updates.content')}
        </Typography>
      </Box>
    </Container>
  );
};

export default SecurityPolicyPage;
