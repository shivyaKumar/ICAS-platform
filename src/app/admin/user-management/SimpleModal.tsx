"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface SimpleModalProps {
  open: boolean;
  title: string;
  description?: string;
  onOpenChange: (open: boolean) => void;
  size?: "default" | "lg" | "xl";
  children: React.ReactNode;
  footer: React.ReactNode;
}

export function SimpleModal({
  open,
  title,
  description,
  onOpenChange,
  size = "default",
  children,
  footer,
}: SimpleModalProps) {
  const width =
    size === "xl" ? "sm:max-w-xl" : size === "lg" ? "sm:max-w-lg" : "sm:max-w-md";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={width}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <div className="space-y-4">{children}</div>
        <DialogFooter>{footer}</DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
