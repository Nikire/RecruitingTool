import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
} from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { StageType, STAGE_TYPE } from "../../types/stage.types";

interface AddStageDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (stage: StageFormData) => void;
  initialData?: Partial<StageFormData>;
  isEdit?: boolean;
}

export interface StageFormData {
  title: string;
  type: StageType;
  description: string;
  estimatedTime: number;
}

const DEFAULT_STAGE_VALUES: StageFormData = {
  title: "",
  type: "INTERVIEW",
  description: "",
  estimatedTime: 60,
};

/**
 * Dialog for adding or editing a single stage.
 * Used within the StageBuilder component for inline stage management.
 */
const AddStageDialog: React.FC<AddStageDialogProps> = ({
  open,
  onClose,
  onSave,
  initialData,
  isEdit = false,
}) => {
  const { t } = useTranslation();
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<StageFormData>({
    defaultValues: { ...DEFAULT_STAGE_VALUES, ...initialData },
  });

  const onSubmit = (data: StageFormData) => {
    onSave(data);
    reset(DEFAULT_STAGE_VALUES);
    onClose();
  };

  const handleClose = () => {
    reset(DEFAULT_STAGE_VALUES);
    onClose();
  };

  // Seed the form whenever the dialog opens: with the edited stage when there
  // is one, otherwise with empty defaults so a previous edit is not reused.
  React.useEffect(() => {
    if (!open) return;
    reset({ ...DEFAULT_STAGE_VALUES, ...initialData });
  }, [open, initialData, reset]);

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {isEdit ? t("add_stage.edit_title") : t("add_stage.add_title")}
      </DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          <Controller
            name="title"
            control={control}
            rules={{
              required: t("add_stage.title_required"),
              minLength: {
                value: 2,
                message: t("add_stage.title_min_length", { min: 2 }),
              },
              maxLength: {
                value: 100,
                message: t("add_stage.title_max_length", { max: 100 }),
              },
            }}
            render={({ field }) => (
              <TextField
                {...field}
                label={t("add_stage.stage_title")}
                fullWidth
                margin="normal"
                error={!!errors.title}
                helperText={errors.title?.message}
                placeholder={t("add_stage.stage_title_placeholder")}
              />
            )}
          />

          <FormControl fullWidth margin="normal">
            <InputLabel>{t("add_stage.stage_type")}</InputLabel>
            <Controller
              name="type"
              control={control}
              rules={{ required: t("add_stage.type_required") }}
              render={({ field }) => (
                <Select
                  {...field}
                  label={t("add_stage.stage_type")}
                  error={!!errors.type}
                >
                  {Object.keys(STAGE_TYPE).map((value) => (
                    <MenuItem key={value} value={value}>
                      {t(`stage_types.${value.toLowerCase()}`)}
                    </MenuItem>
                  ))}
                </Select>
              )}
            />
            {errors.type && (
              <Typography
                color="error"
                variant="caption"
                sx={{ mt: 0.5, ml: 2 }}
              >
                {errors.type.message}
              </Typography>
            )}
          </FormControl>

          <Controller
            name="description"
            control={control}
            rules={{
              required: t("add_stage.description_required"),
              minLength: {
                value: 10,
                message: t("add_stage.description_min_length", { min: 10 }),
              },
              maxLength: {
                value: 500,
                message: t("add_stage.description_max_length", { max: 500 }),
              },
            }}
            render={({ field }) => (
              <TextField
                {...field}
                label={t("add_stage.description")}
                fullWidth
                multiline
                rows={3}
                margin="normal"
                error={!!errors.description}
                helperText={errors.description?.message}
                placeholder={t("add_stage.description_placeholder")}
              />
            )}
          />

          <Controller
            name="estimatedTime"
            control={control}
            rules={{
              required: t("add_stage.time_required"),
              min: {
                value: 1,
                message: t("add_stage.time_min", { min: 1 }),
              },
              max: {
                value: 10080,
                message: t("add_stage.time_max", { max: 10080 }),
              },
            }}
            render={({ field }) => (
              <TextField
                {...field}
                label={t("add_stage.estimated_time")}
                type="number"
                fullWidth
                margin="normal"
                error={!!errors.estimatedTime}
                helperText={errors.estimatedTime?.message}
                onChange={(e) => {
                  const value = e.target.value;
                  field.onChange(value ? parseInt(value) : undefined);
                }}
                value={field.value ?? ""}
              />
            )}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>{t("common.cancel")}</Button>
          <Button type="submit" variant="contained">
            {isEdit ? t("add_stage.update_stage") : t("add_stage.add_stage")}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default AddStageDialog;
