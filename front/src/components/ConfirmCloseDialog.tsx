import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, X } from "lucide-react";

interface ConfirmCloseDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  showWarning?: boolean;
}

const ConfirmCloseDialog: React.FC<ConfirmCloseDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Are you sure you want to leave?",
  message = "Your session will be lost and any unsaved work may not be preserved.",
  confirmText = "Leave Page",
  cancelText = "Stay",
  showWarning = true,
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
    } else {
      // Add a small delay for smooth animation
      const timer = setTimeout(() => setIsVisible(false), 150);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  const handleCancel = () => {
    onClose();
  };

  if (!isVisible) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            {showWarning && (
              <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
            )}
            <div>
              <DialogTitle className="text-lg font-semibold text-gray-900">
                {title}
              </DialogTitle>
              <DialogDescription className="text-sm text-gray-600 mt-1">
                {message}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <DialogFooter className="flex gap-3 sm:gap-2">
          <Button
            variant="outline"
            onClick={handleCancel}
            className="flex-1 sm:flex-none"
          >
            {cancelText}
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            className="flex-1 sm:flex-none"
          >
            {confirmText}
          </Button>
        </DialogFooter>

        {/* Close button for mobile */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>
      </DialogContent>
    </Dialog>
  );
};

export default ConfirmCloseDialog;
