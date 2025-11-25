import React, { useState } from 'react';
import {
	IconButton,
	Menu,
	MenuItem,
	ListItemIcon,
	ListItemText,
	Tooltip,
} from '@mui/material';
import LanguageIcon from '@mui/icons-material/Language';
import { useTranslation } from 'react-i18next';

/**
 * Language option configuration
 */
interface LanguageOption {
	code: string;
	label: string;
	flag: string;
}

/**
 * Available languages with flags
 */
const LANGUAGES: LanguageOption[] = [
	{ code: 'en', label: 'English', flag: '🇺🇸' },
	{ code: 'es', label: 'Español', flag: '🇪🇸' },
];

/**
 * LanguageSelector - Component for switching between English and Spanish
 *
 * Features:
 * - Material-UI design with flag icons
 * - IconButton with dropdown menu
 * - Persists language preference to localStorage
 * - Uses react-i18next for language switching
 * - Accessible (ARIA labels, keyboard navigation)
 * - Compact design suitable for AppBar
 *
 * @example
 * ```tsx
 * <LanguageSelector />
 * ```
 */
const LanguageSelector: React.FC = () => {
	const { t, i18n } = useTranslation();
	const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
	const open = Boolean(anchorEl);

	// Get current language
	const currentLanguage = LANGUAGES.find((lang) => lang.code === i18n.language) || LANGUAGES[0];

	/**
	 * Opens the language menu
	 */
	const handleMenuOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
		setAnchorEl(event.currentTarget);
	};

	/**
	 * Closes the language menu
	 */
	const handleMenuClose = () => {
		setAnchorEl(null);
	};

	/**
	 * Changes the application language and persists to localStorage
	 */
	const handleLanguageChange = async (languageCode: string) => {
		try {
			// Change language using i18n
			await i18n.changeLanguage(languageCode);

			// Persist to localStorage (i18n automatically does this, but we ensure it)
			localStorage.setItem('i18nextLng', languageCode);

			// Close menu
			handleMenuClose();
		} catch (error) {
			console.error('Failed to change language:', error);
		}
	};

	return (
		<>
			<Tooltip title={t('language.select_language')}>
				<IconButton
					color="inherit"
					onClick={handleMenuOpen}
					aria-label={t('language.select_language')}
					aria-controls={open ? 'language-menu' : undefined}
					aria-haspopup="true"
					aria-expanded={open ? 'true' : undefined}
					sx={{ ml: 1 }}
				>
					<LanguageIcon />
				</IconButton>
			</Tooltip>

			<Menu
				id="language-menu"
				anchorEl={anchorEl}
				open={open}
				onClose={handleMenuClose}
				MenuListProps={{
					'aria-labelledby': 'language-button',
					role: 'menu',
				}}
				anchorOrigin={{
					vertical: 'bottom',
					horizontal: 'right',
				}}
				transformOrigin={{
					vertical: 'top',
					horizontal: 'right',
				}}
			>
				{LANGUAGES.map((language) => (
					<MenuItem
						key={language.code}
						selected={language.code === currentLanguage.code}
						onClick={() => handleLanguageChange(language.code)}
						aria-label={`${t('language.switch_to')} ${language.label}`}
					>
						<ListItemIcon sx={{ minWidth: 36 }}>
							<span role="img" aria-label={language.label} style={{ fontSize: '1.5rem' }}>
								{language.flag}
							</span>
						</ListItemIcon>
						<ListItemText
							primary={language.label}
							primaryTypographyProps={{
								fontWeight: language.code === currentLanguage.code ? 600 : 400,
							}}
						/>
					</MenuItem>
				))}
			</Menu>
		</>
	);
};

export default LanguageSelector;
