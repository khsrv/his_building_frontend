"use client";

import { useCallback, useMemo, useState, type ReactNode } from "react";
import { cn } from "@/shared/lib/ui/cn";
import { useI18n } from "@/shared/providers/locale-provider";

export interface AppTreeNode {
  id: string;
  label: string;
  badge?: string | number;
  badgeColor?: "default" | "primary" | "success" | "warning" | "danger" | "info";
  icon?: ReactNode;
  data?: Record<string, unknown>;
  children?: readonly AppTreeNode[];
  disabled?: boolean;
}

interface AppTreeListProps {
  nodes: readonly AppTreeNode[];
  onNodeClick?: (node: AppTreeNode) => void;
  selectedId?: string | null;
  defaultExpanded?: readonly string[];
  expandAll?: boolean;
  className?: string;
  indent?: number;
}

const badgeClasses: Record<string, string> = {
  default: "bg-muted text-muted-foreground",
  primary: "bg-primary/15 text-primary",
  success: "bg-success/15 text-success",
  warning: "bg-warning/15 text-warning",
  danger: "bg-danger/15 text-danger",
  info: "bg-info/15 text-info",
};

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      className={cn(
        "h-3.5 w-3.5 text-muted-foreground transition-transform duration-150",
        open && "rotate-90",
      )}
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      viewBox="0 0 24 24"
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
      <div
        className={cn(
          "flex select-none items-center gap-1 rounded-lg py-1.5 pr-2 transition-colors",
          node.disabled ? "cursor-default opacity-40" : "cursor-pointer",
          isSelected
            ? "bg-primary/10 text-primary"
            : !node.disabled && "hover:bg-muted",
        )}
        onClick={() => {
          if (node.disabled) return;
          if (hasChildren) onToggle(node.id);
          onNodeClick?.(node);
        }}
        style={{ paddingLeft: level * indent + (hasChildren ? 0 : 20) }}
      >
        {hasChildren ? (
          <button
            className="flex h-5 w-5 items-center justify-center"
            onClick={(e) => { e.stopPropagation(); onToggle(node.id); }}
            type="button"
          >
            <ChevronIcon open={isExpanded} />
          </button>
        ) : null}

        {node.icon ? (
          <span className="flex shrink-0 items-center text-muted-foreground">{node.icon}</span>
        ) : null}

        <span
          className={cn(
            "flex-1 truncate text-sm",
            level === 0 ? "font-semibold" : "font-normal",
            isSelected ? "text-primary" : "text-foreground",
          )}
        >
          {node.label}
        </span>

        {node.badge !== undefined ? (
          <span
            className={cn(
              "inline-flex h-[18px] min-w-[24px] shrink-0 items-center justify-center rounded-full px-1.5 text-[10px] font-medium",
              badgeClasses[node.badgeColor ?? "default"],
            )}
          >
            {node.badge}
          </span>
        ) : null}
      </div>

      {hasChildren && isExpanded ? (
        <div className="overflow-hidden">
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
        </div>
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
  const { t } = useI18n();
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
      <p className="py-4 text-center text-sm text-muted-foreground">
        {t("tree.empty")}
      </p>
    );
  }

  return (
    <div className={className}>
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
    </div>
  );
}
