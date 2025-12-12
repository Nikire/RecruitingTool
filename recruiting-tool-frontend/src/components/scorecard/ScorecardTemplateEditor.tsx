/**
 * ScorecardTemplateEditor Component
 * Create/edit scorecard templates with categories and criteria
 */

import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  IconButton,
  Alert,
  Chip,
  Divider,
} from "@mui/material";
import {
  ExpandMore as ExpandMoreIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import {
  ScorecardTemplate,
  CreateCategoryDto,
  CreateCriterionDto,
} from "../../types/scorecard";

interface ScorecardTemplateEditorProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: {
    name: string;
    description?: string;
    categories: CreateCategoryDto[];
  }) => Promise<void>;
  template?: ScorecardTemplate | null;
  isSaving?: boolean;
}

interface CategoryForm extends CreateCategoryDto {
  tempId: string;
}

interface CriterionForm extends CreateCriterionDto {
  tempId: string;
}

const ScorecardTemplateEditor: React.FC<ScorecardTemplateEditorProps> = ({
  open,
  onClose,
  onSave,
  template,
  isSaving,
}) => {
  const { t } = useTranslation();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [categories, setCategories] = useState<CategoryForm[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Initialize form with template data if editing
  useEffect(() => {
    if (template) {
      setName(template.name);
      setDescription(template.description || "");
      setCategories(
        template.categories.map((cat) => ({
          ...cat,
          tempId: cat.uid,
          criteria: cat.criteria.map((crit) => ({
            ...crit,
            tempId: crit.uid,
          })),
        })),
      );
    } else {
      resetForm();
    }
  }, [template, open]);

  const resetForm = () => {
    setName("");
    setDescription("");
    setCategories([]);
    setErrors({});
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const addCategory = () => {
    const newCategory: CategoryForm = {
      tempId: `temp-cat-${Date.now()}`,
      name: "",
      weight: 0,
      criteria: [],
    };
    setCategories([...categories, newCategory]);
  };

  const removeCategory = (tempId: string) => {
    setCategories(categories.filter((cat) => cat.tempId !== tempId));
  };

  const updateCategory = (
    tempId: string,
    field: keyof CategoryForm,
    value: string | number,
  ) => {
    setCategories(
      categories.map((cat) =>
        cat.tempId === tempId ? { ...cat, [field]: value } : cat,
      ),
    );
  };

  const addCriterion = (categoryTempId: string) => {
    const newCriterion: CriterionForm = {
      tempId: `temp-crit-${Date.now()}`,
      name: "",
      description: "",
      maxScore: 5,
    };

    setCategories(
      categories.map((cat) =>
        cat.tempId === categoryTempId
          ? { ...cat, criteria: [...cat.criteria, newCriterion] }
          : cat,
      ),
    );
  };

  const removeCriterion = (categoryTempId: string, criterionTempId: string) => {
    setCategories(
      categories.map((cat) =>
        cat.tempId === categoryTempId
          ? {
              ...cat,
              criteria: cat.criteria.filter(
                (crit) => crit.tempId !== criterionTempId,
              ),
            }
          : cat,
      ),
    );
  };

  const updateCriterion = (
    categoryTempId: string,
    criterionTempId: string,
    field: keyof CriterionForm,
    value: string | number,
  ) => {
    setCategories(
      categories.map((cat) =>
        cat.tempId === categoryTempId
          ? {
              ...cat,
              criteria: cat.criteria.map((crit) =>
                crit.tempId === criterionTempId
                  ? { ...crit, [field]: value }
                  : crit,
              ),
            }
          : cat,
      ),
    );
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = t("validation.required");
    }

    if (categories.length === 0) {
      newErrors.categories = t("scorecard.validation.at_least_one_category");
    }

    // Validate weight totals to 100
    const totalWeight = categories.reduce(
      (sum, cat) => sum + Number(cat.weight),
      0,
    );
    if (totalWeight !== 100) {
      newErrors.weight = t("scorecard.weight_error");
    }

    // Validate each category
    categories.forEach((cat, catIndex) => {
      if (!cat.name.trim()) {
        newErrors[`category_${catIndex}_name`] = t("validation.required");
      }
      if (cat.weight <= 0 || cat.weight > 100) {
        newErrors[`category_${catIndex}_weight`] = t(
          "scorecard.validation.weight_range",
        );
      }
      if (cat.criteria.length === 0) {
        newErrors[`category_${catIndex}_criteria`] = t(
          "scorecard.validation.at_least_one_criterion",
        );
      }

      // Validate each criterion
      cat.criteria.forEach((crit, critIndex) => {
        if (!crit.name.trim()) {
          newErrors[`criterion_${catIndex}_${critIndex}_name`] = t(
            "validation.required",
          );
        }
        if (crit.maxScore <= 0) {
          newErrors[`criterion_${catIndex}_${critIndex}_maxScore`] = t(
            "validation.positive_number",
          );
        }
      });
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    await onSave({
      name,
      description,
      categories: categories.map((cat) => ({
        name: cat.name,
        weight: Number(cat.weight),
        criteria: cat.criteria.map((crit) => ({
          name: crit.name,
          description: crit.description,
          maxScore: Number(crit.maxScore),
        })),
      })),
    });

    handleClose();
  };

  const getTotalWeight = () => {
    return categories.reduce((sum, cat) => sum + Number(cat.weight || 0), 0);
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {template
          ? t("scorecard.edit_template")
          : t("scorecard.create_template")}
      </DialogTitle>

      <DialogContent>
        {/* Template Name */}
        <TextField
          label={t("scorecard.template_name")}
          value={name}
          onChange={(e) => setName(e.target.value)}
          fullWidth
          margin="normal"
          required
          error={!!errors.name}
          helperText={errors.name}
        />

        {/* Description */}
        <TextField
          label={t("scorecard.description")}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          fullWidth
          margin="normal"
          multiline
          rows={2}
        />

        <Divider sx={{ my: 3 }} />

        {/* Weight Summary */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Typography variant="subtitle1">
            {t("scorecard.categories")}
          </Typography>
          <Chip
            label={t("scorecard.total_weight", { weight: getTotalWeight() })}
            color={getTotalWeight() === 100 ? "success" : "error"}
            size="small"
          />
        </Box>

        {errors.weight && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {errors.weight}
          </Alert>
        )}

        {errors.categories && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {errors.categories}
          </Alert>
        )}

        {/* Categories */}
        <Box sx={{ mb: 2 }}>
          {categories.map((category, catIndex) => (
            <Accordion key={category.tempId} defaultExpanded>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    width: "100%",
                    mr: 1,
                  }}
                >
                  <Typography>
                    {category.name ||
                      t("scorecard.category_placeholder", {
                        index: catIndex + 1,
                      })}
                  </Typography>
                  <Chip label={`${category.weight}%`} size="small" />
                </Box>
              </AccordionSummary>

              <AccordionDetails>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  {/* Category Name */}
                  <TextField
                    label={t("scorecard.category_name")}
                    value={category.name}
                    onChange={(e) =>
                      updateCategory(category.tempId, "name", e.target.value)
                    }
                    fullWidth
                    size="small"
                    required
                    error={!!errors[`category_${catIndex}_name`]}
                    helperText={errors[`category_${catIndex}_name`]}
                  />

                  {/* Category Weight */}
                  <TextField
                    label={t("scorecard.weight")}
                    type="number"
                    value={category.weight}
                    onChange={(e) =>
                      updateCategory(
                        category.tempId,
                        "weight",
                        Number(e.target.value),
                      )
                    }
                    fullWidth
                    size="small"
                    required
                    inputProps={{ min: 0, max: 100 }}
                    error={!!errors[`category_${catIndex}_weight`]}
                    helperText={
                      errors[`category_${catIndex}_weight`] ||
                      t("scorecard.weight_help")
                    }
                  />

                  {/* Criteria */}
                  <Box>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        mb: 1,
                      }}
                    >
                      <Typography variant="subtitle2">
                        {t("scorecard.criteria")}
                      </Typography>
                      <Button
                        size="small"
                        startIcon={<AddIcon />}
                        onClick={() => addCriterion(category.tempId)}
                      >
                        {t("scorecard.add_criterion")}
                      </Button>
                    </Box>

                    {errors[`category_${catIndex}_criteria`] && (
                      <Alert severity="error" sx={{ mb: 1 }}>
                        {errors[`category_${catIndex}_criteria`]}
                      </Alert>
                    )}

                    {category.criteria.map((criterion, critIndex) => (
                      <Box
                        key={criterion.tempId}
                        sx={{
                          p: 2,
                          mb: 1,
                          border: "1px solid",
                          borderColor: "divider",
                          borderRadius: 1,
                        }}
                      >
                        <Box sx={{ display: "flex", gap: 1, mb: 1 }}>
                          <TextField
                            label={t("scorecard.criterion_name")}
                            value={criterion.name}
                            onChange={(e) =>
                              updateCriterion(
                                category.tempId,
                                criterion.tempId,
                                "name",
                                e.target.value,
                              )
                            }
                            size="small"
                            required
                            sx={{ flex: 2 }}
                            error={
                              !!errors[
                                `criterion_${catIndex}_${critIndex}_name`
                              ]
                            }
                            helperText={
                              errors[`criterion_${catIndex}_${critIndex}_name`]
                            }
                          />

                          <TextField
                            label={t("scorecard.max_score")}
                            type="number"
                            value={criterion.maxScore}
                            onChange={(e) =>
                              updateCriterion(
                                category.tempId,
                                criterion.tempId,
                                "maxScore",
                                Number(e.target.value),
                              )
                            }
                            size="small"
                            required
                            inputProps={{ min: 1, max: 10 }}
                            sx={{ flex: 1 }}
                            error={
                              !!errors[
                                `criterion_${catIndex}_${critIndex}_maxScore`
                              ]
                            }
                            helperText={
                              errors[
                                `criterion_${catIndex}_${critIndex}_maxScore`
                              ]
                            }
                          />

                          <IconButton
                            size="small"
                            color="error"
                            onClick={() =>
                              removeCriterion(category.tempId, criterion.tempId)
                            }
                            aria-label={t("scorecard.remove_criterion")}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Box>

                        <TextField
                          label={t("scorecard.criterion_description")}
                          value={criterion.description}
                          onChange={(e) =>
                            updateCriterion(
                              category.tempId,
                              criterion.tempId,
                              "description",
                              e.target.value,
                            )
                          }
                          fullWidth
                          size="small"
                          multiline
                          rows={2}
                        />
                      </Box>
                    ))}
                  </Box>

                  {/* Remove Category Button */}
                  <Button
                    color="error"
                    startIcon={<DeleteIcon />}
                    onClick={() => removeCategory(category.tempId)}
                  >
                    {t("scorecard.remove_category")}
                  </Button>
                </Box>
              </AccordionDetails>
            </Accordion>
          ))}

          {/* Add Category Button */}
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={addCategory}
            fullWidth
            sx={{ mt: 2 }}
          >
            {t("scorecard.add_category")}
          </Button>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} disabled={isSaving}>
          {t("common.cancel")}
        </Button>
        <Button onClick={handleSubmit} variant="contained" disabled={isSaving}>
          {isSaving ? t("common.saving") : t("common.save")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ScorecardTemplateEditor;
