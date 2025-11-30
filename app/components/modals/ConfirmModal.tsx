"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ReactNode, useState } from "react";

interface ConfirmModalProps {
  title?: string;
  description?: string;
  onConfirm: () => Promise<boolean> | boolean; // ✅ async-aware
  children: ReactNode;
}

export function ConfirmModal({
  title = "Are you sure?",
  description = "This action cannot be undone.",
  onConfirm,
  children,
}: ConfirmModalProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false); // ✅ optional loading UI

  const handleConfirm = async () => {
    setLoading(true);
    const success = await onConfirm(); // ✅ wait for result
    setLoading(false);
    if (success) {
      setOpen(false); // ✅ only close if success
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex justify-end gap-2">
          <Button
            variant="ghost"
            onClick={() => setOpen(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={loading}
          >
            {loading ? "Deleting..." : "Confirm"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
