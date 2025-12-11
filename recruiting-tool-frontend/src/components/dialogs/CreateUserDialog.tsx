import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Typography,
  Box,
  CircularProgress,
  MenuItem,
  Checkbox,
  FormControl,
  FormLabel,
  FormGroup,
  FormControlLabel,
  FormHelperText,
  Autocomplete,
} from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useCreateUser } from "../../hooks/api/useUsers";
import { useCompanies } from "../../hooks/api/useCompanies";
import { UserRoles } from "../../types/user.types";
import { useUserAtom } from "../../hooks/api/state/useUserAtom";
import { hasRole } from "../../utils/permissions";
import { useValidationRules } from "../../utils/validation";
import FormErrorSummary from "../common/FormErrorSummary";

interface CreateUserDialogProps {
  open: boolean;
  onClose: () => void;
}

interface UserFormData {
  name: string;
  email: string;
  password: string;
  roles: UserRoles[];
  companyUid?: string;
}

const CreateUserDialog: React.FC<CreateUserDialogProps> = ({
  open,
  onClose,
}) => {
  const { t } = useTranslation();
  const validationRules = useValidationRules();
  const { user: currentUser } = useUserAtom();
  const isSuperAdmin = hasRole(currentUser, UserRoles.SUPER_ADMIN);

  const {
    register,
    handleSubmit,
    reset,
    control,
    watch,
    formState: { errors },
  } = useForm<UserFormData>({
    defaultValues: {
      name: "",
      email: "",
      password: "",
      roles: [UserRoles.USER],
      companyUid: "",
    },
  });

  const { mutate: createUser, isPending, isError } = useCreateUser();
  const { data: companiesData } = useCompanies();
  const companies = companiesData || [];

  const selectedRoles = watch("roles");

  const onSubmit = (data: UserFormData) => {
    const createData: any = {
      name: data.name,
      email: data.email,
      password: data.password,
      roles: data.roles,
    };

    // Add company if selected
    if (data.companyUid && data.companyUid.trim() !== "") {
      createData.companyUid = data.companyUid;
    }

    createUser(createData, {
      onSuccess: () => {
        reset();
        onClose();
      },
    });
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const availableRoles = [
    { value: UserRoles.USER, label: t("user_roles.user") },
    { value: UserRoles.HR, label: t("user_roles.hr") },
    { value: UserRoles.ADMIN, label: t("user_roles.admin") },
  ];

  // Only SUPER_ADMIN can assign SUPER_ADMIN role
  if (isSuperAdmin) {
    availableRoles.push({
      value: UserRoles.SUPER_ADMIN,
      label: t("user_roles.super_admin"),
    });
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>{t("users.create_title")}</DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          <FormErrorSummary errors={errors} />

          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
            <TextField
              label={t("users.name_label")}
              fullWidth
              {...register(
                "name",
                validationRules.combine(
                  validationRules.required(t("users.name_label")),
                  validationRules.minLength(2),
                  validationRules.maxLength(100),
                ),
              )}
              error={!!errors.name}
              helperText={errors.name?.message}
            />

            <TextField
              label={t("users.email_label")}
              type="email"
              fullWidth
              {...register("email", validationRules.email())}
              error={!!errors.email}
              helperText={errors.email?.message}
            />

            <TextField
              label={t("users.password_label")}
              type="password"
              fullWidth
              {...register(
                "password",
                validationRules.combine(
                  validationRules.required(t("users.password_label")),
                  validationRules.minLength(3),
                  validationRules.maxLength(20),
                ),
              )}
              error={!!errors.password}
              helperText={errors.password?.message}
            />

            <FormControl component="fieldset" error={!!errors.roles}>
              <FormLabel component="legend">{t("users.roles_label")}</FormLabel>
              <FormGroup>
                {availableRoles.map((role) => (
                  <Controller
                    key={role.value}
                    name="roles"
                    control={control}
                    rules={{
                      validate: (value) =>
                        value.length > 0 || t("users.roles_required"),
                    }}
                    render={({ field }) => (
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={field.value?.includes(role.value)}
                            onChange={(e) => {
                              const newValue = e.target.checked
                                ? [...(field.value || []), role.value]
                                : field.value?.filter((r) => r !== role.value);
                              field.onChange(newValue);
                            }}
                          />
                        }
                        label={role.label}
                      />
                    )}
                  />
                ))}
              </FormGroup>
              {errors.roles && (
                <FormHelperText>{errors.roles.message}</FormHelperText>
              )}
            </FormControl>

            {isSuperAdmin && (
              <Controller
                name="companyUid"
                control={control}
                render={({ field }) => (
                  <Autocomplete
                    options={companies}
                    getOptionLabel={(option) => option.name}
                    value={companies.find((c) => c.uid === field.value) || null}
                    onChange={(_, newValue) => {
                      field.onChange(newValue?.uid || "");
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label={t("users.company_label")}
                        helperText={t("users.company_helper")}
                      />
                    )}
                  />
                )}
              />
            )}
          </Box>

          {isError && (
            <Typography color="error" sx={{ mt: 2 }}>
              {t("errors.create_failed", {
                entity: t("users.user_singular").toLowerCase(),
              })}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={isPending}>
            {t("common.cancel")}
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={isPending}
            startIcon={
              isPending ? (
                <CircularProgress size={20} color="inherit" />
              ) : undefined
            }
          >
            {isPending ? t("common.creating") : t("common.create")}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default CreateUserDialog;
