"use client";

import { useCallback, useEffect, useState } from "react";
import { Dialog, IconButton } from "@mui/material";

interface PhotoLightboxProps {
  photos: readonly string[];
  initialIndex?: number | undefined;
  open: boolean;
  onClose: () => void;
}

export function PhotoLightbox({ photos, initialIndex = 0, open, onClose }: PhotoLightboxProps) {
  const [current, setCurrent] = useState(initialIndex);
  const apiBase = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

  useEffect(() => {
    if (open) setCurrent(initialIndex);
  }, [open, initialIndex]);

  const goPrev = useCallback(() => {
    setCurrent((i) => (i > 0 ? i - 1 : photos.length - 1));
  }, [photos.length]);

  const goNext = useCallback(() => {
    setCurrent((i) => (i < photos.length - 1 ? i + 1 : 0));
  }, [photos.length]);

  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") goPrev();
      else if (e.key === "ArrowRight") goNext();
      else if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, goPrev, goNext, onClose]);

  if (photos.length === 0) return null;

  const url = photos[current] ?? "";
  const fullUrl = url.startsWith("http") ? url : `${apiBase}${url}`;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={false}
      slotProps={{
        paper: {
          sx: {
            bgcolor: "rgba(0,0,0,0.95)",
            maxWidth: "95vw",
            maxHeight: "95vh",
            overflow: "hidden",
            borderRadius: 3,
          },
        },
      }}
    >
      <div className="relative flex items-center justify-center" style={{ minWidth: 320, minHeight: 320 }}>
        {/* Close button */}
        <IconButton
          onClick={onClose}
          sx={{
            position: "absolute",
            top: 8,
            right: 8,
            color: "white",
            bgcolor: "rgba(255,255,255,0.15)",
            "&:hover": { bgcolor: "rgba(255,255,255,0.3)" },
            zIndex: 10,
          }}
          size="small"
        >
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M6 18L18 6M6 6l12 12" />
          </svg>
        </IconButton>

        {/* Counter */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-black/60 px-3 py-1 text-xs text-white">
          {current + 1} / {photos.length}
        </div>

        {/* Prev button */}
        {photos.length > 1 ? (
          <IconButton
            onClick={goPrev}
            sx={{
              position: "absolute",
              left: 8,
              top: "50%",
              transform: "translateY(-50%)",
              color: "white",
              bgcolor: "rgba(255,255,255,0.15)",
              "&:hover": { bgcolor: "rgba(255,255,255,0.3)" },
              zIndex: 10,
            }}
            size="medium"
          >
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M15 19l-7-7 7-7" />
            </svg>
          </IconButton>
        ) : null}

        {/* Next button */}
        {photos.length > 1 ? (
          <IconButton
            onClick={goNext}
            sx={{
              position: "absolute",
              right: 8,
              top: "50%",
              transform: "translateY(-50%)",
              color: "white",
              bgcolor: "rgba(255,255,255,0.15)",
              "&:hover": { bgcolor: "rgba(255,255,255,0.3)" },
              zIndex: 10,
            }}
            size="medium"
          >
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M9 5l7 7-7 7" />
            </svg>
          </IconButton>
        ) : null}

        {/* Image */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          alt={`Photo ${current + 1}`}
          src={fullUrl}
          className="max-h-[85vh] max-w-[90vw] object-contain"
        />
      </div>
    </Dialog>
  );
}
