"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";
import { createSignInWithPasswordUseCase } from "@/modules/auth/application/use-cases/sign-in-with-password.use-case";
import { HttpPasswordAuthClient } from "@/modules/auth/infrastructure/password-auth-client";
import { routes } from "@/shared/constants/routes";
import { useI18n } from "@/shared/providers/locale-provider";
import { useNotifier } from "@/shared/providers/notifier-provider";
import {
  AppButton,
  AppCard,
  AppInput,
  LocaleSwitcher,
  ThemeModeSwitcher,
} from "@/shared/ui";

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

  const [login, setLogin] = useState("demo");
  const [password, setPassword] = useState("demo123");
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
      router.replace(routes.admin);
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
    <main className="mx-auto flex min-h-screen w-full max-w-5xl items-center justify-center p-4 md:p-6">
      <div className="grid w-full gap-4 md:grid-cols-[1fr_360px]">
        <AppCard className="order-2 md:order-1" variant="outlined">
          <div className="space-y-5">
            <div className="space-y-1">
              <h1 className="text-xl font-semibold text-foreground md:text-2xl">{t("auth.login.title")}</h1>
              <p className="text-sm text-muted-foreground">{t("auth.login.subtitle")}</p>
            </div>

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

              {errors.form ? <p className="text-sm text-danger">{errors.form}</p> : null}

              <AppButton
                fullWidth
                isLoading={isSubmitting}
                label={t("auth.login.submit")}
                loadingLabel={t("common.loading")}
                type="submit"
                variant="primary"
              />
            </form>

            <div className="rounded-lg border border-border bg-muted/40 p-3 text-sm text-muted-foreground">
              <p className="font-medium text-foreground">{t("auth.login.demoTitle")}</p>
              <p>{t("auth.login.demoAdmin")}</p>
              <p>{t("auth.login.demoManager")}</p>
            </div>

            <Link className="inline-flex text-sm font-medium text-primary hover:underline" href={routes.home}>
              {t("auth.login.backHome")}
            </Link>
          </div>
        </AppCard>

        <AppCard className="order-1 md:order-2" variant="outlined">
          <div className="grid gap-3">
            <ThemeModeSwitcher />
            <LocaleSwitcher />
          </div>
        </AppCard>
      </div>
    </main>
  );
}
