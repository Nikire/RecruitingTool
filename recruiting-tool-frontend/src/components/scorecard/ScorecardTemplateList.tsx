/**
 * ScorecardTemplateList Component
 * Displays list of scorecard templates with create/edit/delete actions
 */

import React from "react";
import { useTranslation } from "react-i18next";
import {
  Box,
  Button,
  Card,
  CardContent,
  CardActions,
  Typography,
  Grid,
  IconButton,
  CircularProgress,
  Chip,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Description as DescriptionIcon,
} from "@mui/icons-material";
import { ScorecardTemplate } from "../../types/scorecard";

interface ScorecardTemplateListProps {
  templates: ScorecardTemplate[];
  isLoading?: boolean;
  onCreateClick: () => void;
  onEditClick: (template: ScorecardTemplate) => void;
  onDeleteClick: (template: ScorecardTemplate) => void;
}

const ScorecardTemplateList: React.FC<ScorecardTemplateListProps> = ({
  templates,
  isLoading,
  onCreateClick,
  onEditClick,
  onDeleteClick,
}) => {
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "400px",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  const getTotalCriteria = (template: ScorecardTemplate): number => {
    return template.categories.reduce(
      (total, cat) => total + cat.criteria.length,
      0,
    );
  };

  return (
    <Box>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h5" component="h2">
          {t("scorecard.templates")}
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={onCreateClick}
        >
          {t("scorecard.create_template")}
        </Button>
      </Box>

      {/* Empty State */}
      {templates.length === 0 ? (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            py: 8,
            gap: 2,
          }}
        >
          <DescriptionIcon sx={{ fontSize: 80, color: "text.disabled" }} />
          <Typography variant="h6" color="textSecondary">
            {t("scorecard.no_templates")}
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={onCreateClick}
          >
            {t("scorecard.create_first_template")}
          </Button>
        </Box>
      ) : (
        /* Template Cards Grid */
        <Grid container spacing={3}>
          {templates.map((template) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={template.uid}>
              <Card
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  transition: "box-shadow 0.3s",
                  "&:hover": {
                    boxShadow: 3,
                  },
                }}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  {/* Template Name */}
                  <Typography variant="h6" gutterBottom>
                    {template.name}
                  </Typography>

                  {/* Description */}
                  {template.description && (
                    <Typography
                      variant="body2"
                      color="textSecondary"
                      sx={{ mb: 2, minHeight: "40px" }}
                    >
                      {template.description}
                    </Typography>
                  )}

                  {/* Stats */}
                  <Box
                    sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 1 }}
                  >
                    <Chip
                      label={t("scorecard.categories_count", {
                        count: template.categories.length,
                      })}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                    <Chip
                      label={t("scorecard.criteria_count", {
                        count: getTotalCriteria(template),
                      })}
                      size="small"
                      color="secondary"
                      variant="outlined"
                    />
                  </Box>

                  {/* Created info */}
                  <Typography variant="caption" color="textSecondary">
                    {t("scorecard.created_by", {
                      name: template.createdByName || t("common.unknown"),
                    })}
                  </Typography>
                </CardContent>

                {/* Actions */}
                <CardActions sx={{ justifyContent: "flex-end", pt: 0 }}>
                  <IconButton
                    size="small"
                    onClick={() => onEditClick(template)}
                    aria-label={t("aria.edit_item", { item: template.name })}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => onDeleteClick(template)}
                    aria-label={t("aria.delete_item", { item: template.name })}
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default ScorecardTemplateList;
