import React, { useState } from 'react';
import {
	Box,
	Typography,
	Paper,
	IconButton,
	List,
	ListItem,
	ListItemIcon,
	ListItemText,
	ListItemSecondaryAction,
	CircularProgress,
	Alert,
	Tooltip,
} from '@mui/material';
import {
	Download as DownloadIcon,
	Delete as DeleteIcon,
	InsertDriveFile as FileIcon,
	PictureAsPdf as PdfIcon,
	Description as DocIcon,
} from '@mui/icons-material';
import { useFiles, useDownloadFile, useDeleteFile } from '../../hooks/api/useFiles';
import { format } from 'date-fns';
import ConfirmDeleteDialog from '../dialogs/ConfirmDeleteDialog';
import { useTranslation } from 'react-i18next';

interface FileListProps {
	candidateUid?: string;
	showActions?: boolean;
}

const FileList: React.FC<FileListProps> = ({ candidateUid, showActions = true }) => {
	const { t } = useTranslation();
	const { data: files, isLoading, isError } = useFiles(candidateUid);
	const { mutate: downloadFile } = useDownloadFile();
	const { mutate: deleteFile } = useDeleteFile();

	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [fileToDelete, setFileToDelete] = useState<{ uid: string; name: string } | null>(null);

	const handleDownload = (uid: string, filename: string) => {
		downloadFile({ uid, filename });
	};

	const handleDeleteClick = (uid: string, filename: string) => {
		setFileToDelete({ uid, name: filename });
		setDeleteDialogOpen(true);
	};

	const handleConfirmDelete = () => {
		if (fileToDelete) {
			deleteFile(fileToDelete.uid, {
				onSuccess: () => {
					setDeleteDialogOpen(false);
					setFileToDelete(null);
				},
			});
		}
	};

	const handleCancelDelete = () => {
		setDeleteDialogOpen(false);
		setFileToDelete(null);
	};

	const getFileIcon = (mimetype: string) => {
		if (mimetype.includes('pdf')) {
			return <PdfIcon sx={{ color: '#d32f2f' }} />;
		}
		if (mimetype.includes('doc') || mimetype.includes('word')) {
			return <DocIcon sx={{ color: '#1976d2' }} />;
		}
		return <FileIcon sx={{ color: 'text.secondary' }} />;
	};

	const formatFileSize = (bytes: number): string => {
		if (bytes === 0) return '0 Bytes';
		const k = 1024;
		const sizes = ['Bytes', 'KB', 'MB', 'GB'];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
	};

	if (isLoading) {
		return (
			<Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
				<CircularProgress />
			</Box>
		);
	}

	if (isError) {
		return (
			<Alert severity="error">
				{t('file_list.error_loading')}
			</Alert>
		);
	}

	if (!files || files.length === 0) {
		return (
			<Paper sx={{ p: 4, textAlign: 'center' }}>
				<FileIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
				<Typography variant="body1" color="text.secondary">
					{t('file_list.no_files')}
				</Typography>
			</Paper>
		);
	}

	return (
		<>
			<Paper sx={{ overflow: 'hidden' }}>
				<List sx={{ p: 0 }}>
					{files.map((file, index) => (
						<ListItem
							key={file.uid}
							divider={index < files.length - 1}
							sx={{
								'&:hover': {
									backgroundColor: 'rgba(0, 0, 0, 0.04)',
								},
							}}
						>
							<ListItemIcon>{getFileIcon(file.mimetype)}</ListItemIcon>
							<ListItemText
								primary={file.originalName}
								secondary={
									<>
										<Typography
											component="span"
											variant="body2"
											color="text.secondary"
										>
											{formatFileSize(file.size)}
										</Typography>
										{' • '}
										<Typography
											component="span"
											variant="body2"
											color="text.secondary"
										>
											{format(new Date(file.createdAt), 'MMM dd, yyyy HH:mm')}
										</Typography>
									</>
								}
							/>
							{showActions && (
								<ListItemSecondaryAction>
									<Tooltip title={t('common.download')}>
										<IconButton
											edge="end"
											onClick={() => handleDownload(file.uid, file.originalName)}
											sx={{ mr: 1 }}
											aria-label={`${t('common.download')} ${file.originalName}`}
										>
											<DownloadIcon />
										</IconButton>
									</Tooltip>
									<Tooltip title={t('common.delete')}>
										<IconButton
											edge="end"
											onClick={() => handleDeleteClick(file.uid, file.originalName)}
											color="error"
											aria-label={`${t('common.delete')} ${file.originalName}`}
										>
											<DeleteIcon />
										</IconButton>
									</Tooltip>
								</ListItemSecondaryAction>
							)}
						</ListItem>
					))}
				</List>
			</Paper>

			<ConfirmDeleteDialog
				open={deleteDialogOpen}
				onClose={handleCancelDelete}
				onConfirm={handleConfirmDelete}
				title={t('file_list.delete_title')}
				message={t('file_list.delete_message', { fileName: fileToDelete?.name })}
			/>
		</>
	);
};

export default FileList;
