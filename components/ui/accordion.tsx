"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface AccordionContextValue {
  openItems: Set<string>;
  toggleItem: (value: string) => void;
}

const AccordionContext = React.createContext<AccordionContextValue | null>(null);

interface AccordionProps {
  children: React.ReactNode;
  type?: "single" | "multiple";
  defaultValue?: string | string[];
  className?: string;
}

export function Accordion({
  children,
  type = "single",
  defaultValue,
  className,
}: AccordionProps) {
  const [openItems, setOpenItems] = React.useState<Set<string>>(() => {
    if (!defaultValue) return new Set();
    if (type === "single") {
      return new Set([defaultValue as string]);
    }
    return new Set(defaultValue as string[]);
  });

  const toggleItem = React.useCallback(
    (value: string) => {
      setOpenItems((prev) => {
        const next = new Set(prev);
        if (next.has(value)) {
          next.delete(value);
        } else {
          if (type === "single") {
            next.clear();
          }
          next.add(value);
        }
        return next;
      });
    },
    [type]
  );

  return (
    <AccordionContext.Provider value={{ openItems, toggleItem }}>
      <div className={cn("space-y-2", className)}>{children}</div>
    </AccordionContext.Provider>
  );
}

interface AccordionItemProps {
  value: string;
  children: React.ReactNode;
  className?: string;
}

export function AccordionItem({ value, children, className }: AccordionItemProps) {
  return <div className={cn("border border-titan-border rounded-lg", className)}>{children}</div>;
}

interface AccordionTriggerProps {
  value: string;
  children: React.ReactNode;
  className?: string;
}

export function AccordionTrigger({
  value,
  children,
  className,
}: AccordionTriggerProps) {
  const context = React.useContext(AccordionContext);
  if (!context) throw new Error("AccordionTrigger must be inside Accordion");

  const isOpen = context.openItems.has(value);

  return (
    <button
      type="button"
      onClick={() => context.toggleItem(value)}
      className={cn(
        "flex w-full items-center justify-between p-4 text-left transition-colors hover:bg-gray-800/50",
        className
      )}
    >
      <span className="font-medium">{children}</span>
      <ChevronDown
        className={cn(
          "h-4 w-4 transition-transform text-gray-400",
          isOpen && "transform rotate-180"
        )}
      />
    </button>
  );
}

interface AccordionContentProps {
  value: string;
  children: React.ReactNode;
  className?: string;
}

export function AccordionContent({
  value,
  children,
  className,
}: AccordionContentProps) {
  const context = React.useContext(AccordionContext);
  if (!context) throw new Error("AccordionContent must be inside Accordion");

  const isOpen = context.openItems.has(value);

  if (!isOpen) return null;

  return (
    <div className={cn("px-4 pb-4 text-sm text-gray-400", className)}>
      {children}
    </div>
  );
}
