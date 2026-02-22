import { useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import {
  Typography,
  TextField,
  Button,
  Divider,
  Link,
  Alert,
} from "@mui/material";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import {
  AuthGroupWrapper,
  AuthPageWrapper,
  FormWrapper,
} from "./Auth.styles";
import { useForgotPassword } from "../../hooks/api/useAuth";

interface ForgotPasswordFormData {
  email: string;
}

const ForgotPasswordPage: React.FC = () => {
  const { t } = useTranslation();
  const [submitted, setSubmitted] = useState(false);
  const { register, handleSubmit } = useForm<ForgotPasswordFormData>();
  const { mutate: requestReset, isPending } = useForgotPassword();

  const onSubmit = (data: ForgotPasswordFormData) => {
    requestReset(data, {
      onSuccess: () => {
        setSubmitted(true);
      },
      onError: () => {
        // Even on error we show the success message to prevent email enumeration
        setSubmitted(true);
      },
    });
  };

  return (
    <AuthPageWrapper>
      <AuthGroupWrapper>
        <Typography variant="h4">
          {t("forgot_password.title")}
        </Typography>
        <Divider />

        {submitted ? (
          <>
            <Alert severity="success">
              {t("forgot_password.success_message")}
            </Alert>
            <Link component={RouterLink} to="/login" underline="hover">
              {t("forgot_password.back_to_login")}
            </Link>
          </>
        ) : (
          <>
            <Typography variant="body2" color="text.secondary">
              {t("forgot_password.description")}
            </Typography>
            <FormWrapper onSubmit={handleSubmit(onSubmit)}>
              <TextField
                label={t("auth.email")}
                size="small"
                fullWidth
                type="email"
                margin="none"
                {...register("email", { required: true })}
              />
              <Button
                type="submit"
                variant="contained"
                fullWidth
                disabled={isPending}
              >
                {isPending
                  ? t("forgot_password.sending")
                  : t("forgot_password.send_link")}
              </Button>
            </FormWrapper>
            <Link component={RouterLink} to="/login" underline="hover">
              {t("forgot_password.back_to_login")}
            </Link>
          </>
        )}
      </AuthGroupWrapper>
    </AuthPageWrapper>
  );
};

export default ForgotPasswordPage;
