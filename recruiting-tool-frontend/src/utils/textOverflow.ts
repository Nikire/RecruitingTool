/**
 * Text Overflow Utilities
 *
 * Shared `sx` fragments for rendering user-generated / free-form text
 * (job descriptions, skills, tags, company names...) without letting a long
 * unbroken token — a URL, a hash, a very long word — blow out of its
 * container or force the page to scroll sideways.
 *
 * Usage:
 *   <Typography sx={wrapLongText}>{jobPosition.title}</Typography>
 *   <Chip label={skill} sx={truncatingChipSx} />
 */

/**
 * Allows a long unbroken token to break anywhere so it stays inside its
 * container. `minWidth: 0` is required for flex/grid children, which
 * otherwise refuse to shrink below their content's intrinsic width.
 */
export const wrapLongText = {
  minWidth: 0,
  maxWidth: "100%",
  overflowWrap: "anywhere",
  wordBreak: "break-word",
} as const;

/**
 * Keeps a Chip inside its container, ellipsising the label instead of
 * stretching past the edge. MUI's Chip label already hides overflow, but the
 * Chip itself has no max width, so it grows indefinitely without this.
 */
export const truncatingChipSx = {
  maxWidth: "100%",
  "& .MuiChip-label": {
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
} as const;
