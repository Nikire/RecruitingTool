import React, { useState } from 'react';
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
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import { CustomQuestion, QuestionType } from '../../types/customQuestions';

interface CustomQuestionBuilderProps {
	questions: CustomQuestion[];
	onQuestionsChange: (questions: CustomQuestion[]) => void;
}

export const CustomQuestionBuilder: React.FC<CustomQuestionBuilderProps> = ({
	questions,
	onQuestionsChange,
}) => {
	const [openDialog, setOpenDialog] = useState(false);
	const [editingIndex, setEditingIndex] = useState<number | null>(null);
	const [formData, setFormData] = useState<CustomQuestion>({
		id: '',
		type: QuestionType.TEXT,
		text: '',
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
				text: '',
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
			alert('Question text is required');
			return;
		}

		if ((formData.type === QuestionType.MULTIPLE_CHOICE || formData.type === QuestionType.CHECKBOX) && (!formData.options || formData.options.length < 2)) {
			alert('Please add at least 2 options for multiple choice or checkbox questions');
			return;
		}

		if (editingIndex !== null) {
			const updatedQuestions = [...questions];
			updatedQuestions[editingIndex] = formData;
			onQuestionsChange(updatedQuestions);
		} else {
			onQuestionsChange([...questions, formData]);
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
				return 'Short Text';
			case QuestionType.TEXTAREA:
				return 'Long Text';
			case QuestionType.MULTIPLE_CHOICE:
				return 'Multiple Choice';
			case QuestionType.CHECKBOX:
				return 'Checkboxes';
			default:
				return type;
		}
	};

	return (
		<Box sx={{ mt: 3 }}>
			<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
				<Typography variant="h6">Custom Screening Questions</Typography>
				<Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()}>
					Add Question
				</Button>
			</Box>

			<Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
				{questions.map((question, index) => (
					<Card key={question.id} sx={{ backgroundColor: '#f5f5f5' }}>
						<CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
							<Box sx={{ flex: 1 }}>
								<Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
									<DragIndicatorIcon fontSize="small" color="action" />
									<Typography variant="body2" color="text.secondary">
										{index + 1}.
									</Typography>
									<Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
										{question.text}
									</Typography>
									{question.required && <Chip label="Required" size="small" color="primary" />}
								</Box>
								<Typography variant="caption" color="text.secondary">
									Type: {getQuestionTypeLabel(question.type)}
								</Typography>
								{question.options && question.options.length > 0 && (
									<Box sx={{ mt: 1, display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
										{question.options.map((opt, i) => (
											<Chip key={i} label={opt} size="small" variant="outlined" />
										))}
									</Box>
								)}
							</Box>
							<Box sx={{ display: 'flex', gap: 1 }}>
								<IconButton
									size="small"
									onClick={() => handleOpenDialog(index)}
									sx={{ color: 'primary.main' }}
								>
									<EditIcon fontSize="small" />
								</IconButton>
								<IconButton
									size="small"
									onClick={() => handleDeleteQuestion(index)}
									sx={{ color: 'error.main' }}
								>
									<DeleteIcon fontSize="small" />
								</IconButton>
							</Box>
						</CardContent>
					</Card>
				))}
			</Box>

			<Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
				<DialogTitle>{editingIndex !== null ? 'Edit Question' : 'Add Question'}</DialogTitle>
				<DialogContent sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
					<TextField
						fullWidth
						label="Question Text"
						value={formData.text}
						onChange={(e) => setFormData({ ...formData, text: e.target.value })}
						multiline
						rows={2}
						placeholder="e.g., Years of experience with React?"
					/>

					<FormControl fullWidth>
						<InputLabel>Question Type</InputLabel>
						<Select
							value={formData.type}
							onChange={(e) => {
								setFormData({
									...formData,
									type: e.target.value as QuestionType,
									options: [QuestionType.MULTIPLE_CHOICE, QuestionType.CHECKBOX].includes(
										e.target.value as QuestionType
									)
										? formData.options || []
										: undefined,
								});
							}}
							label="Question Type"
						>
							<MenuItem value={QuestionType.TEXT}>Short Text</MenuItem>
							<MenuItem value={QuestionType.TEXTAREA}>Long Text</MenuItem>
							<MenuItem value={QuestionType.MULTIPLE_CHOICE}>Multiple Choice</MenuItem>
							<MenuItem value={QuestionType.CHECKBOX}>Checkboxes</MenuItem>
						</Select>
					</FormControl>

					<FormControlLabel
						control={
							<Checkbox
								checked={formData.required}
								onChange={(e) => setFormData({ ...formData, required: e.target.checked })}
							/>
						}
						label="Required"
					/>

					{(formData.type === QuestionType.MULTIPLE_CHOICE || formData.type === QuestionType.CHECKBOX) && (
						<Box>
							<Typography variant="subtitle2" sx={{ mb: 1 }}>
								Options
							</Typography>
							<Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2 }}>
								{formData.options?.map((option, i) => (
									<Box key={i} sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
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
								placeholder="Add an option and press Enter"
								onKeyPress={(e) => {
									if (e.key === 'Enter') {
										handleAddOption((e.target as HTMLInputElement).value);
										(e.target as HTMLInputElement).value = '';
									}
								}}
							/>
						</Box>
					)}
				</DialogContent>
				<DialogActions>
					<Button onClick={handleCloseDialog}>Cancel</Button>
					<Button onClick={handleAddQuestion} variant="contained">
						{editingIndex !== null ? 'Update' : 'Add'}
					</Button>
				</DialogActions>
			</Dialog>
		</Box>
	);
};
