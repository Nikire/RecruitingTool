import React, { useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  FormControlLabel,
  Checkbox,
  Typography,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { CustomQuestion, QuestionType } from "../../types/customQuestions";

interface CustomQuestionBuilderProps {
  questions: CustomQuestion[];
  onQuestionsChange: (questions: CustomQuestion[]) => void;
}

export const CustomQuestionBuilder: React.FC<CustomQuestionBuilderProps> = ({
  questions,
  onQuestionsChange,
}) => {
  const { t } = useTranslation();
  const [openDialog, setOpenDialog] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [formData, setFormData] = useState<CustomQuestion>({
    id: "",
    type: QuestionType.TEXT,
    text: "",
    required: true,
    options: [],
  });

  const handleOpenDialog = (index?: number) => {
    if (index !== undefined) {
      setEditingIndex(index);
      setFormData(questions[index]);
    } else {
      setEditingIndex(null);
      setFormData({
        id: `q${Date.now()}`,
        type: QuestionType.TEXT,
        text: "",
        required: true,
        options: [],
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingIndex(null);
  };

  const handleAddQuestion = () => {
    if (!formData.text.trim()) {
      toast.error(t("custom_questions.text_required_alert"));
      return;
    }

    if (
      (formData.type === QuestionType.MULTIPLE_CHOICE ||
        formData.type === QuestionType.CHECKBOX) &&
      (!formData.options || formData.options.length < 2)
    ) {
      toast.error(t("custom_questions.options_required_alert"));
      return;
    }

    if (editingIndex !== null) {
      const updatedQuestions = [...questions];
      updatedQuestions[editingIndex] = formData;
      onQuestionsChange(updatedQuestions);
      toast.success(t("custom_questions.question_updated"));
    } else {
      onQuestionsChange([...questions, formData]);
      toast.success(t("custom_questions.question_added"));
    }

    handleCloseDialog();
  };

  const handleDeleteQuestion = (index: number) => {
    onQuestionsChange(questions.filter((_, i) => i !== index));
  };

  const handleAddOption = (option: string) => {
    if (option.trim()) {
      setFormData({
        ...formData,
        options: [...(formData.options || []), option.trim()],
      });
    }
  };

  const handleRemoveOption = (index: number) => {
    setFormData({
      ...formData,
      options: formData.options?.filter((_, i) => i !== index),
    });
  };

  const getQuestionTypeLabel = (type: QuestionType): string => {
    switch (type) {
      case QuestionType.TEXT:
        return t("custom_questions.short_text");
      case QuestionType.TEXTAREA:
        return t("custom_questions.long_text");
      case QuestionType.MULTIPLE_CHOICE:
        return t("custom_questions.multiple_choice");
      case QuestionType.CHECKBOX:
        return t("custom_questions.checkboxes");
      default:
        return type;
    }
  };

  return (
    <Box sx={{ mt: 3 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Typography variant="h6">{t("custom_questions.title")}</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          {t("custom_questions.add_question")}
        </Button>
      </Box>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {questions.map((question, index) => (
          <Card key={question.id} sx={{ backgroundColor: "background.paper" }}>
            <CardContent
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
              }}
            >
              <Box sx={{ flex: 1 }}>
                <Box
                  sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}
                >
                  <DragIndicatorIcon fontSize="small" color="action" />
                  <Typography variant="body2" color="text.secondary">
                    {index + 1}.
                  </Typography>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    {question.text}
                  </Typography>
                  {question.required && (
                    <Chip
                      label={t("custom_questions.required_chip")}
                      size="small"
                      color="primary"
                    />
                  )}
                </Box>
                <Typography variant="caption" color="text.secondary">
                  {t("custom_questions.type_label", {
                    type: getQuestionTypeLabel(question.type),
                  })}
                </Typography>
                {question.options && question.options.length > 0 && (
                  <Box
                    sx={{ mt: 1, display: "flex", gap: 0.5, flexWrap: "wrap" }}
                  >
                    {question.options.map((opt, i) => (
                      <Chip
                        key={i}
                        label={opt}
                        size="small"
                        variant="outlined"
                      />
                    ))}
                  </Box>
                )}
              </Box>
              <Box sx={{ display: "flex", gap: 1 }}>
                <IconButton
                  size="small"
                  onClick={() => handleOpenDialog(index)}
                  sx={{ color: "primary.main" }}
                >
                  <EditIcon fontSize="small" />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={() => handleDeleteQuestion(index)}
                  sx={{ color: "error.main" }}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>

      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {editingIndex !== null
            ? t("custom_questions.edit_question")
            : t("custom_questions.add_question")}
        </DialogTitle>
        <DialogContent
          sx={{ pt: 2, display: "flex", flexDirection: "column", gap: 2 }}
        >
          <TextField
            fullWidth
            label={t("custom_questions.question_text_label")}
            value={formData.text}
            onChange={(e) => setFormData({ ...formData, text: e.target.value })}
            multiline
            rows={2}
            placeholder={t("custom_questions.question_text_placeholder")}
          />

          <FormControl fullWidth>
            <InputLabel>{t("custom_questions.question_type_label")}</InputLabel>
            <Select
              value={formData.type}
              onChange={(e) => {
                setFormData({
                  ...formData,
                  type: e.target.value as QuestionType,
                  options: [
                    QuestionType.MULTIPLE_CHOICE,
                    QuestionType.CHECKBOX,
                  ].includes(e.target.value as QuestionType)
                    ? formData.options || []
                    : undefined,
                });
              }}
              label={t("custom_questions.question_type_label")}
            >
              <MenuItem value={QuestionType.TEXT}>
                {t("custom_questions.short_text")}
              </MenuItem>
              <MenuItem value={QuestionType.TEXTAREA}>
                {t("custom_questions.long_text")}
              </MenuItem>
              <MenuItem value={QuestionType.MULTIPLE_CHOICE}>
                {t("custom_questions.multiple_choice")}
              </MenuItem>
              <MenuItem value={QuestionType.CHECKBOX}>
                {t("custom_questions.checkboxes")}
              </MenuItem>
            </Select>
          </FormControl>

          <FormControlLabel
            control={
              <Checkbox
                checked={formData.required}
                onChange={(e) =>
                  setFormData({ ...formData, required: e.target.checked })
                }
              />
            }
            label={t("custom_questions.required_label")}
          />

          {(formData.type === QuestionType.MULTIPLE_CHOICE ||
            formData.type === QuestionType.CHECKBOX) && (
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                {t("custom_questions.options_label")}
              </Typography>
              <Box
                sx={{ display: "flex", flexDirection: "column", gap: 1, mb: 2 }}
              >
                {formData.options?.map((option, i) => (
                  <Box
                    key={i}
                    sx={{ display: "flex", gap: 1, alignItems: "center" }}
                  >
                    <Chip
                      label={option}
                      onDelete={() => handleRemoveOption(i)}
                      variant="outlined"
                      sx={{ flex: 1 }}
                    />
                  </Box>
                ))}
              </Box>
              <TextField
                fullWidth
                size="small"
                placeholder={t("custom_questions.add_option_placeholder")}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    handleAddOption((e.target as HTMLInputElement).value);
                    (e.target as HTMLInputElement).value = "";
                  }
                }}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>{t("common.cancel")}</Button>
          <Button onClick={handleAddQuestion} variant="contained">
            {editingIndex !== null
              ? t("custom_questions.update")
              : t("custom_questions.add")}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
