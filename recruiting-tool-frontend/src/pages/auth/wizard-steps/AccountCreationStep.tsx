import React from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Checkbox,
  FormControlLabel,
  Link,
  Divider,
} from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { RegistrationFormData } from "../RegistrationWizard";
import SocialLoginButtons from "../../../components/auth/SocialLoginButtons";

interface AccountCreationStepProps {
  formData: RegistrationFormData;
  onNext: (data: Partial<RegistrationFormData>) => void;
  onBack: () => void;
}

interface AccountFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  termsAccepted: boolean;
}

const AccountCreationStep: React.FC<AccountCreationStepProps> = ({
  formData,
  onNext,
  onBack,
}) => {
  const { t } = useTranslation();
  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<AccountFormData>({
    defaultValues: {
      name: formData.name,
      email: formData.email,
      password: formData.password,
      confirmPassword: "",
      termsAccepted: formData.termsAccepted,
    },
  });

  const password = watch("password");

  const onSubmit = (data: AccountFormData) => {
    onNext({
      name: data.name,
      email: data.email,
      password: data.password,
      termsAccepted: data.termsAccepted,
    });
  };

  return (
    <Box>
      <Typography
        variant="h4"
        gutterBottom
        sx={{ mb: 1, fontWeight: 700 }}
      >
        {t("registration_wizard.account_creation.title")}
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        {t("registration_wizard.account_creation.subtitle")}
      </Typography>

      {/* Social Login Buttons (only shown if Auth0 is configured) */}
      <SocialLoginButtons context="signup" />

      <form onSubmit={handleSubmit(onSubmit)}>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
            gap: 0,
          }}
        >
          <TextField
            label={t("auth.name")}
            fullWidth
            margin="normal"
            {...register("name", {
              required: t("validation.name_required"),
              minLength: {
                value: 2,
                message: t("validation.name_min_length", { min: 2 }),
              },
            })}
            error={!!errors.name}
            helperText={errors.name?.message}
            sx={{ gridColumn: "1 / -1" }}
          />

          <TextField
            label={t("auth.email")}
            type="email"
            fullWidth
            margin="normal"
            {...register("email", {
              required: t("validation.email_required"),
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: t("validation.email_invalid"),
              },
            })}
            error={!!errors.email}
            helperText={errors.email?.message}
            sx={{ gridColumn: "1 / -1" }}
          />

          <TextField
            label={t("auth.password")}
            type="password"
            fullWidth
            margin="normal"
            {...register("password", {
              required: t("validation.password_required"),
              minLength: {
                value: 8,
                message: t("validation.password_min_length", { min: 8 }),
              },
            })}
            error={!!errors.password}
            helperText={errors.password?.message}
          />

          <TextField
            label={t("registration_wizard.account_creation.confirm_password")}
            type="password"
            fullWidth
            margin="normal"
            {...register("confirmPassword", {
              required: t(
                "registration_wizard.account_creation.confirm_password_required",
              ),
              validate: (value) =>
                value === password ||
                t("registration_wizard.account_creation.passwords_must_match"),
            })}
            error={!!errors.confirmPassword}
            helperText={errors.confirmPassword?.message}
          />
        </Box>

        <Divider sx={{ my: 3 }} />

        <Controller
          name="termsAccepted"
          control={control}
          rules={{
            required: t("registration_wizard.account_creation.terms_required"),
          }}
          render={({ field }) => (
            <FormControlLabel
              control={<Checkbox {...field} checked={field.value} size="medium" />}
              label={
                <Typography variant="body2">
                  {t("registration_wizard.account_creation.accept_terms")}{" "}
                  <Link href="/terms" target="_blank" underline="hover">
                    {t("registration_wizard.account_creation.terms_of_service")}
                  </Link>
                </Typography>
              }
            />
          )}
        />
        {errors.termsAccepted && (
          <Typography
            variant="caption"
            color="error"
            display="block"
            sx={{ mt: 0.5, ml: 4 }}
          >
            {errors.termsAccepted.message}
          </Typography>
        )}

        <Box sx={{ display: "flex", justifyContent: "space-between", mt: 5 }}>
          <Button onClick={onBack} size="large">
            {t("common.back")}
          </Button>
          <Button type="submit" variant="contained" size="large">
            {t("common.next")}
          </Button>
        </Box>
      </form>
    </Box>
  );
};

export default AccountCreationStep;
