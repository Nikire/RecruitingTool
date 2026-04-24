import { Box, Typography, Slider, Alert, Button, Stack } from "@mui/material";
import { Tune as TuneIcon } from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import { useState, useEffect } from "react";
import SettingsCard from "./SettingsCard";
import {
  useGetScoringWeights,
  useUpdateScoringWeights,
} from "../../hooks/api/useAi";

/**
 * AIScoringWeightsCard - Configure AI scoring dimension weights per company.
 *
 * Shows 3 sliders (Skills, Experience, Education) with a live sum indicator.
 * Save is disabled unless the weights sum exactly to 100.
 */
const AIScoringWeightsCard: React.FC = () => {
  const { t } = useTranslation();
  const { data: weights, isLoading } = useGetScoringWeights();
  const { mutate: updateWeights, isPending } = useUpdateScoringWeights();

  const [skills, setSkills] = useState(40);
  const [experience, setExperience] = useState(35);
  const [education, setEducation] = useState(25);

  useEffect(() => {
    if (weights) {
      setSkills(weights.skillsWeight);
      setExperience(weights.experienceWeight);
      setEducation(weights.educationWeight);
    }
  }, [weights]);

  const total = skills + experience + education;
  const isValid = total === 100;

  const handleSave = () => {
    updateWeights({
      skillsWeight: skills,
      experienceWeight: experience,
      educationWeight: education,
    });
  };

  return (
    <SettingsCard
      icon={<TuneIcon />}
      title={t("aiScoringWeights.title")}
      iconColor="secondary.main"
    >
      <Stack spacing={3}>
        <Typography variant="body2" color="text.secondary">
          {t("aiScoringWeights.description")}
        </Typography>

        {isLoading ? (
          <Typography variant="body2" color="text.secondary">
            {t("common.loading")}
          </Typography>
        ) : (
          <>
            {/* Skills slider */}
            <Box>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  mb: 0.5,
                }}
              >
                <Typography variant="body2" fontWeight={500}>
                  {t("aiScoringWeights.skills")}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {skills}%
                </Typography>
              </Box>
              <Slider
                value={skills}
                onChange={(_, val) => setSkills(val as number)}
                min={0}
                max={100}
                step={1}
                color="primary"
              />
            </Box>

            {/* Experience slider */}
            <Box>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  mb: 0.5,
                }}
              >
                <Typography variant="body2" fontWeight={500}>
                  {t("aiScoringWeights.experience")}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {experience}%
                </Typography>
              </Box>
              <Slider
                value={experience}
                onChange={(_, val) => setExperience(val as number)}
                min={0}
                max={100}
                step={1}
                color="primary"
              />
            </Box>

            {/* Education slider */}
            <Box>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  mb: 0.5,
                }}
              >
                <Typography variant="body2" fontWeight={500}>
                  {t("aiScoringWeights.education")}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {education}%
                </Typography>
              </Box>
              <Slider
                value={education}
                onChange={(_, val) => setEducation(val as number)}
                min={0}
                max={100}
                step={1}
                color="primary"
              />
            </Box>

            {/* Total indicator */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Typography variant="body2" fontWeight={600}>
                {t("aiScoringWeights.total")}
              </Typography>
              <Typography
                variant="body2"
                fontWeight={700}
                color={isValid ? "success.main" : "error.main"}
              >
                {total}%
              </Typography>
            </Box>

            {!isValid && (
              <Alert severity="warning" sx={{ py: 0.5 }}>
                <Typography variant="body2">
                  {t("aiScoringWeights.totalMustBe100")}
                </Typography>
              </Alert>
            )}

            <Button
              variant="contained"
              color="primary"
              disabled={!isValid || isPending}
              onClick={handleSave}
              sx={{ alignSelf: "flex-start" }}
            >
              {t("aiScoringWeights.save")}
            </Button>
          </>
        )}
      </Stack>
    </SettingsCard>
  );
};

export default AIScoringWeightsCard;
