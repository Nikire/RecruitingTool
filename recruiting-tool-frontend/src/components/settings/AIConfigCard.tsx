import { Box, Typography, Chip, Alert, Button, Stack } from "@mui/material";
import {
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  OpenInNew as OpenInNewIcon,
} from "@mui/icons-material";
import { Psychology as PsychologyIcon } from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import SettingsCard from "./SettingsCard";
import StatusIndicator from "./StatusIndicator";

/**
 * AI settings data shape returned by the system settings API.
 */
export interface AISettings {
  /** AI model name (e.g. 'gemini-1.5-flash') */
  model: string;
  /** AI service tier (e.g. 'free', 'paid') */
  tier: string;
}

export interface AIConfigCardProps {
  /** AI settings object from the system settings API response */
  aiSettings: AISettings | undefined;
  /** Whether the parent query is still loading */
  isLoading: boolean;
}

/**
 * Map a model string to a human-readable provider + label.
 * Extend this record as new providers are added.
 */
function resolveModelLabel(model: string): string {
  const lower = model.toLowerCase();
  if (lower.startsWith("gemini")) return `Google Gemini — ${model}`;
  if (lower.startsWith("gpt") || lower.startsWith("openai"))
    return `OpenAI — ${model}`;
  if (lower.startsWith("claude")) return `Anthropic — ${model}`;
  return model;
}

/**
 * Derive a display-friendly provider name from the model string.
 */
function resolveProvider(model: string): string {
  const lower = model.toLowerCase();
  if (lower.startsWith("gemini")) return "Google";
  if (lower.startsWith("gpt") || lower.startsWith("openai")) return "OpenAI";
  if (lower.startsWith("claude")) return "Anthropic";
  return model;
}

/**
 * AIConfigCard - Displays AI configuration details within the System Settings page.
 *
 * @description
 * Shows provider info, model chip with human-readable label, API key status,
 * an env-variable info alert, and a shortcut to the Feature Flags page.
 *
 * All text is internationalised via useTranslation().
 */
const AIConfigCard: React.FC<AIConfigCardProps> = ({
  aiSettings,
  isLoading,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const hasModel = Boolean(aiSettings?.model);
  const isConfigured = hasModel;
  const provider = hasModel ? resolveProvider(aiSettings!.model) : null;
  const modelLabel = hasModel ? resolveModelLabel(aiSettings!.model) : null;

  return (
    <SettingsCard
      icon={<PsychologyIcon />}
      title={t("settings.ai_configuration")}
      iconColor="secondary.main"
    >
      <Stack spacing={2}>
        {/* API Key Status */}
        <Box>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {t("settings.ai_key_status")}
          </Typography>
          {isLoading ? (
            <Typography variant="body2" color="text.secondary">
              {t("common.loading")}
            </Typography>
          ) : (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              {isConfigured ? (
                <>
                  <CheckCircleIcon
                    fontSize="small"
                    sx={{ color: "success.main" }}
                  />
                  <Typography variant="body2" color="success.main">
                    {t("settings.ai_key_configured")}
                  </Typography>
                </>
              ) : (
                <>
                  <CancelIcon fontSize="small" sx={{ color: "error.main" }} />
                  <Typography variant="body2" color="error.main">
                    {t("settings.ai_key_not_configured")}
                  </Typography>
                </>
              )}
            </Box>
          )}
        </Box>

        {/* AI Provider */}
        {provider && (
          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {t("settings.ai_provider")}
            </Typography>
            <Typography variant="body1">{provider}</Typography>
          </Box>
        )}

        {/* AI Model */}
        <Box>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {t("settings.ai_model")}
          </Typography>
          {modelLabel ? (
            <Chip
              label={modelLabel}
              size="small"
              color="secondary"
              sx={{ fontFamily: "monospace" }}
            />
          ) : (
            <StatusIndicator
              status="warning"
              label="settings.status_not_configured"
              size="small"
            />
          )}
        </Box>

        {/* AI Tier */}
        <Box>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {t("settings.ai_tier")}
          </Typography>
          <Chip
            label={aiSettings?.tier ?? t("common.n_a")}
            size="small"
            variant="outlined"
            sx={{ fontFamily: "monospace" }}
          />
        </Box>

        {/* Environment Variables Note */}
        <Alert severity="info" icon={false} sx={{ py: 0.5 }}>
          <Typography variant="body2">{t("settings.ai_env_note")}</Typography>
        </Alert>

        {/* Feature Flags Link */}
        <Box>
          <Button
            size="small"
            variant="outlined"
            color="secondary"
            endIcon={<OpenInNewIcon fontSize="small" />}
            onClick={() => navigate("/admin/feature-flags")}
          >
            {t("settings.ai_feature_flags_link")}
          </Button>
        </Box>
      </Stack>
    </SettingsCard>
  );
};

export default AIConfigCard;
