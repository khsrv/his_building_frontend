"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { AppButton } from "@/shared/ui";
import { uploadUnitPhoto, deleteUnitPhoto } from "@/modules/properties/infrastructure/properties-repository";
import { propertyKeys } from "@/modules/properties/presentation/query-keys";
import { normalizeErrorMessage } from "@/shared/lib/errors/normalize-error-message";
import { useNotifier } from "@/shared/providers/notifier-provider";

interface UnitPhotoManagerProps {
  unitId: string;
  propertyId: string;
  photoUrls: readonly string[];
}

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_FILE_SIZE_MB = 5;
const MAX_PHOTOS = 10;

export function UnitPhotoManager({ unitId, propertyId, photoUrls }: UnitPhotoManagerProps) {
  const queryClient = useQueryClient();
  const notifier = useNotifier();
  const [uploading, setUploading] = useState(false);
  const [deletingUrl, setDeletingUrl] = useState<string | null>(null);

  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const remaining = MAX_PHOTOS - photoUrls.length;
    if (remaining <= 0) {
      notifier.error(`Максимум ${MAX_PHOTOS} фотографий`);
      return;
    }

    setUploading(true);
    try {
      const filesToUpload = Array.from(files).slice(0, remaining);

      for (const file of filesToUpload) {
        if (!ACCEPTED_TYPES.includes(file.type)) {
          notifier.error(`Неподдерживаемый формат: ${file.name}`);
          continue;
        }
        if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
          notifier.error(`Файл слишком большой: ${file.name} (макс. ${MAX_FILE_SIZE_MB} МБ)`);
          continue;
        }
        await uploadUnitPhoto(unitId, file);
      }

      void queryClient.invalidateQueries({ queryKey: propertyKeys.all });
      notifier.success("Фото загружено");
    } catch (err) {
      notifier.error(normalizeErrorMessage(err));
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (url: string) => {
    setDeletingUrl(url);
    try {
      await deleteUnitPhoto(unitId, url);
      void queryClient.invalidateQueries({ queryKey: propertyKeys.all });
      notifier.success("Фото удалено");
    } catch (err) {
      notifier.error(normalizeErrorMessage(err));
    } finally {
      setDeletingUrl(null);
    }
  };

  const apiBase = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium">Фотографии ({photoUrls.length}/{MAX_PHOTOS})</p>

      {photoUrls.length > 0 ? (
        <div className="grid grid-cols-3 gap-2">
          {photoUrls.map((url) => {
            const fullUrl = url.startsWith("http") ? url : `${apiBase}${url}`;
            return (
              <div className="group relative" key={url}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  alt="Unit photo"
                  className="h-24 w-full rounded-lg border border-border object-cover"
                  src={fullUrl}
                />
                <button
                  className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-danger text-white opacity-0 transition-opacity group-hover:opacity-100 disabled:opacity-50"
                  disabled={deletingUrl === url}
                  onClick={() => void handleDelete(url)}
                  title="Удалить фото"
                  type="button"
                >
                  <svg aria-hidden className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            );
          })}
        </div>
      ) : null}

      {photoUrls.length < MAX_PHOTOS ? (
        <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-border bg-card px-4 py-4 text-center transition-colors hover:bg-muted/40">
          <span className="text-sm font-medium text-foreground">
            {uploading ? "Загрузка..." : "Добавить фото"}
          </span>
          <span className="pt-1 text-xs text-muted-foreground">
            JPG, PNG, WEBP · макс. {MAX_FILE_SIZE_MB} МБ
          </span>
          <input
            accept={ACCEPTED_TYPES.join(",")}
            className="hidden"
            disabled={uploading}
            multiple
            onChange={(e) => {
              void handleUpload(e.target.files);
              e.currentTarget.value = "";
            }}
            type="file"
          />
        </label>
      ) : null}
    </div>
  );
}
