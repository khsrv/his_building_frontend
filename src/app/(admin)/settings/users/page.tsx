"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, Box, Chip, Snackbar, Typography, Checkbox, FormControlLabel } from "@mui/material";
import {
  AppPageHeader,
  AppButton,
  AppDataTable,
  AppDrawerForm,
  AppInput,
  AppSelect,
  AppStatePanel,
  ShimmerBox,
  ConfirmDialog,
} from "@/shared/ui";
import type { AppDataTableColumn } from "@/shared/ui/primitives/data-table/types";
import type { AppActionMenuGroup } from "@/shared/ui/primitives/action-menu";
import { routes } from "@/shared/constants/routes";
import { useUsersListQuery } from "@/modules/admin/presentation/hooks/use-users-list-query";
import { useCreateUserMutation } from "@/modules/admin/presentation/hooks/use-create-user-mutation";
import { useUpdateUserRoleMutation } from "@/modules/admin/presentation/hooks/use-update-user-role-mutation";
import { useToggleCanLoginMutation } from "@/modules/admin/presentation/hooks/use-toggle-can-login-mutation";
import { useDeleteUserMutation } from "@/modules/admin/presentation/hooks/use-delete-user-mutation";
import { useResetPasswordMutation } from "@/modules/admin/presentation/hooks/use-reset-password-mutation";
import { useUserPropertyAccessQuery } from "@/modules/admin/presentation/hooks/use-user-property-access-query";
import { useSetUserPropertyAccessMutation } from "@/modules/admin/presentation/hooks/use-set-user-property-access-mutation";
import { useBuildingsQuery } from "@/modules/buildings/presentation/hooks/use-buildings.query";
import { useAuth } from "@/modules/auth/presentation/hooks/use-auth";
import type { AdminUser, BackendRole } from "@/modules/admin/domain/admin";
import { useI18n } from "@/shared/providers/locale-provider";

// ─── Types ────────────────────────────────────────────────────────────────────

interface RoleConfig {
  label: string;
  description: string;
  color: string;
  bgColor: string;
}

function generatePassword(length = 12): string {
  const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%&*";
  const arr = new Uint8Array(length);
  crypto.getRandomValues(arr);
  return Array.from(arr, (byte) => charset[byte % charset.length]).join("");
}

function formatDate(dateStr: string, localeCode: string): string {
  try {
    return new Date(dateStr).toLocaleDateString(localeCode, {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

function getPasswordStrength(password: string): { level: "weak" | "medium" | "strong"; color: string } {
  if (password.length < 8) return { level: "weak", color: "#dc2626" };
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasDigit = /\d/.test(password);
  const hasSpecial = /[^a-zA-Z0-9]/.test(password);
  const score = [hasUpper, hasLower, hasDigit, hasSpecial].filter(Boolean).length;
  if (score >= 3 && password.length >= 10) return { level: "strong", color: "#16a34a" };
  if (score >= 2) return { level: "medium", color: "#ea580c" };
  return { level: "weak", color: "#dc2626" };
}

interface CreateFormState {
  fullName: string;
  email: string;
  password: string;
  passwordConfirm: string;
  role: BackendRole;
  showPassword: boolean;
}

type CreateFormErrors = Partial<Record<"fullName" | "email" | "password" | "passwordConfirm" | "server", string>>;

const INITIAL_CREATE_FORM: CreateFormState = {
  fullName: "",
  email: "",
  password: "",
  passwordConfirm: "",
  role: "manager",
  showPassword: false,
};

interface ToggleLoginState {
  userId: string;
  userName: string;
  userEmail: string;
  currentCanLogin: boolean;
}

interface ChangeRoleState {
  userId: string;
  userName: string;
  currentRole: BackendRole;
}

interface DeleteState {
  userId: string;
  userName: string;
  userEmail: string;
}

interface ResetPasswordState {
  userId: string;
  userName: string;
}

interface PropertyAccessState {
  userId: string;
  userName: string;
}

// ─── RoleBadge ────────────────────────────────────────────────────────────────

function RoleBadge({ role, getRoleConfig }: { role: BackendRole; getRoleConfig: (r: BackendRole) => RoleConfig }) {
  const config = getRoleConfig(role);
  return (
    <Chip
      label={config.label}
      size="small"
      sx={{ fontWeight: 600, fontSize: 12, color: config.color, bgcolor: config.bgColor, border: "none" }}
    />
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SettingsUsersPage() {
  const { locale, t } = useI18n();
  const { data, isLoading, isError } = useUsersListQuery({ limit: 100 });
  const { data: buildingsData } = useBuildingsQuery();

  const createMutation = useCreateUserMutation();
  const updateRoleMutation = useUpdateUserRoleMutation();
  const toggleLoginMutation = useToggleCanLoginMutation();
  const deleteMutation = useDeleteUserMutation();
  const resetPasswordMutation = useResetPasswordMutation();
  const setPropertyAccessMutation = useSetUserPropertyAccessMutation();
  const { user: currentUser } = useAuth();

  const localeCode =
    locale === "en" ? "en-US" : locale === "uz" ? "uz-UZ" : locale === "tg" ? "tg-TJ" : "ru-RU";

  // ─── Role config ────────────────────────────────────────────────────────────

  const roleConfig = useMemo<Record<Exclude<BackendRole, "super_admin">, RoleConfig>>(
    () => ({
      company_admin:     { label: t("settings.users.role.companyAdmin"),     description: t("settings.users.roleDesc.companyAdmin"),     color: "#7c3aed", bgColor: "#7c3aed20" },
      sales_head:        { label: t("settings.users.role.salesHead"),        description: t("settings.users.roleDesc.salesHead"),        color: "#2563eb", bgColor: "#2563eb20" },
      manager:           { label: t("settings.users.role.manager"),          description: t("settings.users.roleDesc.manager"),          color: "#0891b2", bgColor: "#0891b220" },
      accountant:        { label: t("settings.users.role.accountant"),       description: t("settings.users.roleDesc.accountant"),       color: "#16a34a", bgColor: "#16a34a20" },
      cashier:           { label: t("settings.users.role.cashier"),          description: t("settings.users.roleDesc.cashier"),          color: "#65a30d", bgColor: "#65a30d20" },
      foreman:           { label: t("settings.users.role.foreman"),          description: t("settings.users.roleDesc.foreman"),          color: "#ea580c", bgColor: "#ea580c20" },
      warehouse_manager: { label: t("settings.users.role.warehouseManager"), description: t("settings.users.roleDesc.warehouseManager"), color: "#92400e", bgColor: "#92400e20" },
      broker:            { label: t("settings.users.role.broker"),           description: t("settings.users.roleDesc.broker"),           color: "#6366f1", bgColor: "#6366f120" },
    }),
    [t],
  );

  const getRoleConfig = useCallback(
    (role: BackendRole): RoleConfig => {
      if (role === "super_admin") return { label: t("settings.users.role.superAdmin"), description: "", color: "#dc2626", bgColor: "#dc262620" };
      return roleConfig[role] ?? { label: role, description: "", color: "#64748b", bgColor: "#64748b20" };
    },
    [roleConfig, t],
  );

  const roleSelectOptions: { value: BackendRole; label: string }[] = [
    { value: "sales_head",        label: t("settings.users.roleLine.salesHead") },
    { value: "manager",           label: t("settings.users.roleLine.manager") },
    { value: "broker",            label: t("settings.users.roleLine.broker") },
    { value: "accountant",        label: t("settings.users.roleLine.accountant") },
    { value: "cashier",           label: t("settings.users.roleLine.cashier") },
    { value: "warehouse_manager", label: t("settings.users.roleLine.warehouseManager") },
    { value: "foreman",           label: t("settings.users.roleLine.foreman") },
    { value: "company_admin",     label: t("settings.users.roleLine.companyAdmin") },
  ];

  const roleFilterOptions = [
    { value: "", label: t("settings.users.allRoles") },
    ...Object.entries(roleConfig).map(([value, config]) => ({ value, label: config.label })),
  ];

  // ─── UI state ───────────────────────────────────────────────────────────────

  const [roleFilter, setRoleFilter]                   = useState("");
  const [createDrawerOpen, setCreateDrawerOpen]       = useState(false);
  const [createForm, setCreateForm]                   = useState<CreateFormState>(INITIAL_CREATE_FORM);
  const [createErrors, setCreateErrors]               = useState<CreateFormErrors>({});
  const [toast, setToast]                             = useState<string | null>(null);
  const [createdCredentials, setCreatedCredentials]   = useState<{ email: string; password: string } | null>(null);
  const [roleDrawerOpen, setRoleDrawerOpen]           = useState(false);
  const [changeRoleState, setChangeRoleState]         = useState<ChangeRoleState | null>(null);
  const [selectedRole, setSelectedRole]               = useState<BackendRole>("manager");
  const [toggleLoginState, setToggleLoginState]       = useState<ToggleLoginState | null>(null);
  const [deleteState, setDeleteState]                 = useState<DeleteState | null>(null);
  const [resetPwState, setResetPwState]               = useState<ResetPasswordState | null>(null);
  const [resetPassword, setResetPassword]             = useState("");
  const [resetPasswordConfirm, setResetPasswordConfirm] = useState("");
  const [resetPasswordError, setResetPasswordError]   = useState("");
  const [resetShowPassword, setResetShowPassword]     = useState(false);
  const [propertyAccessState, setPropertyAccessState] = useState<PropertyAccessState | null>(null);
  const [selectedPropertyIds, setSelectedPropertyIds] = useState<string[]>([]);

  // Load property access when drawer opens
  const propertyAccessQuery = useUserPropertyAccessQuery(propertyAccessState?.userId ?? null);

  useEffect(() => {
    if (propertyAccessQuery.data) {
      setSelectedPropertyIds(propertyAccessQuery.data);
    }
  }, [propertyAccessQuery.data]);

  const buildings = buildingsData ?? [];
  const users = data?.items ?? [];
  const totalCount = data?.total ?? users.length;
  const filteredUsers = roleFilter ? users.filter((u) => u.role === roleFilter) : users;

  // ─── Table columns ──────────────────────────────────────────────────────────

  const columns: readonly AppDataTableColumn<AdminUser>[] = [
    {
      id: "fullName",
      header: t("settings.users.columns.employee"),
      cell: (row) => (
        <div style={{ opacity: row.canLogin ? 1 : 0.5 }}>
          <p className="text-sm font-medium text-foreground">{row.fullName}</p>
          <p className="text-xs text-muted-foreground">{row.email}</p>
        </div>
      ),
      searchAccessor: (row) => `${row.fullName} ${row.email}`,
      sortAccessor: (row) => row.fullName,
    },
    {
      id: "role",
      header: t("settings.users.columns.role"),
      cell: (row) => (
        <span style={{ opacity: row.canLogin ? 1 : 0.5 }}>
          <RoleBadge role={row.role} getRoleConfig={getRoleConfig} />
        </span>
      ),
      sortAccessor: (row) => row.role,
    },
    {
      id: "canLogin",
      header: t("settings.users.columns.status"),
      cell: (row) => (
        <div className="flex items-center gap-1.5">
          <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: row.canLogin ? "#16a34a" : "#dc2626" }} />
          <span className="text-xs" style={{ opacity: row.canLogin ? 1 : 0.5 }}>
            {row.canLogin ? t("settings.users.status.active") : t("settings.users.status.blocked")}
          </span>
        </div>
      ),
    },
    {
      id: "createdAt",
      header: t("settings.users.columns.createdAt"),
      cell: (row) => <span style={{ opacity: row.canLogin ? 1 : 0.5 }}>{formatDate(row.createdAt, localeCode)}</span>,
      sortAccessor: (row) => row.createdAt,
    },
  ];

  // ─── Row actions ────────────────────────────────────────────────────────────

  const getRowActions = useCallback(
    (row: AdminUser): readonly AppActionMenuGroup[] => {
      const isSelf = currentUser?.id === row.id;
      if (isSelf) return [];

      return [
        {
          id: "main",
          items: [
            {
              id: "change-role",
              label: t("settings.users.actions.changeRole"),
              onClick: () => {
                setChangeRoleState({ userId: row.id, userName: row.fullName, currentRole: row.role });
                setSelectedRole(row.role);
                setRoleDrawerOpen(true);
              },
            },
            {
              id: "property-access",
              label: t("settings.users.actions.propertyAccess"),
              onClick: () => {
                setSelectedPropertyIds([]);
                setPropertyAccessState({ userId: row.id, userName: row.fullName });
              },
            },
            {
              id: "reset-password",
              label: t("settings.users.actions.resetPassword"),
              onClick: () => {
                setResetPassword("");
                setResetPasswordConfirm("");
                setResetPasswordError("");
                setResetShowPassword(false);
                setResetPwState({ userId: row.id, userName: row.fullName });
              },
            },
            {
              id: "toggle-login",
              label: row.canLogin ? t("settings.users.actions.block") : t("settings.users.actions.unblock"),
              onClick: () => {
                setToggleLoginState({ userId: row.id, userName: row.fullName, userEmail: row.email, currentCanLogin: row.canLogin });
              },
            },
          ],
        },
        {
          id: "danger",
          items: [
            {
              id: "delete",
              label: t("settings.users.actions.delete"),
              destructive: true,
              onClick: () => {
                setDeleteState({ userId: row.id, userName: row.fullName, userEmail: row.email });
              },
            },
          ],
        },
      ];
    },
    [currentUser?.id, t],
  );

  // ─── Handlers ───────────────────────────────────────────────────────────────

  function validateCreateForm(): boolean {
    const next: CreateFormErrors = {};
    if (!createForm.fullName.trim() || createForm.fullName.trim().length < 2) next.fullName = t("settings.users.validation.min2");
    if (!createForm.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(createForm.email)) next.email = t("settings.users.validation.email");
    if (createForm.password.length < 8) next.password = t("settings.users.validation.passMin");
    else if (createForm.password.length > 72) next.password = t("settings.users.validation.passMax");
    if (createForm.password !== createForm.passwordConfirm) next.passwordConfirm = t("settings.users.validation.passMatch");
    setCreateErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleCreateSave() {
    if (!validateCreateForm()) return;
    const savedPassword = createForm.password;
    const savedEmail = createForm.email.trim();
    createMutation.mutate(
      { fullName: createForm.fullName.trim(), email: savedEmail, password: savedPassword, role: createForm.role },
      {
        onSuccess: () => {
          setCreateDrawerOpen(false);
          setCreateForm(INITIAL_CREATE_FORM);
          setCreateErrors({});
          setCreatedCredentials({ email: savedEmail, password: savedPassword });
          setToast(t("settings.users.toast.added"));
        },
        onError: (error) => {
          const msg = error instanceof Error ? error.message : "";
          if (msg.includes("409") || msg.toLowerCase().includes("already")) setCreateErrors({ server: t("settings.users.server.userExists") });
          else if (msg.includes("429") || msg.toLowerCase().includes("limit")) setCreateErrors({ server: t("settings.users.server.limitReached") });
          else setCreateErrors({ server: msg || t("settings.users.server.createFailed") });
        },
      },
    );
  }

  function handleRoleSave() {
    if (!changeRoleState) return;
    updateRoleMutation.mutate(
      { id: changeRoleState.userId, input: { role: selectedRole } },
      {
        onSuccess: () => {
          setRoleDrawerOpen(false);
          setChangeRoleState(null);
          setToast(t("settings.users.toast.roleChanged"));
        },
      },
    );
  }

  function handleToggleLoginConfirm() {
    if (!toggleLoginState) return;
    toggleLoginMutation.mutate(
      { id: toggleLoginState.userId, input: { canLogin: !toggleLoginState.currentCanLogin } },
      {
        onSuccess: () => {
          const wasBlocking = toggleLoginState.currentCanLogin;
          setToggleLoginState(null);
          setToast(wasBlocking ? t("settings.users.toast.blocked") : t("settings.users.toast.unblocked"));
        },
      },
    );
  }

  function handleDeleteConfirm() {
    if (!deleteState) return;
    deleteMutation.mutate(deleteState.userId, {
      onSuccess: () => {
        setDeleteState(null);
        setToast(t("settings.users.toast.deleted"));
      },
    });
  }

  function handleResetPasswordSave() {
    if (!resetPwState) return;
    if (resetPassword.length < 8) { setResetPasswordError(t("settings.users.validation.passMin")); return; }
    if (resetPassword !== resetPasswordConfirm) { setResetPasswordError(t("settings.users.validation.passMatch")); return; }
    resetPasswordMutation.mutate(
      { id: resetPwState.userId, password: resetPassword },
      {
        onSuccess: () => {
          setResetPwState(null);
          setResetPassword("");
          setResetPasswordConfirm("");
          setToast(t("settings.users.toast.passwordReset"));
        },
        onError: (error) => {
          setResetPasswordError(error instanceof Error ? error.message : t("settings.users.server.createFailed"));
        },
      },
    );
  }

  function handlePropertyAccessSave() {
    if (!propertyAccessState) return;
    setPropertyAccessMutation.mutate(
      { id: propertyAccessState.userId, propertyIds: selectedPropertyIds },
      {
        onSuccess: () => {
          setPropertyAccessState(null);
          setToast(t("settings.users.toast.propertyAccessSaved"));
        },
      },
    );
  }

  function togglePropertyId(id: string) {
    setSelectedPropertyIds((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id],
    );
  }

  async function handleCopyCredentials() {
    if (!createdCredentials) return;
    const text = `${t("settings.users.credentials.email")}: ${createdCredentials.email}\n${t("settings.users.credentials.password")}: ${createdCredentials.password}`;
    try {
      await navigator.clipboard.writeText(text);
      setToast(t("settings.users.toast.copiedCredentials"));
    } catch {
      setToast(t("settings.users.toast.copyFailed"));
    }
    setCreatedCredentials(null);
  }

  async function handleCopyPassword() {
    if (!createForm.password) return;
    try { await navigator.clipboard.writeText(createForm.password); setToast(t("settings.users.toast.passwordCopied")); } catch { /* ignore */ }
  }

  const pwStrength = createForm.password ? getPasswordStrength(createForm.password) : null;
  const pwStrengthLabel = pwStrength
    ? pwStrength.level === "strong" ? t("settings.users.passwordStrength.strong")
      : pwStrength.level === "medium" ? t("settings.users.passwordStrength.medium")
      : t("settings.users.passwordStrength.weak")
    : null;

  const resetPwStrength = resetPassword ? getPasswordStrength(resetPassword) : null;

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <main className="space-y-6 p-4 md:p-6">
      <AppPageHeader
        title={t("settings.users.title")}
        subtitle={t("settings.users.subtitle", { count: totalCount })}
        breadcrumbs={[
          { id: "dashboard", label: t("nav.dashboard"), href: routes.dashboard },
          { id: "settings", label: t("nav.settings"), href: routes.settings },
          { id: "users", label: t("settings.users.title") },
        ]}
        actions={
          <AppButton
            label={t("settings.users.addButton")}
            variant="primary"
            size="md"
            onClick={() => { setCreateForm(INITIAL_CREATE_FORM); setCreateErrors({}); setCreateDrawerOpen(true); }}
          />
        }
      />

      {isLoading && (
        <div className="space-y-3">
          <ShimmerBox className="h-16 w-full" />
          <ShimmerBox className="h-96 w-full" />
        </div>
      )}

      {isError && (
        <AppStatePanel tone="error" title={t("settings.users.error.title")} description={t("settings.users.error.description")} />
      )}

      {!isLoading && !isError && (
        <>
          <div className="flex flex-wrap gap-3">
            <div className="w-48">
              <AppSelect
                id="role-filter"
                label={t("settings.users.columns.role")}
                options={roleFilterOptions}
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
              />
            </div>
          </div>
          <AppDataTable
            columns={columns}
            data={filteredUsers}
            rowKey={(row) => row.id}
            rowActions={getRowActions}
            rowActionsTriggerLabel={t("actionMenu.trigger")}
            searchPlaceholder={t("settings.users.searchPlaceholder")}
            enableSettings
            storageKey="settings-users-table"
          />
        </>
      )}

      {/* ── Create user drawer ─────────────────────────────────────────────── */}
      <AppDrawerForm
        open={createDrawerOpen}
        title={t("settings.users.create.title")}
        subtitle={t("settings.users.create.subtitle")}
        saveLabel={t("settings.users.create.save")}
        cancelLabel={t("common.cancel")}
        isSaving={createMutation.isPending}
        saveDisabled={createMutation.isPending}
        onClose={() => setCreateDrawerOpen(false)}
        onSave={handleCreateSave}
      >
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {createErrors.server ? <Alert severity="error" sx={{ borderRadius: 2 }}>{createErrors.server}</Alert> : null}
          <AppInput label={t("settings.users.fields.fullNameRequired")} value={createForm.fullName} onChangeValue={(v) => setCreateForm((p) => ({ ...p, fullName: v }))} placeholder={t("settings.users.placeholders.fullName")} {...(createErrors.fullName ? { errorText: createErrors.fullName } : {})} />
          <AppInput label={t("settings.users.fields.emailRequired")} type="email" value={createForm.email} onChangeValue={(v) => setCreateForm((p) => ({ ...p, email: v }))} placeholder={t("settings.users.placeholders.email")} {...(createErrors.email ? { errorText: createErrors.email } : {})} />
          <Box>
            <AppInput label={t("settings.users.fields.passwordRequired")} type={createForm.showPassword ? "text" : "password"} value={createForm.password} onChangeValue={(v) => setCreateForm((p) => ({ ...p, password: v }))} placeholder={t("settings.users.placeholders.password")} {...(createErrors.password ? { errorText: createErrors.password } : {})} />
            {pwStrength ? <Typography variant="caption" sx={{ mt: 0.5, display: "block", color: pwStrength.color, fontWeight: 600 }}>{t("settings.users.passwordStrength")}: {pwStrengthLabel}</Typography> : null}
            <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
              <AppButton label={createForm.showPassword ? t("settings.users.actions.hide") : t("settings.users.actions.show")} variant="outline" size="sm" onClick={() => setCreateForm((p) => ({ ...p, showPassword: !p.showPassword }))} />
              <AppButton label={t("settings.users.actions.generate")} variant="outline" size="sm" onClick={() => { const pw = generatePassword(); setCreateForm((p) => ({ ...p, password: pw, passwordConfirm: pw, showPassword: true })); }} />
              {createForm.password ? <AppButton label={t("settings.users.actions.copy")} variant="outline" size="sm" onClick={() => void handleCopyPassword()} /> : null}
            </Box>
          </Box>
          <AppInput label={t("settings.users.fields.passwordConfirmRequired")} type={createForm.showPassword ? "text" : "password"} value={createForm.passwordConfirm} onChangeValue={(v) => setCreateForm((p) => ({ ...p, passwordConfirm: v }))} placeholder={t("settings.users.placeholders.passwordConfirm")} {...(createErrors.passwordConfirm ? { errorText: createErrors.passwordConfirm } : {})} />
          <AppSelect label={t("settings.users.fields.roleRequired")} id="create-user-role" options={roleSelectOptions} value={createForm.role} onChange={(e) => setCreateForm((p) => ({ ...p, role: e.target.value as BackendRole }))} />
        </Box>
      </AppDrawerForm>

      {/* ── Change role drawer ─────────────────────────────────────────────── */}
      <AppDrawerForm
        open={roleDrawerOpen}
        title={t("settings.users.changeRole.title", { name: changeRoleState?.userName ?? "" })}
        subtitle={t("settings.users.changeRole.subtitle")}
        saveLabel={t("common.save")}
        cancelLabel={t("common.cancel")}
        isSaving={updateRoleMutation.isPending}
        saveDisabled={updateRoleMutation.isPending}
        onClose={() => { setRoleDrawerOpen(false); setChangeRoleState(null); }}
        onSave={handleRoleSave}
      >
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {changeRoleState ? (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
              <Typography variant="body2" color="text.secondary">{t("settings.users.changeRole.current")}</Typography>
              <RoleBadge role={changeRoleState.currentRole} getRoleConfig={getRoleConfig} />
            </Box>
          ) : null}
          <AppSelect label={t("settings.users.changeRole.newRole")} id="change-user-role" options={roleSelectOptions} value={selectedRole} onChange={(e) => setSelectedRole(e.target.value as BackendRole)} />
          <Alert severity="info" sx={{ borderRadius: 2 }}>{t("settings.users.changeRole.subtitle")}</Alert>
        </Box>
      </AppDrawerForm>

      {/* ── Reset password drawer ──────────────────────────────────────────── */}
      <AppDrawerForm
        open={resetPwState !== null}
        title={t("settings.users.resetPassword.title", { name: resetPwState?.userName ?? "" })}
        subtitle={t("settings.users.resetPassword.subtitle")}
        saveLabel={t("settings.users.resetPassword.save")}
        cancelLabel={t("common.cancel")}
        isSaving={resetPasswordMutation.isPending}
        saveDisabled={resetPasswordMutation.isPending}
        onClose={() => { setResetPwState(null); setResetPassword(""); setResetPasswordConfirm(""); setResetPasswordError(""); }}
        onSave={handleResetPasswordSave}
      >
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {resetPasswordError ? <Alert severity="error" sx={{ borderRadius: 2 }}>{resetPasswordError}</Alert> : null}
          <Box>
            <AppInput label={t("settings.users.fields.passwordRequired")} type={resetShowPassword ? "text" : "password"} value={resetPassword} onChangeValue={(v) => { setResetPassword(v); setResetPasswordError(""); }} placeholder={t("settings.users.placeholders.password")} />
            {resetPwStrength ? <Typography variant="caption" sx={{ mt: 0.5, display: "block", color: resetPwStrength.color, fontWeight: 600 }}>{t("settings.users.passwordStrength")}: {resetPwStrength.level === "strong" ? t("settings.users.passwordStrength.strong") : resetPwStrength.level === "medium" ? t("settings.users.passwordStrength.medium") : t("settings.users.passwordStrength.weak")}</Typography> : null}
            <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
              <AppButton label={resetShowPassword ? t("settings.users.actions.hide") : t("settings.users.actions.show")} variant="outline" size="sm" onClick={() => setResetShowPassword((v) => !v)} />
              <AppButton label={t("settings.users.actions.generate")} variant="outline" size="sm" onClick={() => { const pw = generatePassword(); setResetPassword(pw); setResetPasswordConfirm(pw); setResetShowPassword(true); }} />
            </Box>
          </Box>
          <AppInput label={t("settings.users.fields.passwordConfirmRequired")} type={resetShowPassword ? "text" : "password"} value={resetPasswordConfirm} onChangeValue={(v) => { setResetPasswordConfirm(v); setResetPasswordError(""); }} placeholder={t("settings.users.placeholders.passwordConfirm")} />
        </Box>
      </AppDrawerForm>

      {/* ── Property access drawer ─────────────────────────────────────────── */}
      <AppDrawerForm
        open={propertyAccessState !== null}
        title={t("settings.users.propertyAccess.title", { name: propertyAccessState?.userName ?? "" })}
        subtitle={t("settings.users.propertyAccess.subtitle")}
        saveLabel={t("common.save")}
        cancelLabel={t("common.cancel")}
        isSaving={setPropertyAccessMutation.isPending}
        saveDisabled={setPropertyAccessMutation.isPending}
        onClose={() => setPropertyAccessState(null)}
        onSave={handlePropertyAccessSave}
      >
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          <Alert severity="info" sx={{ borderRadius: 2, mb: 1 }}>
            {t("settings.users.propertyAccess.hint")}
          </Alert>
          {propertyAccessQuery.isLoading ? (
            <ShimmerBox className="h-40 w-full" />
          ) : buildings.length === 0 ? (
            <Typography variant="body2" color="text.secondary">{t("settings.users.propertyAccess.noProperties")}</Typography>
          ) : (
            buildings.map((building) => (
              <FormControlLabel
                key={building.id}
                control={
                  <Checkbox
                    checked={selectedPropertyIds.includes(building.id)}
                    onChange={() => togglePropertyId(building.id)}
                    size="small"
                  />
                }
                label={
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {building.name}
                  </Typography>
                }
                sx={{ mx: 0, px: 1, py: 0.5, borderRadius: 1, "&:hover": { bgcolor: "action.hover" } }}
              />
            ))
          )}
          {buildings.length > 0 && selectedPropertyIds.length === 0 ? (
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
              {t("settings.users.propertyAccess.allSelected")}
            </Typography>
          ) : null}
        </Box>
      </AppDrawerForm>

      {/* ── Confirm dialogs ────────────────────────────────────────────────── */}
      <ConfirmDialog
        open={toggleLoginState !== null}
        title={toggleLoginState?.currentCanLogin ? t("settings.users.confirm.blockTitle") : t("settings.users.confirm.unblockTitle")}
        message={toggleLoginState?.currentCanLogin
          ? t("settings.users.confirm.blockMessage", { name: toggleLoginState.userName, email: toggleLoginState.userEmail })
          : t("settings.users.confirm.unblockMessage", { name: toggleLoginState?.userName ?? "", email: toggleLoginState?.userEmail ?? "" })}
        confirmText={toggleLoginState?.currentCanLogin ? t("settings.users.actions.block") : t("settings.users.actions.unblock")}
        cancelText={t("common.cancel")}
        destructive={toggleLoginState?.currentCanLogin === true}
        onConfirm={handleToggleLoginConfirm}
        onClose={() => setToggleLoginState(null)}
      />

      <ConfirmDialog
        open={deleteState !== null}
        title={t("settings.users.confirm.deleteTitle")}
        message={t("settings.users.confirm.deleteMessage", { name: deleteState?.userName ?? "", email: deleteState?.userEmail ?? "" })}
        confirmText={t("settings.users.actions.delete")}
        cancelText={t("common.cancel")}
        destructive
        onConfirm={handleDeleteConfirm}
        onClose={() => setDeleteState(null)}
      />

      {/* ── Toast ──────────────────────────────────────────────────────────── */}
      <Snackbar
        open={toast !== null}
        autoHideDuration={4000}
        onClose={() => setToast(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity="success"
          variant="filled"
          onClose={() => setToast(null)}
          action={
            createdCredentials ? (
              <AppButton label={t("settings.users.actions.copyLoginData")} variant="outline" size="sm" onClick={() => void handleCopyCredentials()} />
            ) : undefined
          }
        >
          {toast}
        </Alert>
      </Snackbar>
    </main>
  );
}
