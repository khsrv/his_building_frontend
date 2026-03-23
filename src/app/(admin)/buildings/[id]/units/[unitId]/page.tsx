"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  AppButton,
  AppPageHeader,
  AppSmartTextInput,
  AppStatCard,
  AppStatePanel,
  AppStatusBadge,
  type AppStatusTone,
  AppDrawerForm,
  AppInput,
  ConfirmDialog,
  ShimmerBox,
} from "@/shared/ui";
import type { PageHeaderCrumb } from "@/shared/ui";
import { routes } from "@/shared/constants/routes";
import { useUnitDetailQuery } from "@/modules/properties/presentation/hooks/use-unit-detail-query";
import { usePropertyDetailQuery } from "@/modules/properties/presentation/hooks/use-property-detail-query";
import { useUpdateUnitMutation } from "@/modules/properties/presentation/hooks/use-update-unit-mutation";
import { useDeleteUnitMutation } from "@/modules/properties/presentation/hooks/use-delete-unit-mutation";
import { useBookUnitMutation } from "@/modules/properties/presentation/hooks/use-book-unit-mutation";
import { useReserveUnitMutation } from "@/modules/properties/presentation/hooks/use-reserve-unit-mutation";
import { useReleaseUnitMutation } from "@/modules/properties/presentation/hooks/use-release-unit-mutation";
import { useDealsListQuery } from "@/modules/deals/presentation/hooks/use-deals-list-query";
import { useClientSearchQuery } from "@/modules/deals/presentation/hooks/use-client-search-query";
import { useClientDetailQuery } from "@/modules/clients/presentation/hooks/use-client-detail-query";
import { UnitPhotoManager } from "@/modules/properties/presentation/components/unit-photo-manager";
import { UnitFormDrawer } from "@/modules/properties/presentation/components/unit-form-drawer";
import type { UnitFormValues } from "@/modules/properties/presentation/components/unit-form-drawer";
import { CreateClientDrawer } from "@/modules/clients/presentation/components/create-client-drawer";
import { normalizeErrorMessage } from "@/shared/lib/errors/normalize-error-message";
import { useNotifier } from "@/shared/providers/notifier-provider";
import type {
  Unit,
  UnitStatus,
  UpdateUnitInput,
} from "@/modules/properties/domain/property";

// ─── Status helpers ──────────────────────────────────────────────────────────

const UNIT_STATUS_LABEL: Record<UnitStatus, string> = {
  available: "Свободна",
  booked: "Забронирована",
  reserved: "Резерв",
  sold: "Продана",
};

const UNIT_STATUS_TONE: Record<UnitStatus, AppStatusTone> = {
  available: "success",
  booked: "warning",
  reserved: "muted",
  sold: "danger",
};

const UNIT_TYPE_LABELS: Record<string, string> = {
  apartment: "Квартира",
  commercial: "Коммерция",
  parking: "Паркинг",
  storage: "Кладовая",
};

// ─── Edit form state ─────────────────────────────────────────────────────────

function unitToFormValues(unit: Unit): UnitFormValues {
  return {
    unitNumber: unit.unitNumber,
    unitType: unit.unitType,
    rooms: unit.rooms !== null ? String(unit.rooms) : "",
    totalArea: unit.totalArea !== null ? String(unit.totalArea) : "",
    livingArea: unit.livingArea !== null ? String(unit.livingArea) : "",
    kitchenArea: unit.kitchenArea !== null ? String(unit.kitchenArea) : "",
    balconyArea: unit.balconyArea !== null ? String(unit.balconyArea) : "",
    pricePerSqm:
      unit.basePrice !== null && unit.totalArea
        ? String(Math.round(unit.basePrice / unit.totalArea))
        : "",
    finishing: unit.finishing ?? "",
    description: unit.description ?? "",
  };
}

function formatMoney(value: number | null): string {
  if (value === null) return "—";
  return `$${value.toLocaleString("ru-RU")}`;
}

function formatArea(value: number | null): string {
  if (value === null) return "—";
  return `${value} м²`;
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function UnitDetailPage() {
  const params = useParams<{ id: string; unitId: string }>();
  const propertyId = params.id;
  const unitId = params.unitId;
  const router = useRouter();
  const notifier = useNotifier();

  // ─── Queries ────────────────────────────────────────────────────────
  const unitQuery = useUnitDetailQuery(unitId);
  const propertyQuery = usePropertyDetailQuery(propertyId);
  const unit = unitQuery.data;
  const property = propertyQuery.data;

  // Client detail for booked/reserved units
  const bookingClientQuery = useClientDetailQuery(unit?.clientId ?? "");
  const bookingClient = bookingClientQuery.data;

  const unitNeedsDeal =
    unit?.status === "booked" || unit?.status === "sold";

  const dealQuery = useDealsListQuery(
    { unitId, limit: 1 },
    Boolean(unitNeedsDeal && unitId),
  );
  const deal = dealQuery.data?.[0] ?? null;

  // ─── Mutations ──────────────────────────────────────────────────────
  const updateMutation = useUpdateUnitMutation(unitId);
  const deleteMutation = useDeleteUnitMutation(propertyId);
  const bookMutation = useBookUnitMutation(propertyId);
  const reserveMutation = useReserveUnitMutation(propertyId);
  const releaseMutation = useReleaseUnitMutation(propertyId);

  // ─── Local state ────────────────────────────────────────────────────
  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState<UnitFormValues>({
    unitNumber: "",
    unitType: "apartment",
    rooms: "",
    totalArea: "",
    livingArea: "",
    kitchenArea: "",
    balconyArea: "",
    pricePerSqm: "",
    finishing: "",
    description: "",
  });
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  // Book/reserve action
  const [actionType, setActionType] = useState<"book" | "reserve" | null>(null);
  const [clientSearch, setClientSearch] = useState("");
  const [selectedClientId, setSelectedClientId] = useState("");
  const [comment, setComment] = useState("");
  const [createClientOpen, setCreateClientOpen] = useState(false);

  const { data: clientResults = [], isLoading: clientsSearching } =
    useClientSearchQuery(clientSearch);
  const clientSmartOptions = clientResults.map((c) => ({
    value: c.id,
    label: c.fullName,
    secondary: c.phone,
  }));

  // ─── Handlers ───────────────────────────────────────────────────────

  function handleOpenEdit() {
    if (!unit) return;
    setEditForm(unitToFormValues(unit));
    setEditOpen(true);
  }

  function handleSaveEdit() {
    const totalArea = editForm.totalArea ? Number(editForm.totalArea) : undefined;
    const pricePerSqm = editForm.pricePerSqm ? Number(editForm.pricePerSqm) : undefined;

    const input: UpdateUnitInput = {
      rooms: editForm.rooms ? Number(editForm.rooms) : undefined,
      totalArea,
      livingArea: editForm.livingArea ? Number(editForm.livingArea) : undefined,
      kitchenArea: editForm.kitchenArea ? Number(editForm.kitchenArea) : undefined,
      balconyArea: editForm.balconyArea ? Number(editForm.balconyArea) : undefined,
      pricePerSqm,
      finishing: editForm.finishing || undefined,
      description: editForm.description || undefined,
    };
    updateMutation.mutate(input, {
      onSuccess: () => {
        setEditOpen(false);
        notifier.success("Квартира обновлена");
      },
    });
  }

  function handleDelete() {
    deleteMutation.mutate(unitId, {
      onSuccess: () => {
        notifier.success("Квартира удалена");
        router.push(routes.buildingUnits(propertyId));
      },
    });
  }

  async function handleBookOrReserve() {
    if (!actionType || !unit) return;
    try {
      if (actionType === "book") {
        await bookMutation.mutateAsync({
          unitId: unit.id,
          clientId: selectedClientId || undefined,
          comment: comment || undefined,
        });
      } else {
        await reserveMutation.mutateAsync({
          unitId: unit.id,
          clientId: selectedClientId || undefined,
          comment: comment || undefined,
        });
      }
      setActionType(null);
      setSelectedClientId("");
      setComment("");
      notifier.success(actionType === "book" ? "Забронировано" : "Зарезервировано");
    } catch (err) {
      notifier.error(normalizeErrorMessage(err));
    }
  }

  async function handleRelease() {
    if (!unit) return;
    try {
      await releaseMutation.mutateAsync(unit.id);
      notifier.success("Статус сброшен");
    } catch (err) {
      notifier.error(normalizeErrorMessage(err));
    }
  }

  // ─── Breadcrumbs ────────────────────────────────────────────────────

  const breadcrumbs: readonly PageHeaderCrumb[] = [
    { id: "buildings", label: "Объекты", href: routes.buildings },
    {
      id: "detail",
      label: property?.name ?? "Объект",
      href: routes.buildingDetail(propertyId),
    },
    {
      id: "units",
      label: "Квартиры",
      href: routes.buildingUnits(propertyId),
    },
    { id: "unit", label: unit?.unitNumber ?? "..." },
  ];

  // ─── Loading state ──────────────────────────────────────────────────

  if (unitQuery.isLoading) {
    return (
      <div className="space-y-6 p-6">
        <ShimmerBox className="h-8 w-64 rounded" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <ShimmerBox className="h-24 rounded-xl" key={i} />
          ))}
        </div>
        <ShimmerBox className="h-64 rounded-xl" />
      </div>
    );
  }

  if (unitQuery.isError || !unit) {
    return (
      <AppStatePanel
        tone="error"
        title="Квартира не найдена"
        description="Не удалось загрузить данные квартиры"
        actionLabel="Назад к списку"
        onAction={() => router.push(routes.buildingUnits(propertyId))}
      />
    );
  }

  // ─── Derived data ───────────────────────────────────────────────────

  const isActionPending =
    bookMutation.isPending || reserveMutation.isPending || releaseMutation.isPending;

  return (
    <>
      <AppPageHeader
        title={`Квартира ${unit.unitNumber}`}
        breadcrumbs={[...breadcrumbs]}
        actions={
          <div className="flex gap-2">
            <AppButton
              label="Редактировать"
              variant="outline"
              onClick={handleOpenEdit}
            />
            {unit.status === "available" ? (
              <AppButton
                label="Удалить"
                variant="destructive"
                onClick={() => setDeleteConfirm(true)}
              />
            ) : null}
          </div>
        }
      />

      <div className="space-y-6 p-6">
        {/* ─── Status badge ────────────────────────────────────────── */}
        <div className="flex items-center gap-3">
          <AppStatusBadge
            label={UNIT_STATUS_LABEL[unit.status]}
            tone={UNIT_STATUS_TONE[unit.status]}
          />
          <span className="text-sm text-muted-foreground">
            {UNIT_TYPE_LABELS[unit.unitType] ?? unit.unitType} · Этаж {unit.floorNumber}
          </span>
        </div>

        {/* ─── Booking/Reserve info ──────────────────────────────── */}
        {(unit.status === "booked" || unit.status === "reserved") && (unit.clientId || unit.comment || unit.bookedUntil) ? (
          <div className="rounded-xl border border-warning/40 bg-warning/5 p-4">
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              {unit.status === "booked" ? "Информация о бронировании" : "Информация о резерве"}
            </h3>
            <div className="space-y-2 text-sm">
              {bookingClient ? (
                <>
                  <InfoRow label="Клиент" value={bookingClient.fullName} />
                  <InfoRow label="Телефон" value={bookingClient.phone} />
                </>
              ) : unit.clientId ? (
                <InfoRow label="Клиент" value="Загрузка..." />
              ) : null}
              {unit.bookedUntil ? (
                <InfoRow label="Действует до" value={new Date(unit.bookedUntil).toLocaleDateString("ru-RU")} />
              ) : null}
              {unit.comment ? (
                <InfoRow label="Комментарий" value={unit.comment} />
              ) : null}
            </div>
          </div>
        ) : null}

        {/* ─── Key stats ───────────────────────────────────────────── */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <AppStatCard title="Общая площадь" value={formatArea(unit.totalArea)} />
          <AppStatCard title="Цена" value={formatMoney(unit.currentPrice)} />
          <AppStatCard
            title="Цена за м²"
            value={
              unit.currentPrice != null && unit.totalArea
                ? formatMoney(Math.round(unit.currentPrice / unit.totalArea))
                : "—"
            }
          />
          <AppStatCard title="Комнат" value={unit.rooms != null ? String(unit.rooms) : "—"} />
        </div>

        {/* ─── Details grid ────────────────────────────────────────── */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Left: Info */}
          <div className="space-y-4">
            <div className="rounded-xl border border-border bg-card p-5">
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Характеристики
              </h3>
              <div className="space-y-3">
                <InfoRow label="Номер" value={unit.unitNumber} />
                <InfoRow label="Тип" value={UNIT_TYPE_LABELS[unit.unitType] ?? unit.unitType} />
                <InfoRow label="Этаж" value={String(unit.floorNumber)} />
                <InfoRow label="Комнат" value={unit.rooms != null ? String(unit.rooms) : "—"} />
                <InfoRow label="Общая площадь" value={formatArea(unit.totalArea)} />
                <InfoRow label="Жилая площадь" value={formatArea(unit.livingArea)} />
                <InfoRow label="Кухня" value={formatArea(unit.kitchenArea)} />
                <InfoRow label="Балкон" value={formatArea(unit.balconyArea)} />
                <InfoRow label="Отделка" value={unit.finishing ?? "—"} />
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-5">
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Цены
              </h3>
              <div className="space-y-3">
                <InfoRow label="Базовая цена" value={formatMoney(unit.basePrice)} />
                <InfoRow label="Текущая цена" value={formatMoney(unit.currentPrice)} />
                <InfoRow
                  label="Цена за м²"
                  value={
                    unit.currentPrice != null && unit.totalArea
                      ? formatMoney(Math.round(unit.currentPrice / unit.totalArea))
                      : "—"
                  }
                />
              </div>
            </div>

            {unit.description ? (
              <div className="rounded-xl border border-border bg-card p-5">
                <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  Описание
                </h3>
                <p className="text-sm text-foreground">{unit.description}</p>
              </div>
            ) : null}
          </div>

          {/* Right: Photos + Deal + Actions */}
          <div className="space-y-4">
            {/* Photos */}
            <div className="rounded-xl border border-border bg-card p-5">
              <UnitPhotoManager
                unitId={unit.id}
                propertyId={propertyId}
                photoUrls={unit.photoUrls}
              />
            </div>

            {/* Deal info */}
            {unitNeedsDeal ? (
              <div className="rounded-xl border border-border bg-card p-5">
                <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  Сделка
                </h3>
                {dealQuery.isLoading ? (
                  <div className="space-y-2">
                    <ShimmerBox className="h-4 w-3/4 rounded" />
                    <ShimmerBox className="h-4 w-1/2 rounded" />
                  </div>
                ) : deal ? (
                  <div className="space-y-3">
                    <InfoRow label="№ сделки" value={deal.dealNumber} />
                    <InfoRow label="Клиент" value={deal.clientName} />
                    <InfoRow label="Телефон" value={deal.clientPhone} />
                    <InfoRow label="Менеджер" value={deal.managerName} />
                    <InfoRow
                      label="Сумма"
                      value={formatMoney(deal.finalAmount).replace("$", "") + " " + deal.currency}
                    />
                    <InfoRow label="Тип оплаты" value={deal.paymentType} />
                    {deal.contractNumber ? (
                      <InfoRow label="Договор" value={deal.contractNumber} />
                    ) : null}
                    <div className="pt-2">
                      <AppButton
                        label="Открыть сделку"
                        variant="primary"
                        fullWidth
                        onClick={() => router.push(routes.dealDetail(deal.id))}
                      />
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Сделка не найдена</p>
                )}
              </div>
            ) : null}

            {/* Actions */}
            <div className="rounded-xl border border-border bg-card p-5">
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Действия
              </h3>
              <div className="space-y-2">
                {unit.status === "available" ? (
                  <>
                    <AppButton
                      label="Забронировать"
                      variant="primary"
                      fullWidth
                      disabled={isActionPending}
                      onClick={() => setActionType("book")}
                    />
                    <AppButton
                      label="Резервировать"
                      variant="tonal"
                      fullWidth
                      disabled={isActionPending}
                      onClick={() => setActionType("reserve")}
                    />
                  </>
                ) : null}

                {unit.status === "booked" ? (
                  <AppButton
                    label="Отменить бронь"
                    variant="destructive"
                    fullWidth
                    isLoading={releaseMutation.isPending}
                    disabled={isActionPending}
                    onClick={() => void handleRelease()}
                  />
                ) : null}

                {unit.status === "reserved" ? (
                  <AppButton
                    label="Отменить резерв"
                    variant="destructive"
                    fullWidth
                    isLoading={releaseMutation.isPending}
                    disabled={isActionPending}
                    onClick={() => void handleRelease()}
                  />
                ) : null}

                <AppButton
                  label="Назад к шахматке"
                  variant="outline"
                  fullWidth
                  onClick={() => router.push(routes.buildingChessGrid(propertyId))}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Edit drawer (shared) ────────────────────────────────── */}
      <UnitFormDrawer
        open={editOpen}
        mode="edit"
        title="Редактировать квартиру"
        subtitle={`Квартира ${unit.unitNumber}`}
        values={editForm}
        onChange={setEditForm}
        onSave={handleSaveEdit}
        onClose={() => setEditOpen(false)}
        isSaving={updateMutation.isPending}
        showUnitNumber={false}
        unitId={unit.id}
        propertyId={propertyId}
        photoUrls={unit.photoUrls}
      />

      {/* ─── Book/Reserve drawer ──────────────────────────────────── */}
      <AppDrawerForm
        open={actionType !== null}
        title={actionType === "book" ? "Забронировать квартиру" : "Резервировать квартиру"}
        subtitle={`Квартира ${unit.unitNumber}`}
        saveLabel={actionType === "book" ? "Забронировать" : "Резервировать"}
        cancelLabel="Отмена"
        isSaving={bookMutation.isPending || reserveMutation.isPending}
        onClose={() => {
          setActionType(null);
          setSelectedClientId("");
          setComment("");
        }}
        onSave={() => void handleBookOrReserve()}
      >
        <div className="space-y-4">
          <AppSmartTextInput
            mode="select"
            label="Клиент (необязательно)"
            placeholder="Имя или телефон..."
            options={clientSmartOptions}
            value={selectedClientId}
            onChangeValue={(v) => setSelectedClientId(typeof v === "string" ? v : "")}
            onSearch={(q) => setClientSearch(q)}
            loading={clientsSearching}
            onCreateNew={() => setCreateClientOpen(true)}
            createNewLabel="Создать клиент"
          />
          <AppInput
            label="Комментарий"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Доп. информация"
          />
        </div>
      </AppDrawerForm>

      {/* ─── Delete confirm ───────────────────────────────────────── */}
      <ConfirmDialog
        open={deleteConfirm}
        title="Удалить квартиру?"
        message={`Вы уверены, что хотите удалить квартиру ${unit.unitNumber}?`}
        confirmText="Удалить"
        cancelText="Отмена"
        destructive
        onConfirm={handleDelete}
        onClose={() => setDeleteConfirm(false)}
      />

      {/* ─── Create client drawer ─────────────────────────────────── */}
      <CreateClientDrawer
        open={createClientOpen}
        onClose={() => setCreateClientOpen(false)}
        onSuccess={(client) => {
          setSelectedClientId(client.id);
          setClientSearch("");
        }}
      />
    </>
  );
}

// ─── Helper components ───────────────────────────────────────────────────────

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-foreground">{value}</span>
    </div>
  );
}
