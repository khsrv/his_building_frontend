import {
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import { AppButton } from "@/shared/ui/primitives/button";
import { AppInput } from "@/shared/ui/primitives/input";
import { AppSelect } from "@/shared/ui/primitives/select";
import type { TranslationKey } from "@/shared/i18n/types";
import type {
  AppDataTableFilterOperator,
  AppDataTableFilterRule,
  NormalizedFilterField,
} from "./types";
import { getDefaultOperators } from "./utils";

interface FilterDialogProps<TData> {
  open: boolean;
  onClose: () => void;
  onApply: () => void;
  onReset: () => void;
  canApply: boolean;
  filterFields: readonly NormalizedFilterField<TData>[];
  filterFieldById: Map<string, NormalizedFilterField<TData>>;
  advancedRulesDraft: readonly AppDataTableFilterRule[];
  operatorLabels: Record<AppDataTableFilterOperator, string>;
  onAddRule: () => void;
  onUpdateRule: (
    ruleId: string,
    update: Partial<Pick<AppDataTableFilterRule, "fieldId" | "operator" | "value" | "valueTo">>,
  ) => void;
  onRemoveRule: (ruleId: string) => void;
  t: (key: TranslationKey) => string;
}

export function FilterDialog<TData>({
  open,
  onClose,
  onApply,
  onReset,
  canApply,
  filterFields,
  filterFieldById,
  advancedRulesDraft,
  operatorLabels,
  onAddRule,
  onUpdateRule,
  onRemoveRule,
  t,
}: FilterDialogProps<TData>) {
  return (
    <Dialog fullWidth maxWidth="lg" onClose={onClose} open={open}>
      <DialogTitle>{t("table.filter.title")}</DialogTitle>
      <DialogContent>
        {filterFields.length === 0 ? (
          <Typography color="text.secondary" variant="body2">
            {t("table.filter.noFields")}
          </Typography>
        ) : (
          <Stack spacing={1.25}>
            {advancedRulesDraft.length === 0 ? (
              <Typography color="text.secondary" variant="body2">
                {t("table.filter.noRules")}
              </Typography>
            ) : null}

            {advancedRulesDraft.map((rule) => {
              const field = filterFieldById.get(rule.fieldId) ?? filterFields[0];
              if (!field) {
                return null;
              }
              const isBetween = rule.operator === "between";
              const isBooleanOperator = rule.operator === "isTrue" || rule.operator === "isFalse";
              const valueInputType =
                field.type === "number" || field.type === "date" ? field.type : "text";
              const operatorOptions = (field.operators ?? getDefaultOperators("text")).map(
                (operator) => ({
                  value: operator,
                  label: operatorLabels[operator] ?? operator,
                }),
              );
              const useSelectValueInput =
                !isBooleanOperator && (field.type === "select" || field.type === "boolean");
              const valueOptions = field.options.map((option) => ({
                value: option.value,
                label: option.label,
              }));

              return (
                <Stack
                  alignItems={{ md: "center" }}
                  direction={{ xs: "column", md: "row" }}
                  key={rule.id}
                  spacing={0.75}
                >
                  <Box sx={{ width: { xs: "100%", md: 220 } }}>
                    <AppSelect
                      onChange={(event) =>
                        onUpdateRule(rule.id, { fieldId: event.target.value })
                      }
                      options={filterFields.map((item) => ({
                        value: item.id,
                        label: item.label,
                      }))}
                      value={field.id}
                    />
                  </Box>
                  <Box sx={{ width: { xs: "100%", md: 180 } }}>
                    <AppSelect
                      onChange={(event) =>
                        onUpdateRule(rule.id, {
                          operator: event.target.value as AppDataTableFilterOperator,
                        })
                      }
                      options={operatorOptions}
                      value={rule.operator}
                    />
                  </Box>
                  <Box sx={{ width: { xs: "100%", md: 220 } }}>
                    {isBooleanOperator ? null : useSelectValueInput ? (
                      <AppSelect
                        onChange={(event) =>
                          onUpdateRule(rule.id, { value: event.target.value })
                        }
                        options={valueOptions}
                        value={rule.value}
                      />
                    ) : (
                      <AppInput
                        onChangeValue={(nextValue) =>
                          onUpdateRule(rule.id, { value: nextValue })
                        }
                        placeholder={t("table.filter.value")}
                        type={valueInputType}
                        value={rule.value}
                      />
                    )}
                  </Box>
                  {isBetween && !isBooleanOperator ? (
                    <Box sx={{ width: { xs: "100%", md: 220 } }}>
                      <AppInput
                        onChangeValue={(nextValue) =>
                          onUpdateRule(rule.id, { valueTo: nextValue })
                        }
                        placeholder={t("table.filter.valueTo")}
                        type={valueInputType}
                        value={rule.valueTo ?? ""}
                      />
                    </Box>
                  ) : null}
                  <IconButton
                    aria-label={t("table.filter.removeRule")}
                    onClick={() => onRemoveRule(rule.id)}
                    sx={{ border: 1, borderColor: "divider" }}
                  >
                    ×
                  </IconButton>
                </Stack>
              );
            })}

            <Box>
              <AppButton
                label={t("table.filter.addRule")}
                onClick={onAddRule}
                size="sm"
                variant="outline"
              />
            </Box>
          </Stack>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <AppButton label={t("table.reset")} onClick={onReset} variant="secondary" />
        <AppButton label={t("widget.filter.close")} onClick={onClose} variant="text" />
        <AppButton
          disabled={!canApply}
          label={t("datePicker.apply")}
          onClick={onApply}
          variant="primary"
        />
      </DialogActions>
    </Dialog>
  );
}
