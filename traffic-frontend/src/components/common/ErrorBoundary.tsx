import { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertOctagon, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  children: ReactNode;
}
interface State {
  hasError: boolean;
  message?: string;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("ErrorBoundary caught:", error, info);
  }

  handleReset = () => {
    this.setState({ hasError: false, message: undefined });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background p-6 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/15 text-destructive">
            <AlertOctagon className="h-8 w-8" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold">Something went wrong</h1>
            <p className="max-w-md text-sm text-muted-foreground">
              {this.state.message ??
                "An unexpected error occurred while rendering this view."}
            </p>
          </div>
          <Button onClick={this.handleReset} variant="gradient">
            <RotateCcw className="h-4 w-4" /> Reload application
          </Button>
        </div>
      );
    }
    return this.props.children;
  }
}
