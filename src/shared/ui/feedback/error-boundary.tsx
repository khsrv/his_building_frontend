"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";
import { AppCard } from "@/shared/ui/primitives/card";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallbackTitle?: string;
  fallbackMessage?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  override state: ErrorBoundaryState = {
    hasError: false,
  };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  override render() {
    if (this.state.hasError) {
      return (
        <AppCard title={this.props.fallbackTitle ?? "Error"} variant="status-error">
          <p className="text-sm text-muted-foreground">
            {this.props.fallbackMessage ?? "Unexpected UI crash. Check logs and error mapping."}
          </p>
        </AppCard>
      );
    }

    return this.props.children;
  }
}
