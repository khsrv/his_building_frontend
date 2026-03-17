"use client";

import { useCallback, useState } from "react";
import {
  Avatar,
  Box,
  CircularProgress,
  Divider,
  IconButton,
  Paper,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { formatDistanceToNow, parseISO, isValid } from "date-fns";
import { ru } from "date-fns/locale";
import { AppButton } from "@/shared/ui/primitives/button";
import { useI18n } from "@/shared/providers/locale-provider";

export interface AppComment {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  text: string;
  createdAt: string; // ISO date string
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

function formatDate(iso: string): string {
  const date = parseISO(iso);
  if (!isValid(date)) return iso;
  try {
    return formatDistanceToNow(date, { addSuffix: true, locale: ru });
  } catch {
    return iso;
  }
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

interface CommentItemProps {
  comment: AppComment;
  currentUserId: string;
  isReply?: boolean;
  onReply: (id: string, name: string) => void;
  onDelete?: (id: string) => void;
  onPin?: (id: string, pinned: boolean) => void;
}

function CommentItem({
  comment,
  currentUserId,
  isReply = false,
  onReply,
  onDelete,
  onPin,
}: CommentItemProps) {
  const isOwn = comment.authorId === currentUserId;

  return (
    <Box sx={{ display: "flex", gap: 1, pl: isReply ? 5 : 0 }}>
      <Avatar
        src={comment.authorAvatar}
        sx={{ width: 32, height: 32, fontSize: 13, flexShrink: 0, mt: 0.25 }}
      >
        {getInitials(comment.authorName)}
      </Avatar>

      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Stack alignItems="center" direction="row" gap={0.75} flexWrap="wrap">
          <Typography sx={{ fontSize: 13, fontWeight: 600 }}>
            {comment.authorName}
          </Typography>
          {comment.pinned ? (
            <Typography
              color="primary"
              sx={{ fontSize: 10, fontWeight: 600, letterSpacing: 0.3 }}
            >
              ЗАКРЕПЛЕНО
            </Typography>
          ) : null}
          <Typography color="text.disabled" sx={{ fontSize: 11 }}>
            {formatDate(comment.createdAt)}
          </Typography>
          {comment.updatedAt ? (
            <Typography color="text.disabled" sx={{ fontSize: 11 }}>
              (изм.)
            </Typography>
          ) : null}
        </Stack>

        <Typography
          sx={{ fontSize: 13, mt: 0.25, whiteSpace: "pre-wrap", wordBreak: "break-word" }}
        >
          {comment.text}
        </Typography>

        <Stack direction="row" gap={0.5} sx={{ mt: 0.5 }}>
          {!isReply ? (
            <Tooltip title="Ответить">
              <IconButton
                onClick={() => onReply(comment.id, comment.authorName)}
                size="small"
                sx={{ p: 0.25 }}
              >
                <ReplyIcon />
              </IconButton>
            </Tooltip>
          ) : null}
          {onPin ? (
            <Tooltip title={comment.pinned ? "Открепить" : "Закрепить"}>
              <IconButton
                onClick={() => onPin(comment.id, !comment.pinned)}
                size="small"
                sx={{ p: 0.25, color: comment.pinned ? "primary.main" : undefined }}
              >
                <PinIcon />
              </IconButton>
            </Tooltip>
          ) : null}
          {isOwn && onDelete ? (
            <Tooltip title="Удалить">
              <IconButton
                onClick={() => onDelete(comment.id)}
                size="small"
                sx={{ p: 0.25, color: "error.main" }}
              >
                <TrashIcon />
              </IconButton>
            </Tooltip>
          ) : null}
        </Stack>
      </Box>
    </Box>
  );
}

// Minimal inline SVG icons
function ReplyIcon() {
  return (
    <svg fill="none" height="14" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" width="14">
      <path d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function PinIcon() {
  return (
    <svg fill="none" height="14" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" width="14">
      <path d="M12 2l3 6h6l-5 4 2 7-6-4-6 4 2-7L3 8h6z" strokeLinejoin="round" />
    </svg>
  );
}
function TrashIcon() {
  return (
    <svg fill="none" height="14" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" width="14">
      <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
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
    <Paper className={className} sx={{ p: 2 }} variant="outlined">
      {title ? (
        <Typography sx={{ mb: 1.5, fontWeight: 600 }} variant="subtitle2">
          {title}
        </Typography>
      ) : null}

      {/* Comments list */}
      <Box sx={{ maxHeight, overflowY: "auto", mb: 2 }}>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress size={24} />
          </Box>
        ) : sortedTop.length === 0 ? (
          <Typography
            color="text.disabled"
            sx={{ py: 3, textAlign: "center", fontSize: 13 }}
          >
            {t("comments.empty")}
          </Typography>
        ) : (
          <Stack divider={<Divider sx={{ my: 0.5 }} />} gap={1.25}>
            {sortedTop.map((comment) => {
              const replies = comments.filter((c) => c.replyToId === comment.id);
              return (
                <Box key={comment.id}>
                  <CommentItem
                    comment={comment}
                    currentUserId={currentUserId}
                    {...(onDelete ? { onDelete } : {})}
                    {...(onPin ? { onPin } : {})}
                    onReply={handleReply}
                  />
                  {replies.length > 0 ? (
                    <Stack gap={1} sx={{ mt: 1 }}>
                      {replies.map((reply) => (
                        <CommentItem
                          comment={reply}
                          currentUserId={currentUserId}
                          isReply
                          key={reply.id}
                          {...(onDelete ? { onDelete } : {})}
                          {...(onPin ? { onPin } : {})}
                          onReply={handleReply}
                        />
                      ))}
                    </Stack>
                  ) : null}
                </Box>
              );
            })}
          </Stack>
        )}
      </Box>

      {/* Compose box */}
      <Divider sx={{ mb: 1.5 }} />
      {replyTo ? (
        <Stack alignItems="center" direction="row" gap={0.5} sx={{ mb: 0.75 }}>
          <Typography color="text.secondary" sx={{ fontSize: 12 }}>
            Ответ для {replyTo.name}
          </Typography>
          <IconButton onClick={() => setReplyTo(null)} size="small" sx={{ p: 0.25 }}>
            <svg fill="none" height="12" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" width="12">
              <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
            </svg>
          </IconButton>
        </Stack>
      ) : null}
      <Stack direction="row" gap={1}>
        <Box sx={{ flex: 1 }}>
          <TextField
            fullWidth
            minRows={2}
            multiline
            onChange={(e) => setText(e.target.value)}
            placeholder={placeholder ?? t("comments.placeholder")}
            size="small"
            value={text}
          />
        </Box>
        <Box sx={{ display: "flex", alignItems: "flex-end" }}>
          <AppButton
            disabled={!text.trim() || submitting}
            label={submitting ? "..." : t("comments.send")}
            onClick={() => void handleSubmit()}
            variant="primary"
          />
        </Box>
      </Stack>
    </Paper>
  );
}
