import React from "react";
import {
  Box,
  Card,
  CardContent,
  Chip,
  Typography,
  Divider,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import {
  CustomQuestion,
  QuestionType,
  CustomAnswers,
} from "../../types/customQuestions";

interface CustomAnswersDisplayProps {
  questions: CustomQuestion[];
  answers: CustomAnswers;
}

export const CustomAnswersDisplay: React.FC<CustomAnswersDisplayProps> = ({
  questions,
  answers,
}) => {
  const { t } = useTranslation();

  const renderAnswer = (question: CustomQuestion, answer: unknown) => {
    if (!answer) {
      return (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ fontStyle: "italic" }}
        >
          {t("custom_questions.no_answer")}
        </Typography>
      );
    }

    switch (question.type) {
      case QuestionType.TEXT:
      case QuestionType.TEXTAREA:
        return (
          <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
            {String(answer)}
          </Typography>
        );

      case QuestionType.MULTIPLE_CHOICE:
        return (
          <Chip
            label={String(answer)}
            variant="filled"
            color="primary"
            size="small"
          />
        );

      case QuestionType.CHECKBOX:
        return (
          <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
            {Array.isArray(answer) ? (
              answer.map((item) => (
                <Chip
                  key={String(item)}
                  label={String(item)}
                  variant="filled"
                  color="primary"
                  size="small"
                />
              ))
            ) : (
              <Chip
                label={String(answer)}
                variant="filled"
                color="primary"
                size="small"
              />
            )}
          </Box>
        );

      default:
        return <Typography variant="body2">{String(answer)}</Typography>;
    }
  };

  if (!questions || questions.length === 0) {
    return null;
  }

  const hasAnswers = Object.keys(answers).length > 0;
  if (!hasAnswers) {
    return null;
  }

  return (
    <Box sx={{ mt: 3 }}>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
        {t("custom_questions.screening_questions")}
      </Typography>
      {questions.map((question, index) => (
        <Card key={question.id} sx={{ mb: 2 }}>
          <CardContent>
            <Box
              sx={{
                mb: 1,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
              }}
            >
              <Typography variant="subtitle2" sx={{ fontWeight: 600, flex: 1 }}>
                {index + 1}. {question.text}
              </Typography>
              {question.required && (
                <Chip
                  label={t("custom_questions.required_chip")}
                  size="small"
                  color="primary"
                  variant="filled"
                />
              )}
            </Box>
            <Divider sx={{ my: 1 }} />
            <Box sx={{ mt: 1 }}>
              {renderAnswer(question, answers[question.id])}
            </Box>
          </CardContent>
        </Card>
      ))}
    </Box>
  );
};
