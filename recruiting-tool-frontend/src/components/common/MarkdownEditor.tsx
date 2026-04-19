import { Box, Typography, useTheme } from "@mui/material";
import MDEditor, { commands } from "@uiw/react-md-editor";
import { useTranslation } from "react-i18next";

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string | undefined) => void;
  label?: string;
  error?: boolean;
  helperText?: string;
  maxLength?: number;
  minHeight?: number;
  disabled?: boolean;
  placeholder?: string;
}

const MarkdownEditor: React.FC<MarkdownEditorProps> = ({
  value,
  onChange,
  label,
  error = false,
  helperText,
  maxLength,
  minHeight = 200,
  disabled = false,
  placeholder,
}) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const colorMode = theme.palette.mode;

  const handleChange = (val?: string) => {
    // Enforce max length if specified
    if (maxLength && val && val.length > maxLength) {
      return;
    }
    onChange(val);
  };

  const currentLength = value?.length || 0;
  const showCharCount = maxLength !== undefined;

  return (
    <Box>
      {label && (
        <Typography
          variant="subtitle2"
          sx={{
            mb: 1,
            color: error ? "error.main" : "text.secondary",
          }}
        >
          {label}
        </Typography>
      )}

      <Box
        sx={{
          border: error ? "1px solid" : "none",
          borderColor: error ? "error.main" : "transparent",
          borderRadius: 1,
        }}
        data-color-mode={colorMode}
      >
        <MDEditor
          value={value}
          onChange={handleChange}
          preview="live"
          height={minHeight}
          visibleDragbar={false}
          textareaProps={{
            placeholder: placeholder || t("markdown_editor.placeholder"),
            disabled,
          }}
          previewOptions={{
            rehypePlugins: [],
          }}
          commands={[
            commands.bold,
            commands.italic,
            commands.strikethrough,
            commands.divider,
            commands.title1,
            commands.title2,
            commands.title3,
            commands.divider,
            commands.link,
            commands.quote,
            commands.code,
            commands.divider,
            commands.unorderedListCommand,
            commands.orderedListCommand,
            commands.checkedListCommand,
            commands.divider,
            commands.help,
          ]}
        />
      </Box>

      {(helperText || showCharCount) && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mt: 0.5,
          }}
        >
          <Typography
            variant="caption"
            sx={{
              color: error ? "error.main" : "text.secondary",
            }}
          >
            {helperText}
          </Typography>

          {showCharCount && (
            <Typography
              variant="caption"
              sx={{
                color:
                  currentLength > maxLength! * 0.9
                    ? "warning.main"
                    : "text.secondary",
              }}
            >
              {t("markdown_editor.character_count", {
                current: currentLength,
                max: maxLength,
              })}
            </Typography>
          )}
        </Box>
      )}
    </Box>
  );
};

export default MarkdownEditor;
