import React, { useState, useEffect } from "react";
import {
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Tooltip,
  Box,
} from "@mui/material";
import TranslateIcon from "@mui/icons-material/Translate";
import { useTranslation } from "react-i18next";

/**
 * Shared props for the inline flag glyphs below.
 *
 * The flags are purely decorative — every menu item is already labelled with
 * the language name — so they are hidden from assistive technology.
 */
const FLAG_SVG_PROPS = {
  xmlns: "http://www.w3.org/2000/svg",
  width: "100%",
  height: "100%",
  preserveAspectRatio: "xMidYMid meet",
  role: "presentation",
  "aria-hidden": true,
  focusable: false,
} as const;

/**
 * Star field of the US canton: 9 rows alternating 6 and 5 stars on an 11-column
 * grid. Rendered as dots because five-pointed stars are indistinguishable from
 * dots at the 24px this component draws at, and cost far more markup.
 */
const US_CANTON_WIDTH = 7.6;
const US_CANTON_HEIGHT = 5.3846;
const US_STAR_STEP_X = US_CANTON_WIDTH / 12;
const US_STAR_STEP_Y = US_CANTON_HEIGHT / 10;

const US_STAR_POSITIONS: Array<{ cx: number; cy: number }> = Array.from(
  { length: 9 },
  (_, row) => {
    const isLongRow = row % 2 === 0;
    return Array.from({ length: isLongRow ? 6 : 5 }, (__, col) => ({
      cx: (isLongRow ? 1 : 2) * US_STAR_STEP_X + col * US_STAR_STEP_X * 2,
      cy: (row + 1) * US_STAR_STEP_Y,
    }));
  },
).flat();

/**
 * Flag of the United States (19:10), drawn inline.
 *
 * Replaces the `flag-icons` stylesheet, which shipped 543 `.fi-*` rules
 * (~420KB of the built CSS) plus 142 SVG assets to render this one glyph.
 */
const UsFlagIcon: React.FC = () => (
  <svg {...FLAG_SVG_PROPS} viewBox="0 0 19 10">
    <rect width="19" height="10" fill="#fff" />
    <g fill="#b22234">
      {[0, 2, 4, 6, 8, 10, 12].map((stripe) => (
        <rect key={stripe} y={(stripe * 10) / 13} width="19" height={10 / 13} />
      ))}
    </g>
    <rect width={US_CANTON_WIDTH} height={US_CANTON_HEIGHT} fill="#3c3b6e" />
    <g fill="#fff">
      {US_STAR_POSITIONS.map((star) => (
        <circle
          key={`${star.cx}-${star.cy}`}
          cx={star.cx}
          cy={star.cy}
          r={0.19}
        />
      ))}
    </g>
  </svg>
);

/**
 * Flag of Spain (3:2), civil variant — the coat of arms is omitted because it
 * is an illegible smudge below ~64px and would dominate the file size.
 */
const EsFlagIcon: React.FC = () => (
  <svg {...FLAG_SVG_PROPS} viewBox="0 0 3 2">
    <rect width="3" height="2" fill="#c60b1e" />
    <rect y="0.5" width="3" height="1" fill="#ffc400" />
  </svg>
);

/**
 * Language option configuration
 */
interface LanguageOption {
  code: string;
  /** i18n key for the language's own name (endonym). */
  labelKey: string;
  Flag: React.FC;
}

/**
 * Available languages with their inline flag glyphs
 */
const LANGUAGES: LanguageOption[] = [
  { code: "en", labelKey: "language.english", Flag: UsFlagIcon },
  { code: "es", labelKey: "language.spanish", Flag: EsFlagIcon },
];

/**
 * LanguageSelector - Component for switching between English and Spanish
 *
 * Features:
 * - Material-UI design with inline SVG flag icons (no external icon font/CSS)
 * - IconButton with dropdown menu
 * - Persists language preference to localStorage
 * - Uses react-i18next for language switching
 * - Accessible (ARIA labels, keyboard navigation, decorative flags hidden)
 * - Compact design suitable for AppBar
 *
 * @example
 * ```tsx
 * <LanguageSelector />
 * ```
 */
const normalizeLanguageCode = (code: string): string =>
  code.split("-")[0].split("_")[0];

const LanguageSelector: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [currentLang, setCurrentLang] = useState<string>(
    normalizeLanguageCode(i18n.language),
  );
  const open = Boolean(anchorEl);

  // Update current language state when i18n language changes
  useEffect(() => {
    const handleLanguageChanged = (lng: string) => {
      setCurrentLang(normalizeLanguageCode(lng));
    };

    // Set initial language
    setCurrentLang(normalizeLanguageCode(i18n.language));

    // Listen to language change events
    i18n.on("languageChanged", handleLanguageChanged);

    // Cleanup listener on unmount
    return () => {
      i18n.off("languageChanged", handleLanguageChanged);
    };
  }, [i18n]);

  // Get current language option from state
  const currentLanguage =
    LANGUAGES.find((lang) => lang.code === currentLang) || LANGUAGES[0];

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
      localStorage.setItem("i18nextLng", languageCode);

      // Close menu
      handleMenuClose();
    } catch (error) {
      console.error("Failed to change language:", error);
    }
  };

  return (
    <>
      <Tooltip title={t("language.select_language")}>
        <IconButton
          color="inherit"
          onClick={handleMenuOpen}
          aria-label={t("language.select_language")}
          aria-controls={open ? "language-menu" : undefined}
          aria-haspopup="true"
          aria-expanded={open ? "true" : undefined}
          sx={{ ml: 1 }}
        >
          <TranslateIcon />
        </IconButton>
      </Tooltip>

      <Menu
        id="language-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleMenuClose}
        MenuListProps={{
          "aria-labelledby": "language-button",
          role: "menu",
        }}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
      >
        {LANGUAGES.map((language) => (
          <MenuItem
            key={language.code}
            selected={language.code === currentLanguage.code}
            onClick={() => handleLanguageChange(language.code)}
            aria-label={`${t("language.switch_to")} ${t(language.labelKey)}`}
          >
            <ListItemIcon sx={{ minWidth: 36 }}>
              <Box
                component="span"
                sx={{
                  width: "1.5em",
                  height: "1.5em",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  lineHeight: 0,
                }}
              >
                <language.Flag />
              </Box>
            </ListItemIcon>
            <ListItemText
              primary={t(language.labelKey)}
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
