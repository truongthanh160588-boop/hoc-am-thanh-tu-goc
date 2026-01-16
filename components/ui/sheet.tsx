"use client";

import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./button";

interface SheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
  side?: "left" | "right";
}

const Sheet = ({ open, onOpenChange, children, side = "left" }: SheetProps) => {
  React.useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-black/50"
        onClick={() => onOpenChange(false)}
      />
      <div
        className={cn(
          "fixed z-50 h-full w-80 bg-titan-card border-titan-border border-r shadow-lg transition-transform",
          side === "left" ? "left-0" : "right-0"
        )}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between p-4 border-b border-titan-border">
            <h2 className="text-lg font-semibold text-gray-200">Menu</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex-1 overflow-y-auto">{children}</div>
        </div>
      </div>
    </>
  );
};

export { Sheet };
