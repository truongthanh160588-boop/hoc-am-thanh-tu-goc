"use client";

import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Alert, AlertDescription, AlertTitle } from "./alert";

interface ToastProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description: string;
  variant?: "default" | "success" | "error";
}

export function Toast({
  open,
  onClose,
  title,
  description,
  variant = "default",
}: ToastProps) {
  React.useEffect(() => {
    if (open) {
      const timer = setTimeout(() => {
        onClose();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 w-full max-w-sm">
      <Alert variant={variant}>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            {title && <AlertTitle>{title}</AlertTitle>}
            <AlertDescription>{description}</AlertDescription>
          </div>
          <button
            onClick={onClose}
            className="ml-4 rounded-sm opacity-70 hover:opacity-100 transition-opacity"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </Alert>
    </div>
  );
}
