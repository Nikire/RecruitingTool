import React, {useState} from 'react';
import {
	Box,
	Card,
	CardContent,
	Typography,
	IconButton,
	Stack,
	Chip,
	Menu,
	MenuItem,
	CircularProgress,
	Alert,
} from '@mui/material';
import {
	MoreVert as MoreVertIcon,
	Edit as EditIcon,
	Delete as DeleteIcon,
	Inbox as InboxIcon,
} from '@mui/icons-material';
import {useTranslation} from 'react-i18next';
import {formatDistanceToNow} from 'date-fns';
import {enUS, es} from 'date-fns/locale';
import {StageNote} from '../../types/stage.types';
import {useDeleteStageNote} from '../../hooks/api/useStages';
import {useAtomValue} from 'jotai';
import {userAtom} from '../../hooks/api/state/atoms';
import EditStageNoteDialog from './EditStageNoteDialog';

interface StageNotesListProps {
	stageUid: string;
	notes: StageNote[];
	isLoading: boolean;
	isError: boolean;
}

const StageNotesList: React.FC<StageNotesListProps> = ({
	stageUid,
	notes,
	isLoading,
	isError,
}) => {
	const {t, i18n} = useTranslation();
	const currentUser = useAtomValue(userAtom);
	const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
	const [selectedNote, setSelectedNote] = useState<StageNote | null>(null);
	const [editDialogOpen, setEditDialogOpen] = useState(false);

	const {mutate: deleteNote, isPending: isDeleting} = useDeleteStageNote();

	const handleMenuOpen = (
		event: React.MouseEvent<HTMLElement>,
		note: StageNote
	) => {
		setAnchorEl(event.currentTarget);
		setSelectedNote(note);
	};

	const handleMenuClose = () => {
		setAnchorEl(null);
		setSelectedNote(null);
	};

	const handleEdit = () => {
		setEditDialogOpen(true);
		handleMenuClose();
	};

	const handleDelete = () => {
		if (selectedNote) {
			if (window.confirm(t('stage_notes.delete_note_confirm'))) {
				deleteNote({noteUid: selectedNote.uid, stageUid});
			}
		}
		handleMenuClose();
	};

	const isNoteAuthor = (note: StageNote) => {
		return currentUser && note.author.uid === currentUser.uid;
	};

	const formatDate = (dateString: string) => {
		const locale = i18n.language === 'es' ? es : enUS;
		return formatDistanceToNow(new Date(dateString), {
			addSuffix: true,
			locale,
		});
	};

	// Loading state
	if (isLoading) {
		return (
			<Box
				display="flex"
				justifyContent="center"
				alignItems="center"
				py={4}
			>
				<CircularProgress />
			</Box>
		);
	}

	// Error state
	if (isError) {
		return (
			<Alert severity="error" sx={{my: 2}}>
				{t('errors.fetch_failed')}
			</Alert>
		);
	}

	// Empty state
	if (!notes || notes.length === 0) {
		return (
			<Box
				display="flex"
				flexDirection="column"
				alignItems="center"
				py={6}
				gap={2}
			>
				<InboxIcon sx={{fontSize: 60, color: 'text.disabled'}} />
				<Typography variant="h6" color="textSecondary">
					{t('stage_notes.no_notes')}
				</Typography>
				<Typography variant="body2" color="textSecondary">
					{t('stage_notes.add_first_note')}
				</Typography>
			</Box>
		);
	}

	return (
		<>
			<Stack spacing={2}>
				{notes.map((note) => (
					<Card key={note.uid} variant="outlined">
						<CardContent>
							<Box
								display="flex"
								justifyContent="space-between"
								alignItems="flex-start"
								mb={1}
							>
								<Box>
									<Typography variant="subtitle2" fontWeight="bold">
										{isNoteAuthor(note)
											? t('stage_notes.you')
											: note.author.name}
									</Typography>
									<Typography variant="caption" color="textSecondary">
										{formatDate(note.createdAt)}
										{note.createdAt !== note.updatedAt &&
											` • ${t('stage_notes.updated')} ${formatDate(
												note.updatedAt
											)}`}
									</Typography>
								</Box>
								{isNoteAuthor(note) && (
									<IconButton
										size="small"
										onClick={(e) => handleMenuOpen(e, note)}
										disabled={isDeleting}
									>
										<MoreVertIcon />
									</IconButton>
								)}
							</Box>
							<Typography variant="body1" sx={{whiteSpace: 'pre-wrap'}}>
								{note.content}
							</Typography>
						</CardContent>
					</Card>
				))}
			</Stack>

			{/* Context Menu */}
			<Menu
				anchorEl={anchorEl}
				open={Boolean(anchorEl)}
				onClose={handleMenuClose}
			>
				<MenuItem onClick={handleEdit}>
					<EditIcon fontSize="small" sx={{mr: 1}} />
					{t('common.edit')}
				</MenuItem>
				<MenuItem onClick={handleDelete}>
					<DeleteIcon fontSize="small" sx={{mr: 1}} />
					{t('common.delete')}
				</MenuItem>
			</Menu>

			{/* Edit Dialog */}
			{selectedNote && editDialogOpen && (
				<EditStageNoteDialog
					open={editDialogOpen}
					onClose={() => setEditDialogOpen(false)}
					note={selectedNote}
				/>
			)}
		</>
	);
};

export default StageNotesList;
