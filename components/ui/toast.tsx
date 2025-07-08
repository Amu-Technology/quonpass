import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ToastProps {
  id: string;
  title: string;
  description?: string;
  variant?: "default" | "destructive";
  onDismiss: (id: string) => void;
}

export function Toast({
  id,
  title,
  description,
  variant = "default",
  onDismiss,
}: ToastProps) {
  return (
    <div
      className={cn(
        "fixed top-4 right-4 z-50 w-96 max-w-sm bg-white border rounded-lg shadow-lg p-4 transition-all duration-300 ease-in-out",
        variant === "destructive" && "border-red-200 bg-red-50",
        variant === "default" && "border-gray-200",
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h4
            className={cn(
              "font-medium text-sm",
              variant === "destructive" ? "text-red-900" : "text-gray-900",
            )}
          >
            {title}
          </h4>
          {description && (
            <p
              className={cn(
                "text-sm mt-1",
                variant === "destructive" ? "text-red-700" : "text-gray-600",
              )}
            >
              {description}
            </p>
          )}
        </div>
        <button
          onClick={() => onDismiss(id)}
          className={cn(
            "ml-4 flex-shrink-0 p-1 rounded-md hover:bg-gray-100 transition-colors",
            variant === "destructive" && "hover:bg-red-100",
          )}
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

interface ToastContainerProps {
  toasts: Array<{
    id: string;
    title: string;
    description?: string;
    variant?: "default" | "destructive";
  }>;
  onDismiss: (id: string) => void;
}

export function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast, index) => (
        <div
          key={toast.id}
          style={{
            transform: `translateY(${index * 80}px)`,
          }}
        >
          <Toast
            id={toast.id}
            title={toast.title}
            description={toast.description}
            variant={toast.variant}
            onDismiss={onDismiss}
          />
        </div>
      ))}
    </div>
  );
}
