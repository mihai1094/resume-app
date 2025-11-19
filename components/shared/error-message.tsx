import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface ErrorMessageProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorMessage({
  title = "Something went wrong",
  message,
  onRetry,
  className,
}: ErrorMessageProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-destructive" />
          <CardTitle>{title}</CardTitle>
        </div>
        <CardDescription>{message}</CardDescription>
      </CardHeader>
      {onRetry && (
        <CardContent>
          <Button onClick={onRetry} variant="outline">
            Try Again
          </Button>
        </CardContent>
      )}
    </Card>
  );
}

/**
 * Full-page error display
 */
export function ErrorPage({
  title,
  message,
  onRetry,
}: Omit<ErrorMessageProps, "className">) {
  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <ErrorMessage title={title} message={message} onRetry={onRetry} className="max-w-md" />
    </div>
  );
}

