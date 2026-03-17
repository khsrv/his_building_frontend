"use client";

import { useCallback, useMemo, useState } from "react";
import {
  Box,
  Chip,
  Collapse,
  IconButton,
  Typography,
} from "@mui/material";

export interface AppTreeNode {
  id: string;
  label: string;
  badge?: string | number;
  badgeColor?: "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning";
  icon?: React.ReactNode;
  data?: Record<string, unknown>;
  children?: readonly AppTreeNode[];
  disabled?: boolean;
}

interface AppTreeListProps {
  nodes: readonly AppTreeNode[];
  onNodeClick?: (node: AppTreeNode) => void;
  selectedId?: string | null;
  defaultExpanded?: readonly string[]; // ids to expand by default
  expandAll?: boolean;
  className?: string;
  indent?: number; // px per level
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      fill="none"
      height="14"
      stroke="currentColor"
      strokeWidth="2.5"
      style={{ transform: open ? "rotate(90deg)" : "rotate(0deg)", transition: "transform 150ms ease" }}
      viewBox="0 0 24 24"
      width="14"
    >
      <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

interface TreeNodeProps {
  node: AppTreeNode;
  level: number;
  indent: number;
  selectedId: string | null | undefined;
  expandedIds: Set<string>;
  onToggle: (id: string) => void;
  onNodeClick: ((node: AppTreeNode) => void) | undefined;
}

function TreeNodeRow({
  node,
  level,
  indent,
  selectedId,
  expandedIds,
  onToggle,
  onNodeClick,
}: TreeNodeProps) {
  const hasChildren = Boolean(node.children && node.children.length > 0);
  const isExpanded = expandedIds.has(node.id);
  const isSelected = selectedId === node.id;

  return (
    <>
      <Box
        onClick={() => {
          if (!node.disabled) {
            if (hasChildren) onToggle(node.id);
            onNodeClick?.(node);
          }
        }}
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 0.5,
          pl: `${level * indent + (hasChildren ? 0 : 20)}px`,
          pr: 1,
          py: 0.625,
          borderRadius: 1.5,
          cursor: node.disabled ? "default" : "pointer",
          bgcolor: isSelected ? "action.selected" : "transparent",
          opacity: node.disabled ? 0.45 : 1,
          "&:hover": node.disabled
            ? undefined
            : { bgcolor: isSelected ? "action.selected" : "action.hover" },
          transition: "background-color 120ms ease",
          userSelect: "none",
        }}
      >
        {hasChildren ? (
          <IconButton
            disableRipple
            onClick={(e) => { e.stopPropagation(); onToggle(node.id); }}
            size="small"
            sx={{ p: 0.25, color: "text.secondary" }}
          >
            <ChevronIcon open={isExpanded} />
          </IconButton>
        ) : null}

        {node.icon ? (
          <Box sx={{ color: "text.secondary", display: "flex", alignItems: "center", flexShrink: 0 }}>
            {node.icon}
          </Box>
        ) : null}

        <Typography
          noWrap
          sx={{
            flex: 1,
            fontSize: 13,
            fontWeight: level === 0 ? 600 : 400,
            color: isSelected ? "primary.main" : "text.primary",
          }}
        >
          {node.label}
        </Typography>

        {node.badge !== undefined ? (
          <Chip
            color={node.badgeColor ?? "default"}
            label={node.badge}
            size="small"
            sx={{ fontSize: 10, height: 18, minWidth: 24, flexShrink: 0 }}
          />
        ) : null}
      </Box>

      {hasChildren ? (
        <Collapse in={isExpanded} timeout={160} unmountOnExit>
          {node.children!.map((child) => (
            <TreeNodeRow
              expandedIds={expandedIds}
              indent={indent}
              key={child.id}
              level={level + 1}
              node={child}
              onNodeClick={onNodeClick}
              onToggle={onToggle}
              selectedId={selectedId}
            />
          ))}
        </Collapse>
      ) : null}
    </>
  );
}

function collectAllIds(nodes: readonly AppTreeNode[]): string[] {
  return nodes.flatMap((n) => [n.id, ...collectAllIds(n.children ?? [])]);
}

export function AppTreeList({
  nodes,
  onNodeClick,
  selectedId,
  defaultExpanded = [],
  expandAll = false,
  className,
  indent = 16,
}: AppTreeListProps) {
  const allIds = useMemo(() => collectAllIds(nodes), [nodes]);

  const [expandedIds, setExpandedIds] = useState<Set<string>>(() => {
    if (expandAll) return new Set(allIds);
    return new Set(defaultExpanded);
  });

  const handleToggle = useCallback((id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  if (nodes.length === 0) {
    return (
      <Typography color="text.disabled" sx={{ py: 3, textAlign: "center", fontSize: 13 }}>
        Нет данных
      </Typography>
    );
  }

  return (
    <Box className={className}>
      {nodes.map((node) => (
        <TreeNodeRow
          expandedIds={expandedIds}
          indent={indent}
          key={node.id}
          level={0}
          node={node}
          onNodeClick={onNodeClick}
          onToggle={handleToggle}
          selectedId={selectedId}
        />
      ))}
    </Box>
  );
}
