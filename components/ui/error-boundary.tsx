"use client";

import * as React from "react";
import { sanitizeErrorMessage } from "@/lib/utils/error-sanitizer";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?:
    | React.ReactNode
    | ((props: { error: Error; reset: () => void }) => React.ReactNode);
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  title?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
    // Avoid logging secrets or raw error stacks with sensitive data
    console.error("Caught component error boundary exception:", error.name);
  }

  reset = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): React.ReactNode {
    if (this.state.hasError && this.state.error) {
      if (typeof this.props.fallback === "function") {
        return this.props.fallback({
          error: this.state.error,
          reset: this.reset,
        });
      }

      if (this.props.fallback) {
        return this.props.fallback;
      }

      const safeMessage = sanitizeErrorMessage(this.state.error);

      return (
        <div
          role="alert"
          aria-live="assertive"
          className="rounded-xl border border-destructive/20 bg-destructive/10 p-6 text-center space-y-4 my-4 animate-in fade-in-50"
        >
          <div className="mx-auto flex size-10 items-center justify-center rounded-full bg-destructive/20 text-destructive">
            <AlertTriangle className="size-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-destructive">
              {this.props.title || "Something went wrong in this section"}
            </h3>
            <p className="mt-1 text-xs text-muted-foreground max-w-md mx-auto">
              {safeMessage}
            </p>
          </div>
          <div>
            <Button
              size="sm"
              variant="outline"
              onClick={this.reset}
              className="gap-1.5"
            >
              <RefreshCw className="size-3.5" />
              Try Again
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

