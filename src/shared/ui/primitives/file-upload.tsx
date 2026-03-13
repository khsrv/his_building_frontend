"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/shared/lib/ui/cn";
import { AppButton } from "@/shared/ui/primitives/button";

export interface AppUploadFile {
  id: string;
  file: File;
}

interface AppFileUploadProps {
  value?: readonly AppUploadFile[];
  onChange?: (files: AppUploadFile[]) => void;
  accept?: readonly string[];
  multiple?: boolean;
  maxFileSizeMb?: number;
  maxFiles?: number;
  label?: string;
  hint?: string;
}

function bytesToMb(value: number) {
  return value / (1024 * 1024);
}

export function AppFileUpload({
  value,
  onChange,
  accept = ["image/jpeg", "image/png", "image/webp"],
  multiple = true,
  maxFileSizeMb = 5,
  maxFiles = 10,
  label = "Drop files here",
  hint = "JPG, PNG, WEBP",
}: AppFileUploadProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [internalFiles, setInternalFiles] = useState<AppUploadFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const files = useMemo(() => {
    return value ? [...value] : internalFiles;
  }, [internalFiles, value]);

  const updateFiles = (nextFiles: AppUploadFile[]) => {
    if (value === undefined) {
      setInternalFiles(nextFiles);
    }
    onChange?.(nextFiles);
  };

  const addFiles = (selectedFiles: readonly File[]) => {
    const current = [...files];
    const next = [...current];

    for (const file of selectedFiles) {
      if (accept.length > 0 && !accept.includes(file.type)) {
        setError(`Unsupported file type: ${file.name}`);
        continue;
      }

      if (bytesToMb(file.size) > maxFileSizeMb) {
        setError(`File is too large: ${file.name}`);
        continue;
      }

      if (next.length >= maxFiles) {
        setError(`Maximum ${maxFiles} files allowed`);
        break;
      }

      next.push({
        id: `${file.name}-${file.size}-${file.lastModified}-${Math.random().toString(36).slice(2, 8)}`,
        file,
      });
      setError(null);
    }

    updateFiles(next);
  };

  const previewUrls = useMemo(() => {
    return files.map((item) => {
      return {
        id: item.id,
        name: item.file.name,
        size: item.file.size,
        type: item.file.type,
        previewUrl: item.file.type.startsWith("image/") ? URL.createObjectURL(item.file) : null,
      };
    });
  }, [files]);

  useEffect(() => {
    return () => {
      previewUrls.forEach((item) => {
        if (item.previewUrl) {
          URL.revokeObjectURL(item.previewUrl);
        }
      });
    };
  }, [previewUrls]);

  return (
    <div className="space-y-2">
      <button
        className={cn(
          "flex min-h-28 w-full flex-col items-center justify-center rounded-xl border border-dashed px-4 py-4 text-center transition-colors",
          isDragging ? "border-primary bg-primary/10" : "border-border bg-card hover:bg-muted/40",
        )}
        onClick={() => inputRef.current?.click()}
        onDragEnter={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={(event) => {
          event.preventDefault();
          setIsDragging(false);
        }}
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDrop={(event) => {
          event.preventDefault();
          setIsDragging(false);
          const droppedFiles = Array.from(event.dataTransfer.files);
          addFiles(droppedFiles);
        }}
        type="button"
      >
        <span className="text-sm font-medium text-foreground">{label}</span>
        <span className="pt-1 text-xs text-muted-foreground">
          {hint} • max {maxFileSizeMb} MB
        </span>
      </button>

      <input
        accept={accept.join(",")}
        className="hidden"
        multiple={multiple}
        onChange={(event) => {
          const selected = Array.from(event.target.files ?? []);
          addFiles(selected);
          event.currentTarget.value = "";
        }}
        ref={inputRef}
        type="file"
      />

      {error ? <p className="text-xs text-danger">{error}</p> : null}

      {files.length > 0 ? (
        <div className="grid gap-2 sm:grid-cols-2">
          {previewUrls.map((item) => (
            <div className="flex items-center gap-2 rounded-lg border border-border bg-card p-2" key={item.id}>
              {item.previewUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  alt={item.name}
                  className="h-12 w-12 rounded-md object-cover"
                  src={item.previewUrl}
                />
              ) : (
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-md bg-muted text-xs text-muted-foreground">
                  FILE
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm text-foreground">{item.name}</p>
                <p className="text-xs text-muted-foreground">{bytesToMb(item.size).toFixed(2)} MB</p>
              </div>
              <AppButton
                label="Remove"
                onClick={() => updateFiles(files.filter((file) => file.id !== item.id))}
                size="sm"
                variant="text"
              />
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
