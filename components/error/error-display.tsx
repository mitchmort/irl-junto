import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ErrorDisplayProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  onGoHome?: () => void;
  className?: string;
  variant?: "inline" | "card" | "fullpage";
}

export function ErrorDisplay({ 
  title = "Something went wrong",
  message, 
  onRetry, 
  onGoHome,
  className,
  variant = "inline"
}: ErrorDisplayProps) {
  const content = (
    <div className="flex flex-col items-center text-center space-y-4">
      <AlertTriangle className="h-12 w-12 text-destructive" />
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="text-sm text-muted-foreground max-w-sm">{message}</p>
      </div>
      
      <div className="flex gap-2">
        {onRetry && (
          <Button onClick={onRetry} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        )}
        {onGoHome && (
          <Button onClick={onGoHome} variant="default" size="sm">
            <Home className="h-4 w-4 mr-2" />
            Go Home
          </Button>
        )}
      </div>
    </div>
  );

  if (variant === "fullpage") {
    return (
      <div className={cn("flex items-center justify-center min-h-screen p-4", className)}>
        {content}
      </div>
    );
  }

  if (variant === "card") {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            {title}
          </CardTitle>
          <CardDescription>{message}</CardDescription>
        </CardHeader>
        {(onRetry || onGoHome) && (
          <CardContent>
            <div className="flex gap-2">
              {onRetry && (
                <Button onClick={onRetry} variant="outline" size="sm">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
              )}
              {onGoHome && (
                <Button onClick={onGoHome} variant="default" size="sm">
                  <Home className="h-4 w-4 mr-2" />
                  Go Home
                </Button>
              )}
            </div>
          </CardContent>
        )}
      </Card>
    );
  }

  return (
    <div className={cn("py-8", className)}>
      {content}
    </div>
  );
}

export function ApiErrorDisplay({ 
  error, 
  onRetry, 
  className 
}: { 
  error: string | Error; 
  onRetry?: () => void;
  className?: string;
}) {
  const errorMessage = typeof error === 'string' ? error : error.message;
  
  return (
    <ErrorDisplay
      title="Failed to load data"
      message={errorMessage}
      onRetry={onRetry}
      className={className}
      variant="inline"
    />
  );
}

export function NetworkErrorDisplay({ onRetry }: { onRetry?: () => void }) {
  return (
    <ErrorDisplay
      title="Network Error"
      message="Unable to connect to the server. Please check your internet connection and try again."
      onRetry={onRetry}
      variant="card"
    />
  );
}

export function NotFoundError({ onGoHome }: { onGoHome?: () => void }) {
  return (
    <ErrorDisplay
      title="Page Not Found"
      message="The page you're looking for doesn't exist or has been moved."
      onGoHome={onGoHome}
      variant="fullpage"
    />
  );
} 