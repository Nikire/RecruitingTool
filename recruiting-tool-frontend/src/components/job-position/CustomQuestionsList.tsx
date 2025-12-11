import React from "react";
import { Box, Typography, Chip, Alert } from "@mui/material";
import { useTranslation } from "react-i18next";

/**
 * Represents a custom application question
 */
export interface CustomQuestion {
  id: string | number;
  text: string;
  type: string;
  required?: boolean;
  options?: string[];
}

/**
 * Props for CustomQuestionsList component
 */
export interface CustomQuestionsListProps {
  /**
   * Array of custom questions to display
   */
  questions: CustomQuestion[];

  /**
   * Whether to show the "Required" chip for required questions (default: true)
   */
  showRequired?: boolean;

  /**
   * Whether to show options for multiple choice/checkbox questions (default: true)
   */
  showOptions?: boolean;

  /**
   * Custom message to display when there are no questions
   */
  emptyMessage?: string;

  /**
   * Whether to use i18n for question types (default: true)
   */
  translate?: boolean;
}

/**
 * Reusable component for displaying a list of custom application questions.
 * Shows question text, type, required status, and options (for choice-based questions).
 *
 * @example
 * ```tsx
 * <CustomQuestionsList
 *   questions={jobPosition.customQuestions || []}
 *   emptyMessage={t('job_position_detail.no_custom_questions')}
 * />
 * ```
 */
const CustomQuestionsList: React.FC<CustomQuestionsListProps> = ({
  questions,
  showRequired = true,
  showOptions = true,
  emptyMessage,
  translate = true,
}) => {
  const { t } = useTranslation();

  // Empty state
  if (!questions || questions.length === 0) {
    return (
      <Alert severity="info">
        <Typography variant="body2">
          {emptyMessage || t("job_position_detail.no_custom_questions")}
        </Typography>
      </Alert>
    );
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {questions.map((question, index) => (
        <Box
          key={question.id}
          sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}
        >
          {/* Question number */}
          <Chip label={index + 1} size="small" color="secondary" />

          {/* Question details */}
          <Box sx={{ flex: 1 }}>
            {/* Question text and required chip */}
            <Box
              sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}
            >
              <Typography variant="body1" fontWeight="bold">
                {question.text}
              </Typography>
              {showRequired && question.required && (
                <Chip
                  label={t("custom_questions.required_chip")}
                  size="small"
                  color="primary"
                  variant="outlined"
                />
              )}
            </Box>

            {/* Question type */}
            <Typography
              variant="caption"
              color="textSecondary"
              display="block"
              sx={{ mb: 1 }}
            >
              {translate
                ? t("custom_questions.type_label", {
                    type: t(`question_types.${question.type.toLowerCase()}`),
                  })
                : t("custom_questions.type_label", {
                    type: question.type.replace(/_/g, " "),
                  })}
            </Typography>

            {/* Options (for multiple choice/checkbox questions) */}
            {showOptions && question.options && question.options.length > 0 && (
              <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
                {question.options.map((option, optIndex) => (
                  <Chip
                    key={optIndex}
                    label={option}
                    size="small"
                    variant="outlined"
                  />
                ))}
              </Box>
            )}
          </Box>
        </Box>
      ))}
    </Box>
  );
};

export default CustomQuestionsList;
