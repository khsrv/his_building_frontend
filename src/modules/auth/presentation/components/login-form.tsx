"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";
import { Box, Paper, Stack, Typography } from "@mui/material";
import { createSignInWithPasswordUseCase } from "@/modules/auth/application/use-cases/sign-in-with-password.use-case";
import { HttpPasswordAuthClient } from "@/modules/auth/infrastructure/password-auth-client";
import { routes } from "@/shared/constants/routes";
import { useI18n } from "@/shared/providers/locale-provider";
import { useNotifier } from "@/shared/providers/notifier-provider";
import { AppButton, AppInput, LocaleSwitcher, ThemeModeSwitcher } from "@/shared/ui";

interface FormErrors {
  login?: string;
  password?: string;
  form?: string;
}

export function LoginForm() {
  const { t } = useI18n();
  const notifier = useNotifier();
  const router = useRouter();
  const signInWithPassword = useMemo(() => {
    return createSignInWithPasswordUseCase(new HttpPasswordAuthClient());
  }, []);

  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const loginInputError = errors.login;
  const passwordInputError = errors.password;

  const resolveErrorMessage = (error: unknown) => {
    const code = error instanceof Error ? error.message : "";

    if (code === "AUTH_INVALID_INPUT") {
      return t("auth.login.validation.fillAll");
    }

    if (code === "AUTH_INVALID_CREDENTIALS") {
      return t("auth.login.validation.invalidCredentials");
    }

    return t("auth.login.error");
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextErrors: FormErrors = {};
    if (!login.trim()) {
      nextErrors.login = t("auth.login.validation.loginRequired");
    }
    if (!password.trim()) {
      nextErrors.password = t("auth.login.validation.passwordRequired");
    }

    if (nextErrors.login || nextErrors.password) {
      setErrors(nextErrors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    try {
      await signInWithPassword({
        login: login.trim(),
        password: password.trim(),
      });

      notifier.success(t("auth.login.success"));
      router.replace(routes.dashboard);
      router.refresh();
    } catch (error) {
      const message = resolveErrorMessage(error);
      setErrors({ form: message });
      notifier.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden p-4">
      <Box
        aria-hidden
        sx={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(520px 240px at 50% -8%, rgba(245, 179, 1, 0.14), transparent 72%), linear-gradient(180deg, rgba(2, 8, 23, 0.04), transparent 34%)",
          pointerEvents: "none",
        }}
      />

      <Paper
        sx={{
          position: "relative",
          zIndex: 1,
          width: "100%",
          maxWidth: 460,
          borderRadius: 4,
          p: { xs: 2.25, md: 2.75 },
        }}
      >
        <Stack spacing={2}>
          <Box sx={{ textAlign: "center" }}>
            <Box
              sx={{
                mx: "auto",
                mb: 1.1,
                width: 52,
                height: 52,
                borderRadius: 2.5,
                border: "1px solid",
                borderColor: "primary.dark",
                color: "primary.dark",
                bgcolor: "primary.main",
                display: "grid",
                placeItems: "center",
                fontSize: 22,
                fontWeight: 800,
              }}
            >
              B
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              BuildCRM
            </Typography>
            <Typography color="text.secondary" sx={{ mt: 0.5 }}>
              {t("auth.login.title")}
            </Typography>
          </Box>

          <form className="space-y-3" onSubmit={onSubmit}>
            <AppInput
              autoComplete="username"
              label={t("auth.login.loginLabel")}
              onChangeValue={setLogin}
              placeholder={t("auth.login.loginPlaceholder")}
              value={login}
              {...(loginInputError ? { errorText: loginInputError } : {})}
            />

            <AppInput
              autoComplete="current-password"
              label={t("auth.login.passwordLabel")}
              onChangeValue={setPassword}
              placeholder={t("auth.login.passwordPlaceholder")}
              type="password"
              value={password}
              {...(passwordInputError ? { errorText: passwordInputError } : {})}
            />

            {errors.form ? (
              <Typography color="error.main" sx={{ fontSize: 13 }}>
                {errors.form}
              </Typography>
            ) : null}

            <AppButton
              fullWidth
              isLoading={isSubmitting}
              label={t("auth.login.submit")}
              loadingLabel={t("common.loading")}
              size="lg"
              type="submit"
              variant="primary"
            />
          </form>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
            <ThemeModeSwitcher />
            <LocaleSwitcher />
          </Stack>

          <Box sx={{ textAlign: "center" }}>
            <Link className="inline-flex text-sm font-semibold text-primary hover:underline" href={routes.home}>
              {t("auth.login.backHome")}
            </Link>
          </Box>
        </Stack>
      </Paper>
    </main>
  );
}
