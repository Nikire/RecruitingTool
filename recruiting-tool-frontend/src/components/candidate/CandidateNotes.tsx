import {useState} from 'react';
import {
	Box,
	Typography,
	TextField,
	Button,
	Card,
	CardContent,
	IconButton,
	CircularProgress,
	Stack,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import {format} from 'date-fns';
import {
	useCandidateNotes,
	useCreateCandidateNote,
	useUpdateCandidateNote,
	useDeleteCandidateNote,
} from '../../hooks/api/useCandidates';

interface CandidateNotesProps {
	candidateUid?: string;
}

const CandidateNotes: React.FC<CandidateNotesProps> = ({candidateUid}) => {
	const [newNoteContent, setNewNoteContent] = useState('');
	const [editingNoteUid, setEditingNoteUid] = useState<string | null>(null);
	const [editContent, setEditContent] = useState('');

	const {data: notes, isLoading} = useCandidateNotes(candidateUid || '');
	const {mutate: createNote, isPending: isCreating} = useCreateCandidateNote();
	const {mutate: updateNote, isPending: isUpdating} = useUpdateCandidateNote();
	const {mutate: deleteNote} = useDeleteCandidateNote();

	if (!candidateUid) {
		return (
			<Typography color="text.secondary">
				Please save the candidate first before adding notes.
			</Typography>
		);
	}

	const handleCreateNote = () => {
		if (!newNoteContent.trim()) return;

		createNote(
			{
				content: newNoteContent,
				candidateUid,
			},
			{
				onSuccess: () => {
					setNewNoteContent('');
				},
			}
		);
	};

	const handleStartEdit = (noteUid: string, content: string) => {
		setEditingNoteUid(noteUid);
		setEditContent(content);
	};

	const handleCancelEdit = () => {
		setEditingNoteUid(null);
		setEditContent('');
	};

	const handleUpdateNote = (noteUid: string) => {
		if (!editContent.trim()) return;

		updateNote(
			{
				noteUid,
				data: {content: editContent},
			},
			{
				onSuccess: () => {
					setEditingNoteUid(null);
					setEditContent('');
				},
			}
		);
	};

	const handleDeleteNote = (noteUid: string) => {
		if (confirm('Are you sure you want to delete this note?')) {
			deleteNote(noteUid);
		}
	};

	if (isLoading) {
		return (
			<Box display="flex" justifyContent="center" p={3}>
				<CircularProgress />
			</Box>
		);
	}

	return (
		<Box>
			{/* Add Note Form */}
			<Box mb={3}>
				<Typography variant="h6" gutterBottom>
					Add New Note
				</Typography>
				<TextField
					fullWidth
					multiline
					rows={3}
					placeholder="Enter your note here..."
					value={newNoteContent}
					onChange={(e) => setNewNoteContent(e.target.value)}
					sx={{mb: 1}}
				/>
				<Button
					variant="contained"
					onClick={handleCreateNote}
					disabled={!newNoteContent.trim() || isCreating}
				>
					{isCreating ? 'Adding...' : 'Add Note'}
				</Button>
			</Box>

			{/* Notes List */}
			<Box>
				<Typography variant="h6" gutterBottom>
					Notes ({notes?.length || 0})
				</Typography>

				{notes && notes.length > 0 ? (
					<Stack spacing={2}>
						{notes.map((note) => (
							<Card key={note.uid} variant="outlined">
								<CardContent>
									{editingNoteUid === note.uid ? (
										<Box>
											<TextField
												fullWidth
												multiline
												rows={3}
												value={editContent}
												onChange={(e) => setEditContent(e.target.value)}
												sx={{mb: 1}}
											/>
											<Stack direction="row" spacing={1}>
												<Button
													size="small"
													variant="contained"
													onClick={() => handleUpdateNote(note.uid)}
													disabled={!editContent.trim() || isUpdating}
												>
													{isUpdating ? 'Saving...' : 'Save'}
												</Button>
												<Button
													size="small"
													onClick={handleCancelEdit}
													disabled={isUpdating}
												>
													Cancel
												</Button>
											</Stack>
										</Box>
									) : (
										<Box>
											<Box
												display="flex"
												justifyContent="space-between"
												alignItems="flex-start"
											>
												<Typography variant="body1" sx={{whiteSpace: 'pre-wrap'}}>
													{note.content}
												</Typography>
												<Box>
													<IconButton
														size="small"
														onClick={() => handleStartEdit(note.uid, note.content)}
													>
														<EditIcon fontSize="small" />
													</IconButton>
													<IconButton
														size="small"
														onClick={() => handleDeleteNote(note.uid)}
														color="error"
													>
														<DeleteIcon fontSize="small" />
													</IconButton>
												</Box>
											</Box>
											<Box mt={1}>
												<Typography variant="caption" color="text.secondary">
													By {note.authorName} •{' '}
													{format(new Date(note.createdAt), 'MMM d, yyyy h:mm a')}
												</Typography>
											</Box>
										</Box>
									)}
								</CardContent>
							</Card>
						))}
					</Stack>
				) : (
					<Typography color="text.secondary">No notes yet. Add one above!</Typography>
				)}
			</Box>
		</Box>
	);
};

export default CandidateNotes;
