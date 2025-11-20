import React from 'react';
import {
	Box,
	TextField,
	FormControlLabel,
	Checkbox,
	FormGroup,
	FormControl,
	FormLabel,
	RadioGroup,
	Radio,
	Typography,
} from '@mui/material';
import { CustomQuestion, QuestionType, CustomAnswers } from '../../types/customQuestions';

interface CustomQuestionRendererProps {
	questions: CustomQuestion[];
	answers: CustomAnswers;
	onAnswerChange: (questionId: string, answer: string | string[]) => void;
	errors?: Record<string, string>;
	showRequiredIndicator?: boolean;
}

export const CustomQuestionRenderer: React.FC<CustomQuestionRendererProps> = ({
	questions,
	answers,
	onAnswerChange,
	errors = {},
	showRequiredIndicator = true,
}) => {
	const renderQuestion = (question: CustomQuestion) => {
		const value = answers[question.id] || '';
		const error = errors[question.id];
		const requiredLabel = question.required && showRequiredIndicator ? ' *' : '';

		switch (question.type) {
			case QuestionType.TEXT:
				return (
					<TextField
						fullWidth
						type="text"
						label={question.text + requiredLabel}
						value={value}
						onChange={(e) => onAnswerChange(question.id, e.target.value)}
						error={!!error}
						helperText={error}
						required={question.required}
						placeholder="Enter your answer..."
						sx={{
							'& .MuiInputBase-input': {
								fontSize: { xs: '1rem', sm: '1rem' },
								minHeight: { xs: 44, sm: 'auto' },
							},
						}}
					/>
				);

			case QuestionType.TEXTAREA:
				return (
					<TextField
						fullWidth
						label={question.text + requiredLabel}
						value={value}
						onChange={(e) => onAnswerChange(question.id, e.target.value)}
						error={!!error}
						helperText={error}
						multiline
						rows={4}
						required={question.required}
						placeholder="Enter your answer..."
						sx={{
							'& .MuiInputBase-input': {
								fontSize: { xs: '1rem', sm: '1rem' },
								minHeight: { xs: 100, sm: 'auto' },
							},
						}}
					/>
				);

			case QuestionType.MULTIPLE_CHOICE:
				return (
					<FormControl
						component="fieldset"
						error={!!error}
						fullWidth
					>
						<FormLabel component="legend" sx={{ fontWeight: 600, mb: 1 }}>
							{question.text + requiredLabel}
						</FormLabel>
						<RadioGroup
							value={value}
							onChange={(e) => onAnswerChange(question.id, e.target.value)}
						>
							{question.options?.map((option) => (
								<FormControlLabel
									key={option}
									value={option}
									control={<Radio />}
									label={option}
								/>
							))}
						</RadioGroup>
						{error && (
							<Typography variant="caption" color="error" sx={{ mt: 1 }}>
								{error}
							</Typography>
						)}
					</FormControl>
				);

			case QuestionType.CHECKBOX:
				const checkboxValue = Array.isArray(value) ? value : [];
				return (
					<FormControl
						component="fieldset"
						error={!!error}
						fullWidth
					>
						<FormLabel component="legend" sx={{ fontWeight: 600, mb: 1 }}>
							{question.text + requiredLabel}
						</FormLabel>
						<FormGroup>
							{question.options?.map((option) => (
								<FormControlLabel
									key={option}
									control={
										<Checkbox
											checked={checkboxValue.includes(option)}
											onChange={(e) => {
												if (e.target.checked) {
													onAnswerChange(question.id, [...checkboxValue, option]);
												} else {
													onAnswerChange(
														question.id,
														checkboxValue.filter((v) => v !== option)
													);
												}
											}}
										/>
									}
									label={option}
								/>
							))}
						</FormGroup>
						{error && (
							<Typography variant="caption" color="error" sx={{ mt: 1 }}>
								{error}
							</Typography>
						)}
					</FormControl>
				);

			default:
				return null;
		}
	};

	if (questions.length === 0) {
		return null;
	}

	return (
		<Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
			<Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
				Screening Questions
			</Typography>
			{questions.map((question) => (
				<Box key={question.id} sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
					{renderQuestion(question)}
				</Box>
			))}
		</Box>
	);
};
