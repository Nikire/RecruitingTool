import React from 'react';
import { Box, Card, CardContent, Chip, Typography, Divider } from '@mui/material';
import { CustomQuestion, QuestionType, CustomAnswers } from '../../types/customQuestions';

interface CustomAnswersDisplayProps {
	questions: CustomQuestion[];
	answers: CustomAnswers;
}

export const CustomAnswersDisplay: React.FC<CustomAnswersDisplayProps> = ({ questions, answers }) => {
	const renderAnswer = (question: CustomQuestion, answer: any) => {
		if (!answer) {
			return <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>No answer provided</Typography>;
		}

		switch (question.type) {
			case QuestionType.TEXT:
			case QuestionType.TEXTAREA:
				return (
					<Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
						{answer}
					</Typography>
				);

			case QuestionType.MULTIPLE_CHOICE:
				return (
					<Chip
						label={answer}
						variant="outlined"
						color="primary"
						size="small"
					/>
				);

			case QuestionType.CHECKBOX:
				return (
					<Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
						{Array.isArray(answer) ? (
							answer.map((item) => (
								<Chip
									key={item}
									label={item}
									variant="outlined"
									color="primary"
									size="small"
								/>
							))
						) : (
							<Chip
								label={answer}
								variant="outlined"
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
				Screening Answers
			</Typography>
			{questions.map((question, index) => (
				<Card key={question.id} sx={{ mb: 2 }}>
					<CardContent>
						<Box sx={{ mb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
							<Typography variant="subtitle2" sx={{ fontWeight: 600, flex: 1 }}>
								{index + 1}. {question.text}
							</Typography>
							{question.required && (
								<Chip label="Required" size="small" color="primary" variant="outlined" />
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
