"use client";

import { useCallback, useState } from "react";
import { cn } from "@/shared/lib/ui/cn";
import { AppButton } from "@/shared/ui/primitives/button";
import { AppInput } from "@/shared/ui/primitives/input";
import { useI18n } from "@/shared/providers/locale-provider";
import type { TranslationKey } from "@/shared/i18n/types";

export interface AppComment {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  text: string;
  createdAt: string;
  updatedAt?: string;
  replyToId?: string | null;
  pinned?: boolean;
}

interface AppCommentThreadProps {
  comments: readonly AppComment[];
  currentUserId: string;
  loading?: boolean;
  submitting?: boolean;
  onSubmit: (text: string, replyToId: string | null) => Promise<void> | void;
  onDelete?: (commentId: string) => void;
  onPin?: (commentId: string, pinned: boolean) => void;
  title?: string;
  placeholder?: string;
  className?: string;
  maxHeight?: number;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "< 1m";
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  const days = Math.floor(hrs / 24);
  return `${days}d`;
}

interface CommentItemProps {
  comment: AppComment;
  currentUserId: string;
  isReply?: boolean;
  t: (key: TranslationKey) => string;
  onReply: (id: string, name: string) => void;
  onDelete?: (id: string) => void;
  onPin?: (id: string, pinned: boolean) => void;
}

function CommentItem({
  comment,
  currentUserId,
  isReply = false,
  t,
  onReply,
  onDelete,
  onPin,
}: CommentItemProps) {
  const isOwn = comment.authorId === currentUserId;

  return (
    <div className={cn("flex gap-2.5", isReply && "ml-10")}>
      {/* Avatar */}
      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground">
        {getInitials(comment.authorName)}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-sm font-semibold text-foreground">{comment.authorName}</span>
          {comment.pinned ? (
            <span className="text-[10px] font-bold text-primary">{t("comments.pinned")}</span>
          ) : null}
          <span className="text-xs text-muted-foreground">{timeAgo(comment.createdAt)}</span>
          {comment.updatedAt ? (
            <span className="text-xs text-muted-foreground">{t("comments.edited")}</span>
          ) : null}
        </div>

        <p className="mt-0.5 whitespace-pre-wrap break-words text-sm text-foreground">
          {comment.text}
        </p>

        <div className="mt-1 flex items-center gap-1">
          {!isReply ? (
            <button
              className="text-xs text-muted-foreground transition-colors hover:text-foreground"
              onClick={() => onReply(comment.id, comment.authorName)}
              type="button"
            >
              {t("comments.reply")}
            </button>
          ) : null}
          {onPin ? (
            <button
              className={cn(
                "text-xs transition-colors hover:text-foreground",
                comment.pinned ? "text-primary" : "text-muted-foreground",
              )}
              onClick={() => onPin(comment.id, !comment.pinned)}
              type="button"
            >
              {comment.pinned ? t("comments.unpin") : t("comments.pin")}
            </button>
          ) : null}
          {isOwn && onDelete ? (
            <button
              className="text-xs text-muted-foreground transition-colors hover:text-danger"
              onClick={() => onDelete(comment.id)}
              type="button"
            >
              {t("common.delete")}
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export function AppCommentThread({
  comments,
  currentUserId,
  loading = false,
  submitting = false,
  onSubmit,
  onDelete,
  onPin,
  title,
  placeholder,
  className,
  maxHeight = 480,
}: AppCommentThreadProps) {
  const { t } = useI18n();
  const [text, setText] = useState("");
  const [replyTo, setReplyTo] = useState<{ id: string; name: string } | null>(null);

  const topLevel = comments.filter((c) => !c.replyToId);
  const pinnedIds = new Set(comments.filter((c) => c.pinned).map((c) => c.id));

  const handleReply = useCallback((id: string, name: string) => {
    setReplyTo({ id, name });
  }, []);

  const handleSubmit = async () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    await onSubmit(trimmed, replyTo?.id ?? null);
    setText("");
    setReplyTo(null);
  };

  const sortedTop = [...topLevel].sort((a, b) => {
    if (pinnedIds.has(a.id) && !pinnedIds.has(b.id)) return -1;
    if (!pinnedIds.has(a.id) && pinnedIds.has(b.id)) return 1;
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  });

  return (
    <div className={cn("rounded-xl border border-border bg-card p-4 shadow-sm", className)}>
      {title ? (
        <p className="mb-3 text-sm font-semibold text-foreground">{title}</p>
      ) : null}

      {/* Comments list */}
      <div className="overflow-y-auto" style={{ maxHeight }}>
        {loading ? (
          <p className="py-6 text-center text-sm text-muted-foreground">{t("common.loading")}</p>
        ) : sortedTop.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">{t("comments.empty")}</p>
        ) : (
          <div className="space-y-3">
            {sortedTop.map((comment) => {
              const replies = comments.filter((c) => c.replyToId === comment.id);
              return (
                <div key={comment.id}>
                  <CommentItem
                    comment={comment}
                    currentUserId={currentUserId}
                    t={t}
                    {...(onDelete ? { onDelete } : {})}
                    {...(onPin ? { onPin } : {})}
                    onReply={handleReply}
                  />
                  {replies.length > 0 ? (
                    <div className="mt-2 space-y-2">
                      {replies.map((reply) => (
                        <CommentItem
                          comment={reply}
                          currentUserId={currentUserId}
                          isReply
                          key={reply.id}
                          t={t}
                          {...(onDelete ? { onDelete } : {})}
                          {...(onPin ? { onPin } : {})}
                          onReply={handleReply}
                        />
                      ))}
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Compose box */}
      <div className="mt-3 border-t border-border pt-3">
        {replyTo ? (
          <div className="mb-2 flex items-center gap-1">
            <span className="text-xs text-muted-foreground">
              {t("comments.replyTo").replace("{name}", replyTo.name)}
            </span>
            <button
              className="text-xs text-muted-foreground hover:text-foreground"
              onClick={() => setReplyTo(null)}
              type="button"
            >
              ✕
            </button>
          </div>
        ) : null}
        <div className="flex items-end gap-2">
          <div className="flex-1">
            <AppInput
              onChangeValue={setText}
              placeholder={placeholder ?? t("comments.placeholder")}
              value={text}
            />
          </div>
          <AppButton
            disabled={!text.trim() || submitting}
            label={submitting ? "..." : t("comments.send")}
            onClick={() => void handleSubmit()}
            size="sm"
            variant="primary"
          />
        </div>
      </div>
    </div>
  );
}
